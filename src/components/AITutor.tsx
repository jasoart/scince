import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  Cpu,
  Download,
  FileDown,
  FileUp,
  HardDrive,
  LoaderCircle,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { composePrompt, retrieveLessons } from "../ai/retrieval";
import type { LessonMatch } from "../ai/retrieval";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  MODEL_IDS,
  saveSettings,
  validateSettings,
} from "../ai/settings";
import type { GuideMode, TutorSettings } from "../ai/settings";
import { detectGPU, TutorRuntime } from "../ai/runtime";
import type { GPUCapability } from "../ai/runtime";
import { ScienceFormula, ScienceText } from "../render/ScienceRenderer";
import "./AITutor.css";

type Status =
  | "idle"
  | "loading"
  | "ready"
  | "generating"
  | "clearing"
  | "error";
const subjectNames = {
  physics: "物理",
  chemistry: "化學",
  biology: "生物",
  earth: "地科",
};
const suggestions = [
  "速度與加速度差在哪？",
  "如何判斷化學平衡的移動？",
  "減數分裂如何產生遺傳變異？",
  "地震 P 波與 S 波有何差異？",
];

function modelKey(settings: TutorSettings) {
  return `${settings.modelId}:${settings.contextWindow}`;
}

export default function AITutor({ context = "" }: { context?: string }) {
  const [settings, setSettings] = useState<TutorSettings>(loadSettings);
  const [tab, setTab] = useState<"local" | "model">("local");
  const [gpu, setGPU] = useState<GPUCapability | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [matches, setMatches] = useState<LessonMatch[]>([]);
  const [answer, setAnswer] = useState("");
  const [answerNote, setAnswerNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState({ progress: 0, text: "" });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [storageMB, setStorageMB] = useState<number | null>(null);
  const runtime = useRef(new TutorRuntime());
  const actionId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    detectGPU().then((result) => {
      if (active) setGPU(result);
    });
    navigator.storage
      ?.estimate?.()
      .then((result) => {
        if (active && result.quota !== undefined)
          setStorageMB(
            Math.round((result.quota - (result.usage ?? 0)) / 1024 / 1024),
          );
      })
      .catch(() => {
        /* A storage estimate is optional, not a readiness check. */
      });
    const instance = runtime.current;
    return () => {
      active = false;
      actionId.current += 1;
      instance.terminate();
    };
  }, []);

  useEffect(() => {
    if (!saveSettings(settings))
      setNotice("瀏覽器無法儲存設定；本次工作階段仍可使用，請匯出 JSON 備份。");
  }, [settings]);

  const busy =
    status === "loading" || status === "generating" || status === "clearing";
  const needsReload = loadedKey !== null && loadedKey !== modelKey(settings);
  const f16Missing =
    settings.modelId === MODEL_IDS[0] && gpu !== null && !gpu.f16;
  const canLoad = Boolean(gpu?.supported) && !f16Missing && !busy;
  const canGenerate = status === "ready" && loadedKey === modelKey(settings);

  function update<K extends keyof TutorSettings>(
    key: K,
    value: TutorSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function release(message = "已釋放 GPU 與模型。已下載的快取仍保留。") {
    actionId.current += 1;
    runtime.current.terminate();
    setLoadedKey(null);
    setStatus("idle");
    setError("");
    setNotice(message);
  }

  async function loadModel() {
    const id = ++actionId.current;
    setStatus("loading");
    setError("");
    setNotice("");
    setLoadedKey(null);
    setProgress({ progress: 0, text: "正在啟動獨立的模型 Worker…" });
    try {
      await runtime.current.load(
        settings,
        (report) => {
          if (id === actionId.current) setProgress(report);
        },
        (message) => {
          if (id !== actionId.current) return;
          setError(`模型 Worker 已停止：${message}`);
          setLoadedKey(null);
          setStatus("error");
        },
      );
      if (id !== actionId.current) return;
      setLoadedKey(modelKey(settings));
      setStatus("ready");
      setNotice(
        "模型已在本機載入。提問與推論不會送到雲端；首次載入需網路下載模型。",
      );
    } catch (cause) {
      if (id !== actionId.current) return;
      setStatus("error");
      setLoadedKey(null);
      setError(
        `載入失敗：${cause instanceof Error ? cause.message : "未知錯誤"}。請檢查網路、瀏覽器儲存空間與 GPU 記憶體，或改用離線檢索。`,
      );
    }
  }

  async function clearCache() {
    const id = ++actionId.current;
    setStatus("clearing");
    setError("");
    setLoadedKey(null);
    try {
      await runtime.current.clearCache(settings.modelId);
      if (id !== actionId.current) return;
      setStatus("idle");
      setNotice(
        "已清除此量化版本的模型、設定與 WASM 快取。下次載入需重新下載。",
      );
    } catch (cause) {
      if (id !== actionId.current) return;
      setStatus("error");
      setError(
        `快取清除失敗：${cause instanceof Error ? cause.message : "瀏覽器拒絕儲存操作"}。可到瀏覽器的網站資料設定檢查。`,
      );
    }
  }

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setQuery(question);
    setSearchedQuery(question);
    setAnswer("");
    setAnswerNote("");
    setError("");
    const found = retrieveLessons(question);
    setMatches(found);
    if (tab === "local") return;
    if (!canGenerate) {
      setNotice("已先完成本機教材檢索。若要模型推論，請先下載並載入模型。");
      return;
    }
    if (!found.length) {
      setAnswerNote(
        "沒有找到可引用的本機教材，因此未啟動模型推論。請改用更明確的自然科關鍵詞。",
      );
      return;
    }
    const prompt = composePrompt(question, context, found, settings);
    if (!prompt.hasSource) {
      setAnswerNote(
        "這次的上下文空間不足以放入教材，請縮短問題或增加上下文後重新載入。未啟動模型推論。",
      );
      return;
    }
    if (prompt.clipped)
      setAnswerNote(
        "為配合目前上下文，指令或教材摘錄已縮短。下方教學卡保留完整原文；每次提問皆獨立，不保留對話記憶。",
      );
    const id = ++actionId.current;
    setStatus("generating");
    try {
      await runtime.current.generate(
        prompt.system,
        prompt.user,
        settings,
        (text) => {
          if (id === actionId.current) setAnswer(text);
        },
      );
      if (id !== actionId.current) return;
      setStatus("ready");
    } catch (cause) {
      if (id !== actionId.current) return;
      // A failed GPU task may invalidate the device; require an explicit reload.
      runtime.current.terminate();
      setLoadedKey(null);
      setStatus("error");
      setError(
        `推論中止：${cause instanceof Error ? cause.message : "GPU 執行失敗"}。可縮短問題、減少輸出或重新載入；教學卡仍可閱讀。`,
      );
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(query);
  }

  function exportSettings() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(settings, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "scince-tutor-settings.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("已匯出角色、參數與學習目標；檔案不含提問紀錄或模型權重。");
  }

  async function importSettings(file: File) {
    try {
      if (file.size > 20_000) throw new Error("設定檔不可超過 20 KB。");
      setSettings(validateSettings(JSON.parse(await file.text())));
      setNotice("已匯入並儲存設定。若模型或上下文有變更，請重新載入模型。");
      setError("");
    } catch (cause) {
      setError(
        `匯入失敗：${cause instanceof Error ? cause.message : "不是有效的 JSON 設定檔"}`,
      );
    }
  }

  return (
    <section className="ai-tutor" aria-labelledby="ai-tutor-title">
      <div className="ai-tutor-heading">
        <div>
          <span className="ai-eyebrow">
            <Sparkles size={14} /> YOUR PERSONAL SCIENCE COMPANION
          </span>
          <h2 id="ai-tutor-title">把「不懂」變成下一個發現。</h2>
          <p>先找到觀念的出處，再一步步想通。你的學習節奏，由你設定。</p>
        </div>
        <button
          className={`ai-icon-button${showSettings ? " active" : ""}`}
          onClick={() => setShowSettings(!showSettings)}
          aria-label="客製助教"
          aria-expanded={showSettings}
          aria-controls="tutor-settings"
        >
          <Settings2 size={18} />
          <span>客製助教</span>
        </button>
      </div>

      <div className="ai-mode-tabs" role="group" aria-label="助教運作方式">
        <button
          className={tab === "local" ? "selected" : ""}
          onClick={() => setTab("local")}
          aria-pressed={tab === "local"}
        >
          <BookOpen size={16} />
          離線觀念檢索<span>立即使用</span>
        </button>
        <button
          className={tab === "model" ? "selected" : ""}
          onClick={() => setTab("model")}
          aria-pressed={tab === "model"}
        >
          <Cpu size={16} />
          Qwen 本機助教<span>WebGPU</span>
        </button>
      </div>

      {showSettings && (
        <section
          className="ai-settings"
          id="tutor-settings"
          aria-label="助教客製設定"
        >
          <div className="ai-settings-title">
            <div>
              <h3>你的助教，你來定義</h3>
              <p>
                調整角色、引導方式與本機推論參數。這些是提示詞與教材檢索客製，並非
                LoRA 微調。
              </p>
            </div>
            <button
              className="ai-icon-only"
              aria-label="關閉客製設定"
              onClick={() => setShowSettings(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="ai-settings-grid">
            <label className="ai-field ai-field-wide">
              角色指令
              <textarea
                value={settings.systemPrompt}
                maxLength={1200}
                onChange={(event) => update("systemPrompt", event.target.value)}
                rows={3}
              />
            </label>
            <label className="ai-field">
              學習目標
              <input
                value={settings.goal}
                maxLength={300}
                onChange={(event) => update("goal", event.target.value)}
              />
            </label>
            <label className="ai-field">
              引導方式
              <select
                value={settings.mode}
                onChange={(event) =>
                  update("mode", event.target.value as GuideMode)
                }
              >
                <option value="socratic">引導思考 · 先問再提示</option>
                <option value="explain">觀念說明 · 逐步解釋</option>
                <option value="exam">解題分析 · 已知與所求</option>
              </select>
            </label>
            <label className="ai-field ai-field-wide">
              量化模型
              <select
                value={settings.modelId}
                disabled={busy}
                onChange={(event) =>
                  update(
                    "modelId",
                    event.target.value as TutorSettings["modelId"],
                  )
                }
              >
                <option value={MODEL_IDS[0]}>
                  Qwen2.5 1.5B · q4f16_1（需 shader-f16）
                </option>
                <option value={MODEL_IDS[1]}>
                  Qwen2.5 1.5B · q4f32_1（使用更多記憶體）
                </option>
              </select>
            </label>
            <label className="ai-field">
              溫度{" "}
              <span className="ai-value">
                {settings.temperature.toFixed(2)}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.temperature}
                onChange={(event) =>
                  update("temperature", Number(event.target.value))
                }
              />
              <small>越低越穩定；不代表答案一定正確。</small>
            </label>
            <label className="ai-field">
              輸出上限（tokens）
              <input
                type="number"
                min={32}
                max={512}
                value={settings.maxTokens}
                onChange={(event) => {
                  const n = Number(event.target.value);
                  if (Number.isInteger(n) && n >= 32 && n <= 512)
                    update("maxTokens", n);
                }}
              />
            </label>
            <label className="ai-field">
              上下文（tokens）
              <select
                value={settings.contextWindow}
                disabled={busy}
                onChange={(event) =>
                  update(
                    "contextWindow",
                    Number(
                      event.target.value,
                    ) as TutorSettings["contextWindow"],
                  )
                }
              >
                <option value={1024}>1024 · 手機優先</option>
                <option value={2048}>2048 · 較長教材</option>
                <option value={4096}>4096 · 更多記憶體</option>
              </select>
              <small>變更後需重新載入；每題重新開始。</small>
            </label>
            <div className="ai-field ai-setting-actions">
              <button className="ai-secondary" onClick={exportSettings}>
                <FileDown size={15} />
                匯出 JSON
              </button>
              <button
                className="ai-secondary"
                onClick={() => fileInput.current?.click()}
              >
                <FileUp size={15} />
                匯入 JSON
              </button>
              <button
                className="ai-text-button"
                disabled={busy}
                onClick={() => {
                  setSettings({ ...DEFAULT_SETTINGS });
                  setNotice("已恢復預設參數。模型或上下文變更後，請重新載入。");
                }}
              >
                恢復預設
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importSettings(file);
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </section>
      )}

      {tab === "model" && (
        <section className="ai-device-card" aria-label="本機模型狀態">
          <div className="ai-device-heading">
            <div className="ai-device-icon">
              <Cpu size={23} />
            </div>
            <div>
              <h3>
                Qwen2.5 · 1.5B Instruct <span>4-bit</span>
              </h3>
              <p>{gpu?.reason ?? "正在檢查瀏覽器的 WebGPU 能力…"}</p>
            </div>
            <span className={`ai-state ${canGenerate ? "ready" : ""}`}>
              {status === "generating"
                ? "推論中"
                : status === "loading"
                  ? "載入中"
                  : canGenerate
                    ? "已就緒"
                    : "尚未載入"}
            </span>
          </div>
          <div className="ai-device-facts">
            <span>
              <Download size={14} />
              首次下載估計約 1–1.5 GB
            </span>
            <span>
              <Cpu size={14} />
              官方 GPU 估值{" "}
              {settings.modelId === MODEL_IDS[0] ? "1,630" : "1,889"} MB
            </span>
            <span>
              <HardDrive size={14} />
              {storageMB !== null
                ? `瀏覽器估計可用 ${storageMB.toLocaleString()} MB`
                : "儲存額度由瀏覽器管理"}
            </span>
          </div>
          {gpu?.supported && (
            <p className="ai-small">
              shader-f16：{gpu.f16 ? "支援" : "未提供"} · 單一儲存緩衝區上限{" "}
              {gpu.bufferMB} MB。這些能力無法保證模型載入成功。
            </p>
          )}
          <p className="ai-small">
            版面支援 390px 手機寬度；尚未以 iPhone 13
            實機驗證。裝置記憶體、瀏覽器版本與 GPU
            驅動會影響相容性。首次下載請使用穩定網路。
          </p>
          {f16Missing && gpu?.supported && (
            <p className="ai-warning">
              這個 GPU 未提供 shader-f16。可在客製設定改選
              q4f32_1，但記憶體需求更高；離線檢索可直接使用。
            </p>
          )}
          {needsReload && (
            <p className="ai-warning">
              模型或上下文已變更。請重新載入，套用新設定。
            </p>
          )}
          {status === "loading" && (
            <div className="ai-progress" role="status">
              <div className="ai-progress-label">
                <span>
                  <LoaderCircle size={14} className="ai-spin" />
                  下載與初始化
                </span>
                <strong>
                  {Math.round(
                    Math.max(0, Math.min(1, progress.progress)) * 100,
                  )}
                  %
                </strong>
              </div>
              <progress
                max={1}
                value={Math.max(0, Math.min(1, progress.progress))}
                aria-label="模型初始化進度"
              />
              <p>{progress.text}</p>
              <small>
                進度由 WebLLM 回報，包含下載、載入與編譯，並非精確下載位元組。
              </small>
            </div>
          )}
          <div className="ai-device-actions">
            {status === "loading" ? (
              <button
                className="ai-secondary"
                onClick={() =>
                  release(
                    "已取消載入並終止 Worker。部分下載快取可能保留，可重新載入或清除快取。",
                  )
                }
              >
                <X size={15} />
                取消下載／載入
              </button>
            ) : (
              <button
                className="ai-primary"
                disabled={!canLoad || (canGenerate && !needsReload)}
                onClick={() => void loadModel()}
              >
                {canGenerate ? <Check size={16} /> : <Download size={16} />}
                {canGenerate
                  ? "模型已在本機就緒"
                  : needsReload
                    ? "重新載入模型"
                    : "下載並載入模型"}
              </button>
            )}
            {loadedKey && (
              <button className="ai-secondary" onClick={() => release()}>
                <Square size={14} />
                釋放 GPU
              </button>
            )}
            <button
              className="ai-text-button"
              disabled={busy}
              onClick={() => void clearCache()}
            >
              <Trash2 size={14} />
              清除此版本快取
            </button>
          </div>
        </section>
      )}

      {error && (
        <div className="ai-alert error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="ai-alert" role="status">
          {notice}
          <button
            className="ai-icon-only"
            onClick={() => setNotice("")}
            aria-label="關閉訊息"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="ai-conversation">
        <div className="ai-welcome">
          <span className="ai-welcome-icon">✳</span>
          <div>
            <h3>
              {tab === "local"
                ? "從一個好問題開始。"
                : "想一想，再一起找答案。"}
            </h3>
            <p>
              {tab === "local"
                ? "搜尋本站原創教材，找出概念、公式與常見迷思。這是關鍵詞檢索，沒有模型推論。"
                : "以本機教材作為參考，透過 Qwen 引導思考。小型模型仍可能出錯，請對照來源。"}
            </p>
          </div>
        </div>
        {context && (
          <p className="ai-current-context">
            <BookOpen size={14} />
            目前學習脈絡：{context}
          </p>
        )}
        <div className="ai-suggestions">
          {suggestions.map((text) => (
            <button key={text} onClick={() => void ask(text)} disabled={busy}>
              {text}
              <ArrowUp size={13} />
            </button>
          ))}
        </div>
        <form className="ai-composer" onSubmit={submit}>
          <label className="ai-sr-only" htmlFor="tutor-question">
            你的自然科問題
          </label>
          <textarea
            id="tutor-question"
            value={query}
            maxLength={320}
            rows={2}
            placeholder="例如：為什麼等速圓周運動仍然有加速度？"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void ask(query);
              }
            }}
          />
          <div className="ai-composer-bottom">
            <span>
              <ShieldCheck size={13} />
              {tab === "local"
                ? "本機教材 · 不需下載模型"
                : "本機推論 · 不傳送提問至雲端"}
            </span>
            {status === "generating" ? (
              <button
                type="button"
                className="ai-submit ai-stop"
                onClick={() => {
                  runtime.current.stop();
                  setAnswerNote(
                    "已要求停止生成。若 GPU 沒有回應，可點選「釋放 GPU」終止 Worker。",
                  );
                }}
                aria-label="停止生成"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="ai-submit"
                disabled={!query.trim() || busy}
                aria-label={tab === "local" ? "檢索教材" : "送出提問"}
              >
                <ArrowUp size={19} />
              </button>
            )}
          </div>
        </form>
        <p className="ai-composer-hint">
          {tab === "local"
            ? "檢索使用本機教材的標題、關鍵詞與原文；不會產生答案。"
            : `每次提問皆獨立 · ${settings.contextWindow} tokens 上下文 · 最多 ${settings.maxTokens} tokens 輸出`}
        </p>
      </div>

      {(answer || status === "generating") && (
        <article className="ai-model-answer" aria-label="Qwen 模型生成內容">
          <div className="ai-answer-label">
            <Sparkles size={15} />
            <strong>Qwen 本機生成</strong>
            <span>請核對下方教材</span>
          </div>
          <p aria-live="polite" aria-busy={status === "generating"}>
            <ScienceText text={answer || "正在整理教材中的概念…"} />
          </p>
        </article>
      )}
      {answerNote && <p className="ai-warning">{answerNote}</p>}
      {searchedQuery && (
        <div className="ai-search-results">
          <div className="ai-results-heading">
            <h3>
              <BookOpen size={17} />
              {tab === "local" ? "找到的教學卡" : "可核對的教材來源"}
            </h3>
            <span>
              {matches.length} 筆
              {tab === "local"
                ? "本站教材 · 原文摘錄"
                : "檢索來源 · 未驗證模型引文"}
            </span>
          </div>
          {matches.length ? (
            <div className="ai-source-grid">
              {matches.map(({ lesson }) => (
                <article className="ai-source-card" key={lesson.id}>
                  <div className="ai-source-meta">
                    <span>{subjectNames[lesson.subject]}</span>
                    <span>{lesson.chapter}</span>
                  </div>
                  <h4>{lesson.title}</h4>
                  <p>
                    <ScienceText text={lesson.explanation} />
                  </p>
                  {lesson.formulas.length > 0 && (
                    <div className="ai-source-formulas">
                      {lesson.formulas.slice(0, 2).map((formula) => (
                        <div key={formula.expression}>
                          <ScienceFormula
                            source={formula.expression}
                            kind={
                              lesson.subject === "chemistry" ? "auto" : "math"
                            }
                          />
                          <span>
                            <ScienceText text={formula.meaning} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <details>
                    <summary>
                      解題提醒與常見迷思
                      <ChevronDown size={14} />
                    </summary>
                    <ol>
                      {lesson.strategy.map((step) => (
                        <li key={step}>
                          <ScienceText text={step} />
                        </li>
                      ))}
                    </ol>
                    <p className="ai-misconception">
                      留意：
                      <ScienceText text={lesson.misconception} />
                    </p>
                  </details>
                  <div className="ai-source-reference">
                    來源：本站原創教材 · {lesson.id}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="ai-no-results">
              <BookOpen size={24} />
              <h4>還沒有找到對應教材</h4>
              <p>
                試試「加速度」「化學平衡」「遺傳」或「地震波」等具體概念。本站課程會保留可核對的觀念來源，不會自動補出未經核實的答案。
              </p>
            </div>
          )}
        </div>
      )}
      <p className="ai-footer-note">
        <ShieldCheck size={13} />
        設定只儲存在目前瀏覽器，可匯出備份。教材卡為本站原創內容；學習內容請核對來源。
      </p>
    </section>
  );
}
