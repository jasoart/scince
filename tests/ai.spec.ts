import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });

async function openTutor(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "開啟選單", exact: true }).click();
  await page.getByRole("button", { name: /AI 學習夥伴/ }).click();
  await expect(
    page.getByRole("heading", { name: "把「不懂」變成下一個發現。" }),
  ).toBeVisible();
}

test("390px tutor retrieves actual sources offline without automatic model downloads", async ({
  page,
  context,
}) => {
  const modelRequests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (/huggingface\.co|xethub\.hf\.co|cdn-lfs|web-llm-models/.test(url)) {
      modelRequests.push(url);
      await route.abort();
    } else await route.continue();
  });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: undefined,
    }),
  );
  await openTutor(page);
  const tutor = page.locator(".ai-tutor");
  await expect(tutor.getByText(/這是關鍵詞檢索，沒有模型推論/)).toBeVisible();
  await tutor.getByRole("button", { name: "速度與加速度差在哪？" }).click();
  await expect(
    tutor.locator(".ai-source-card").first().getByRole("heading"),
  ).toHaveText("把運動變成圖像");
  await expect(tutor.locator(".ai-source-reference").first()).toContainText(
    "physics-motion",
  );
  await context.setOffline(true);
  await tutor.getByLabel("你的自然科問題").fill("減數分裂如何產生遺傳變異？");
  await tutor.getByRole("button", { name: "檢索教材", exact: true }).click();
  await expect(
    tutor.locator(".ai-source-card").first().getByRole("heading"),
  ).toHaveText("減數分裂與遺傳多樣性");
  await expect(tutor.locator(".ai-model-answer")).toHaveCount(0);
  await tutor.getByRole("button", { name: /Qwen 本機助教/ }).click();
  await expect(
    tutor.getByText("這個瀏覽器未開放 WebGPU。你仍可搜尋本機教材與公式。"),
  ).toBeVisible();
  await expect(
    tutor.getByRole("button", { name: "下載並載入模型", exact: true }),
  ).toBeDisabled();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  expect(modelRequests).toEqual([]);
});

test("customization exports, validates JSON imports, and persists without model downloads", async ({
  page,
}) => {
  await openTutor(page);
  const tutor = page.locator(".ai-tutor");
  await tutor.getByRole("button", { name: "客製助教", exact: true }).click();
  await tutor
    .getByLabel("學習目標", { exact: true })
    .fill("理解單位與適用條件");
  const pendingDownload = page.waitForEvent("download");
  await tutor.getByRole("button", { name: "匯出 JSON", exact: true }).click();
  const download = await pendingDownload;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.goal).toBe("理解單位與適用條件");
  expect(exported.contextWindow).toBe(1024);
  expect(exported.maxTokens).toBe(160);
  expect(exported).not.toHaveProperty("messages");
  const fileInput = tutor.locator("input[type=file]");
  await fileInput.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...exported,
        modelId: "https://untrusted.invalid/model",
      }),
    ),
  });
  await expect(tutor.getByRole("alert")).toContainText(
    "模型必須選用支援的 Qwen2.5",
  );
  await fileInput.setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...exported,
        goal: "學會以受力圖分析運動",
        temperature: 0.6,
        mode: "exam",
      }),
    ),
  });
  await expect(tutor.getByLabel("學習目標", { exact: true })).toHaveValue(
    "學會以受力圖分析運動",
  );
  await expect(tutor.getByRole("slider")).toHaveValue("0.6");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("scince-tutor-settings-v1")!).goal,
      ),
    )
    .toBe("學會以受力圖分析運動");
  await page.reload();
  await page.getByRole("button", { name: "開啟選單", exact: true }).click();
  await page.getByRole("button", { name: /AI 學習夥伴/ }).click();
  await tutor.getByRole("button", { name: "客製助教", exact: true }).click();
  await expect(tutor.getByLabel("學習目標", { exact: true })).toHaveValue(
    "學會以受力圖分析運動",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("simulated worker initialization error returns to an actionable UI", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: {
        requestAdapter: async () => ({
          features: new Set(["shader-f16"]),
          limits: { maxStorageBufferBindingSize: 512 * 1024 * 1024 },
        }),
      },
    });
    class FailingWorker extends EventTarget {
      onmessage: unknown;
      postMessage() {
        queueMicrotask(() =>
          this.dispatchEvent(
            new ErrorEvent("error", { message: "SIMULATED_GPU_FAILURE" }),
          ),
        );
      }
      terminate() {
        /* An intentionally fake worker never loads model assets. */
      }
    }
    Object.defineProperty(window, "Worker", {
      configurable: true,
      value: FailingWorker,
    });
  });
  await openTutor(page);
  const tutor = page.locator(".ai-tutor");
  await tutor.getByRole("button", { name: /Qwen 本機助教/ }).click();
  const load = tutor.getByRole("button", {
    name: "下載並載入模型",
    exact: true,
  });
  await expect(load).toBeEnabled();
  await load.click();
  await expect(tutor.getByRole("alert")).toContainText("SIMULATED_GPU_FAILURE");
  await expect(load).toBeEnabled();
  await expect(tutor.getByRole("progressbar")).toHaveCount(0);
});

test("canceling a stalled simulated worker actually terminates it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: {
        requestAdapter: async () => ({
          features: new Set(["shader-f16"]),
          limits: { maxStorageBufferBindingSize: 512 * 1024 * 1024 },
        }),
      },
    });
    Object.defineProperty(window, "__tutorTerminated", {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(window, "__tutorStarted", {
      configurable: true,
      writable: true,
      value: 0,
    });
    class StalledWorker {
      onmessage: unknown;
      constructor() {
        const counter = window as unknown as { __tutorStarted: number };
        counter.__tutorStarted += 1;
      }
      addEventListener() {
        /* Intentionally never resolves initialization. */
      }
      postMessage() {
        /* Intentionally never resolves initialization. */
      }
      terminate() {
        const counter = window as unknown as { __tutorTerminated: number };
        counter.__tutorTerminated += 1;
      }
    }
    Object.defineProperty(window, "Worker", {
      configurable: true,
      value: StalledWorker,
    });
  });
  await openTutor(page);
  const tutor = page.locator(".ai-tutor");
  await tutor.getByRole("button", { name: /Qwen 本機助教/ }).click();
  await tutor
    .getByRole("button", { name: "下載並載入模型", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __tutorStarted: number }).__tutorStarted,
      ),
    )
    .toBe(1);
  await tutor
    .getByRole("button", { name: "取消下載／載入", exact: true })
    .click();
  await expect(
    tutor.getByRole("button", { name: "下載並載入模型", exact: true }),
  ).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __tutorTerminated: number })
            .__tutorTerminated,
      ),
    )
    .toBeGreaterThanOrEqual(1);
});
