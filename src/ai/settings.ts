export const MODEL_IDS = [
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f32_1-MLC",
] as const;

export type TutorModelId = (typeof MODEL_IDS)[number];
export type GuideMode = "socratic" | "explain" | "exam";

export interface TutorSettings {
  schemaVersion: 1;
  modelId: TutorModelId;
  systemPrompt: string;
  goal: string;
  mode: GuideMode;
  temperature: number;
  maxTokens: number;
  contextWindow: 1024 | 2048 | 4096;
}

export const DEFAULT_SETTINGS: TutorSettings = {
  schemaVersion: 1,
  modelId: MODEL_IDS[0],
  systemPrompt:
    "你是學測自然助教。用繁體中文，先釐清概念，再說明公式的條件與單位。",
  goal: "理解概念，能自己解出下一題",
  mode: "socratic",
  temperature: 0.2,
  maxTokens: 160,
  contextWindow: 1024,
};

export const SETTINGS_KEY = "scince-tutor-settings-v1";

export function validateSettings(value: unknown): TutorSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("設定必須是 JSON 物件。");
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== 1)
    throw new Error("僅支援 schemaVersion: 1 的設定。");
  if (!MODEL_IDS.includes(v.modelId as TutorModelId))
    throw new Error("模型必須選用支援的 Qwen2.5 1.5B 量化版本。");
  if (typeof v.systemPrompt !== "string" || v.systemPrompt.length > 1200)
    throw new Error("角色指令長度上限為 1,200 字。");
  if (typeof v.goal !== "string" || v.goal.length > 300)
    throw new Error("學習目標長度上限為 300 字。");
  if (!["socratic", "explain", "exam"].includes(String(v.mode)))
    throw new Error("引導模式無效。");
  if (
    typeof v.temperature !== "number" ||
    !Number.isFinite(v.temperature) ||
    v.temperature < 0 ||
    v.temperature > 1
  )
    throw new Error("溫度須介於 0 與 1。");
  if (
    ![1024, 2048, 4096].includes(Number(v.contextWindow)) ||
    typeof v.contextWindow !== "number"
  )
    throw new Error("上下文須為 1024、2048 或 4096。");
  if (
    typeof v.maxTokens !== "number" ||
    !Number.isInteger(v.maxTokens) ||
    v.maxTokens < 32 ||
    v.maxTokens > 512 ||
    v.maxTokens > Number(v.contextWindow) / 2
  )
    throw new Error("輸出上限須為 32–512 的整數，且不可超過上下文的一半。");
  return {
    schemaVersion: 1,
    modelId: v.modelId as TutorModelId,
    systemPrompt: v.systemPrompt,
    goal: v.goal,
    mode: v.mode as GuideMode,
    temperature: v.temperature,
    maxTokens: v.maxTokens,
    contextWindow: v.contextWindow as TutorSettings["contextWindow"],
  };
}

export function loadSettings(): TutorSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored
      ? validateSettings(JSON.parse(stored))
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: TutorSettings): boolean {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(validateSettings(settings)),
    );
    return true;
  } catch {
    return false;
  }
}
