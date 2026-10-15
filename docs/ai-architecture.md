# 本機自然科助教：實作範圍與部署路線

## 已實作的兩條路徑

1. **離線觀念檢索**：預設模式。對 `src/data/curriculum.ts` 的本站教材做確定性的中文雙字詞與英文關鍵詞比對，顯示原文、公式、解題策略與迷思。標題、標籤與概念的權重高於正文。無需模型、API key 或 GPU；這不是模型推論，也不是向量語意搜尋。不匹配時顯示沒有結果，不拼出假答案。
2. **Qwen 本機推論**：使用者明確點擊下載後，才動態載入 WebLLM SDK，建立獨立 module Worker，載入真正的 `MLCEngine`。只以本機檢索的教材摘錄與目前單元作為參考，不傳送提問到雲端。初次模型下載仍需網路；教材與已快取的模型能否持久離線使用，取決於瀏覽器快取保留與完整性。

```text
問題 ─→ 中文雙字詞／關鍵詞檢索 ─→ 本站 Lesson 原文教學卡
                  │
                  └─→ 有來源且使用者已載入模型
                       ─→ 可客製 system + 學習目標 + 引導模式
                       ─→ 保守上下文裁切
                       ─→ WebWorkerMLCEngine ─→ Worker 中的 MLCEngine
                       ─→ WebGPU 串流輸出（與原文卡分開標示）
```

沒有匹配到教材時，推論路徑會停止並請使用者調整關鍵詞。每次提問呼叫 `resetChat()`，不重送對話歷史，降低小裝置的上下文與 KV cache 負擔。這是教材輔助生成，並不保證回答正確，也不是歷屆題目官方正解服務。

## 模型與實際 SDK API

程式使用鎖定版 `@mlc-ai/web-llm@0.2.86` 的型別與預建模型清單。模型名稱已從 npm 套件及官方 `src/config.ts` 核對：

| 選項                       | exact model ID                      | SDK 清單的 GPU 記憶體估值 |
| -------------------------- | ----------------------------------- | ------------------------- |
| 預設，f16 運算             | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | 1629.75 MB                |
| 無 shader-f16 時的可選版本 | `Qwen2.5-1.5B-Instruct-q4f32_1-MLC` | 1888.97 MB                |

這兩者都是 4-bit 權重量化；`f16` / `f32` 不代表模型權重變成 16 / 32-bit。上述數字來自官方預建設定、不是本專案在特定手機的量測。實際用量會受上下文、編譯、暫存與瀏覽器實作影響。初次傳輸量在 UI 標示 **約 1–1.5 GB 的估計值**，不是由 HTTP `Content-Length` 加總的實測下載量。

Worker 使用 `WebWorkerMLCEngineHandler`；前端使用 `CreateWebWorkerMLCEngine`、`chat.completions.create({ stream: true })`、`interruptGenerate()` 與 `deleteModelAllInfoInCache()`。所有呼叫依實際安裝套件的 `.d.ts` 實作。模型載入與生成都與可拒絕的取消 Promise 競速；Worker `error` / `messageerror` 會回報 UI，避免只留下永久轉圈。取消下載與釋放 GPU 會真正 `worker.terminate()`，而非只隱藏進度。

檔案分工：

- `src/components/AITutor.tsx`：模式、裝置狀態、提問、原文卡、設定與錯誤 UI。
- `src/ai/runtime.ts`：能力檢測、Worker 生命週期、SDK 載入、串流、停止、快取清除。
- `src/ai/tutor.worker.ts`：SDK 的 Worker handler 與實際引擎。
- `src/ai/retrieval.ts`：確定性原文檢索、提示詞組合與保守內容裁切。
- `src/ai/settings.ts`：範圍驗證、預設值與版本化本機儲存。

## 手機限制與合理預設

預設上下文 1024 tokens、輸出 160 tokens、temperature 0.2。介面適應 390px 寬度，手機文字輸入使用 16px 字體以減少 Safari 表單縮放。

**未經 iPhone 13 實機驗證，也不承諾一定可載入。** WebGPU 可用性與 Safari / iOS 版本有關，僅有 WebGPU 並不能證明瀏覽器分配得出約 1.6 GB GPU 記憶體。UI 檢查 HTTPS / localhost、`navigator.gpu`、可用 adapter、`shader-f16` 與 storage-buffer 上限；不把這些視為記憶體容量測試。`navigator.storage.estimate()` 的額度也不是可用 GPU 記憶體或保證可寫入空間。

不支援的裝置使用同一套真正可工作的本機教材檢索。較高的 2048 / 4096 上下文可手動選擇，但需重新載入模型並承擔較高記憶體需求。q4f32_1 是無 f16 功能時可嘗試的版本，並非保證更適合手機。

本機提示組合以 UTF-8 byte 數作保守上限，保留輸出與模板空間，並在裁切時提醒使用者。它不是 SDK tokenizer 的逐 token 計量；超長提示或裝置錯誤仍由引擎回報，不靜默捨棄問題。完整原文仍在下方教學卡，不會因模型上下文裁切而改寫教材。

