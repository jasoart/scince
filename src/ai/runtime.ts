import type { InitProgressReport, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import type { TutorSettings } from "./settings";

interface AdapterLike {
  features: { has(feature: string): boolean };
  limits: { maxStorageBufferBindingSize: number };
}
interface GPUAccess {
  requestAdapter(): Promise<AdapterLike | null>;
}

export interface GPUCapability {
  supported: boolean;
  f16: boolean;
  bufferMB: number;
  reason: string;
}

export async function detectGPU(): Promise<GPUCapability> {
  const empty = { supported: false, f16: false, bufferMB: 0 };
  if (!window.isSecureContext)
    return {
      ...empty,
      reason: "WebGPU 需要 HTTPS 或 localhost。離線觀念檢索仍可使用。",
    };
  const gpu = (navigator as Navigator & { gpu?: GPUAccess }).gpu;
  if (!gpu)
    return {
      ...empty,
      reason: "這個瀏覽器未開放 WebGPU。你仍可搜尋本機教材與公式。",
    };
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter)
      return {
        ...empty,
        reason: "找不到可用的 GPU adapter。請使用離線觀念檢索。",
      };
    return {
      supported: true,
      f16: adapter.features.has("shader-f16"),
      bufferMB: Math.round(
        adapter.limits.maxStorageBufferBindingSize / 1024 / 1024,
      ),
      reason: "偵測到 WebGPU；仍需實際載入才能確認記憶體與驅動是否足夠。",
    };
  } catch (error) {
    return {
      ...empty,
      reason: `WebGPU 檢測失敗：${error instanceof Error ? error.message : "瀏覽器拒絕存取"}`,
    };
  }
}

/** Owns worker lifetime, so cancel also interrupts a stalled download or GPU task. */
export class TutorRuntime {
  private worker?: Worker;
  private engine?: WebWorkerMLCEngine;
  private abortPending?: (reason: Error) => void;
  private epoch = 0;

  async load(
    settings: TutorSettings,
    onProgress: (report: InitProgressReport) => void,
    onFatal: (message: string) => void,
  ): Promise<void> {
    this.terminate();
    const epoch = this.epoch;
    const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
    if (epoch !== this.epoch) throw new Error("已取消載入。");
    const worker = new Worker(new URL("./tutor.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    const abort = new Promise<never>((_, reject) => {
      this.abortPending = reject;
    });
    const fail = (message: string) => {
      if (epoch !== this.epoch) return;
      onFatal(message);
      this.terminate(message);
    };
    worker.addEventListener("error", (event) =>
      fail(event.message || "模型 Worker 啟動失敗。"),
    );
    worker.addEventListener("messageerror", () =>
      fail("模型 Worker 訊息解碼失敗。"),
    );
    try {
      const engine = await Promise.race([
        CreateWebWorkerMLCEngine(
          worker,
          settings.modelId,
          {
            initProgressCallback: (report) => {
              if (epoch === this.epoch) onProgress(report);
            },
            logLevel: "WARN",
          },
          { context_window_size: settings.contextWindow },
        ),
        abort,
      ]);
      if (epoch !== this.epoch) throw new Error("已取消載入。");
      this.engine = engine;
      this.abortPending = undefined;
    } catch (error) {
      if (epoch === this.epoch) this.terminate();
      throw error;
    }
  }

  async generate(
    system: string,
    user: string,
    settings: TutorSettings,
    onText: (text: string) => void,
  ): Promise<void> {
    const engine = this.engine;
    if (!engine) throw new Error("請先載入模型。");
    const epoch = this.epoch;
    const abort = new Promise<never>((_, reject) => {
      this.abortPending = reject;
    });
    const task = async () => {
      await engine.resetChat();
      const chunks = await engine.chat.completions.create({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: true,
      });
      let text = "";
      for await (const chunk of chunks) {
        if (epoch !== this.epoch) break;
        text += chunk.choices[0]?.delta.content ?? "";
        onText(text);
      }
    };
    try {
      await Promise.race([task(), abort]);
    } finally {
      if (epoch === this.epoch) this.abortPending = undefined;
    }
  }

  stop(): void {
    this.engine?.interruptGenerate();
  }

  terminate(reason = "已釋放模型並終止 Worker。"): void {
    this.epoch += 1;
    this.abortPending?.(new Error(reason));
    this.abortPending = undefined;
    this.worker?.terminate();
    this.worker = undefined;
    this.engine = undefined;
  }

  async clearCache(modelId: TutorSettings["modelId"]): Promise<void> {
    this.terminate();
    const { deleteModelAllInfoInCache } = await import("@mlc-ai/web-llm");
    await deleteModelAllInfoInCache(modelId);
  }
}