## 客製化與資料邊界

可即時調整：角色指令、學習目標、引導思考 / 觀念說明 / 解題分析、溫度與輸出長度。模型與上下文變更需重新載入。只儲存設定到 `localStorage`，不持久儲存提問或生成內容。

JSON 匯入只接受 `schemaVersion: 1`、兩個已知模型、有限範圍數值及長度受限的文字；檔案上限 20 KB。temperature 限 0–1，輸出限整數 32–512，上下文限 1024 / 2048 / 4096。匯入不執行程式、不接受任意模型 URL、雲端 endpoint 或 API key。匯出只包含相同的設定欄位。

檢索只取本站本機 `Lesson` 原文，來源卡保留 lesson ID 與原文說明，且不聲稱模型已正確引用每張卡。固定提示要求繁體中文、依據教材、資料不足時說明、不可編造歷屆答案；引用資料按資料處理。這些提示不能被當成模型正確性或抵禦所有提示注入的保證。

本階段是 **system prompt + 本機 RAG + 推論參數客製**。沒有實施 LoRA / QLoRA 訓練、瀏覽器內微調、動態 LoRA adapter 載入或自訓模型。WebLLM 的量化推論和微調是不同階段。

## 真正微調、量化、部署的後續路線

以下是可執行的工程規劃，不是已訓練或已測得的結果：

1. 建立具使用權的繁體中文自然科資料集。以原創逐步推理、單位檢查、概念對照、資料不足時拒答與典型迷思為核心；未授權的講師社群內容不直接用來訓練。依題源與年度切分訓練 / 驗證 / 封閉測試，避免同題改寫洩漏。
2. 在外部具足夠記憶體的 GPU 環境，以 Qwen2.5-1.5B-Instruct 與 PEFT / Transformers 進行 SFT + LoRA 或 QLoRA。先確認當時版本、license、硬體與相容性。訓練集保留來源與版本，不從瀏覽器任意上傳學生提問。
3. 以未見題型評估概念與單位正確率、拒答適切性、引文支持率及繁體中文品質；加入老師審查，檢查是否只學會答案格式。
4. 將 adapter 在支援的訓練環境合併到 base weights，再依官方 MLC LLM 自訂模型流程轉換權重，產出 `q4f16_1` / 視需要 `q4f32_1`、tokenizer、`mlc-chat-config.json` 及相容的 WebGPU WASM。不能把任意 Hugging Face / GGUF 權重直接塞給 WebLLM，也不能假設新 adapter 可直接套到目前預建量化模型。
5. 驗證 chat template、context window、模型架構與 WASM ABI 的相容性；自訂權重是否能重用同架構預建 WASM，須以所用 MLC 版本與實際載入驗證。必要時依官方工具重新編譯。保留來源權重與發行 checksum，不關閉 TLS 或完整性驗證。
6. 透過 HTTPS 並設定正確 CORS 託管版本化模型與 WASM。審核後，在程式內新增受控的 `ModelRecord`、模型 ID 與設定 schema；目前 UI 刻意不接受任意 URL。
7. 對目標 iPhone 13 的指定 iOS / Safari 版本量測冷啟動、峰值記憶體、首 token 時間、持續生成速度、溫度與低電量行為。若不可行，以本機檢索保底，或另設有明確同意及身份管理的伺服器推論方案；本版未加入雲端金鑰欄位。

## 網路與離線部署

網站 PWA 的應用程式快取與 WebLLM 的大型模型快取分開管理；Service Worker 不應預先下載大型模型。模型只在使用者操作後下載。清除模型按鈕使用 SDK API，僅移除所選量化版本，保留網站教材與其他模型版本。瀏覽器仍可能因空間壓力清除快取。

模型入口為 `huggingface.co/mlc-ai/...`，WASM 由 `raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/...` 提供。Hugging Face 大檔案可能重新導向 `cas-bridge.xethub.hf.co`，舊儲存體可能使用 `cdn-lfs.huggingface.co` 或 `cdn-lfs-us-1.hf.co`。實際 CDN 以載入時的網路紀錄與供應商設定為準；受限環境應增補所需網域，而非繞過網路政策。

## 官方技術依據

- [WebLLM 模型清單與記憶體估值](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
- [WebLLM npm 套件](https://www.npmjs.com/package/@mlc-ai/web-llm)
- [WebLLM Web Worker 文件](https://webllm.mlc.ai/docs/user/advanced_usage.html#using-workers)
- [WebLLM 自訂模型](https://webllm.mlc.ai/docs/user/custom_model.html)
- [Qwen2.5 1.5B Instruct 模型卡](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [預建 q4f16_1 模型](https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC)
- [MLC LLM 編譯部署文件](https://llm.mlc.ai/docs/)

建置檢查與桌面瀏覽器功能測試不等同於實機模型性能驗證。專案不應在沒有實測紀錄時宣稱「iPhone 13 已支援」或「已完成專屬微調」。
