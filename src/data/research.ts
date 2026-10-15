export interface ResearchSource {
  id: string;
  title: string;
  author: string;
  year: string;
  url: string;
  type: "official" | "teacher" | "paper" | "technology";
  summary: string;
  application: string;
  verified: string;
}

// 可達與內容核對不代表論文效果重現、教師資格認證或 iPhone 實機測試。
export const researchSources: ResearchSource[] = [
  {
    id: "qwen25-report",
    title: "Qwen2.5 Technical Report · arXiv:2412.15115",
    author: "An Yang、Baosong Yang 等／Qwen 團隊",
    year: "2024",
    type: "paper",
    url: "https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md",
    summary:
      "官方引用確認 Qwen2.5 報告的題名、作者、年份與編號；舊 Qwen2.5 儲存庫目前導向 Qwen3，不能把目前 README 全部當成 Qwen2.5 規格。",
    application:
      "依指定採用 Qwen2.5-1.5B-Instruct，用本站可引用的觀念資料補充脈絡，再核對公式與證據。",
    verified:
      "2026-10-15｜官方 README HTTP 200，核對引文；arXiv 原頁代理 403，未全文審閱。",
  },
  {
    id: "webllm-paper",
    title:
      "WebLLM: A High-Performance In-Browser LLM Inference Engine · arXiv:2412.15803",
    author: "Charlie F. Ruan、Yucheng Qin、Tianqi Chen 等",
    year: "2024 初始編號／官方目前引文 2026",
    type: "paper",
    url: "https://raw.githubusercontent.com/mlc-ai/web-llm/main/README.md",
    summary:
      "以 WebGPU 在瀏覽器推論，提供 Worker 與自訂 MLC 模型整合。目前官方 BibTeX year 是 2026；2412 為初始提交月份編號，不混作首次發表年。",
    application:
      "以 Worker 隔離推論，串流回答並顯示下載進度；載入前檢查裝置能力。",
    verified:
      "2026-10-15｜作者 README HTTP 200，核對題名、arXiv 編號及目前 BibTeX；原論文頁代理 403。",
  },
  {
    id: "webllm-qwen-config",
    title: "WebLLM 官方 Qwen2.5-1.5B 模型設定",
    author: "MLC AI／WebLLM 維護者",
    year: "持續更新",
    type: "technology",
    url: "https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts",
    summary:
      "包含 Qwen2.5-1.5B-Instruct-q4f16_1-MLC 與 q4f32_1-MLC，來源估 VRAM 分別為 1629.75 MB、1888.97 MB，預設 context 4096；不是手機記憶體保證。",
    application:
      "以 4-bit、短 context 與小輸出預算起步，下載大小、GPU 與總瀏覽器記憶體分開衡量。",
    verified:
      "2026-10-15｜官方原始碼 HTTP 200，核對精確 ID、VRAM 註記及 context 預設。",
  },
  {
    id: "lora",
    title:
      "LoRA: Low-Rank Adaptation of Large Language Models · arXiv:2106.09685",
    author: "Edward J. Hu、Yelong Shen 等",
    year: "2021 預印本／ICLR 2022",
    type: "paper",
    url: "https://raw.githubusercontent.com/microsoft/LoRA/main/README.md",
    summary:
      "以低秩更新調適模型，降低可訓練參數及各版本儲存需求；官方提供論文與 ICLR 2022 引文。",
    application:
      "在 GPU 訓練環境建立教學格式 adapter，評測、合併再編譯 MLC；修改提示設定不等同完成 LoRA。",
    verified:
      "2026-10-15｜Microsoft README HTTP 200，核對 arXiv、作者與 ICLR 引文。",
  },
  {
    id: "qlora",
    title: "QLoRA: Efficient Finetuning of Quantized LLMs · arXiv:2305.14314",
    author: "Tim Dettmers、Artidoro Pagnoni、Ari Holtzman、Luke Zettlemoyer",
    year: "2023",
    type: "paper",
    url: "https://raw.githubusercontent.com/artidoro/qlora/main/README.md",
    summary:
      "在量化底座上微調並整合 bitsandbytes、PEFT 與 Transformers；這是訓練方法，不能等同 MLC 4-bit 推論格式。",
    application:
      "以合法授權且人工審核教材在獨立 GPU 環境調適，合併後轉換、量化並檢查。",
    verified:
      "2026-10-15｜作者 README HTTP 200，核對題名、四位作者、年份及 arXiv 編號。",
  },
  {
    id: "rag",
    title: "Retrieval-Augmented Generation · arXiv:2005.11401",
    author: "Patrick Lewis 等／Meta AI 研究團隊",
    year: "2020",
    type: "paper",
    url: "https://raw.githubusercontent.com/facebookresearch/ParlAI/main/parlai/agents/rag/README.md",
    summary:
      "官方實作連結原始 RAG 論文，說明先檢索再生成，以及 RAG-Token、RAG-Sequence 與 TF-IDF／DPR 檢索。",
    application:
      "先檢索本站公式／觀念再加入短 context，顯示來源 ID；輕量檢索不宣稱重現原論文模型。",
    verified:
      "2026-10-15｜Meta ParlAI README HTTP 200，核對原論文連結與檢索生成說明。",
  },
  {
    id: "self-rag",
    title:
      "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection",
    author:
      "Akari Asai、Zeqiu Wu、Yizhong Wang、Avirup Sil、Hannaneh Hajishirzi",
    year: "2023 預印本／ICLR 2024",
    type: "paper",
    url: "https://raw.githubusercontent.com/AkariAsai/self-rag/main/README.md",
    summary:
      "作者以檢索、生成及反思評估改善回答的可支持性。原方法需要專門訓練，提示加上「檢查答案」不等同完整 Self-RAG。",
    application:
      "參考引用與回答檢核流程，標示資料不足並檢查單位與假設；未宣稱重現或驗證學習成效。",
    verified:
      "2026-10-15｜作者 README HTTP 200，核對五位作者、2310.11511 與 ICLR 2024 引文。",
  },
  {
    id: "gepa-2025",
    title:
      "GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning · arXiv:2507.19457",
    author:
      "Lakshya A. Agrawal、Christopher Potts、Matei Zaharia、Omar Khattab 等",
    year: "2025",
    type: "paper",
    url: "https://raw.githubusercontent.com/gepa-ai/gepa/main/README.md",
    summary:
      "用評測回饋反覆改良提示，提供論文與重現材料；這是可核實的近期參考之一，沒有宣稱完成截至今日的最新文獻排名。",
    application:
      "未來在開發集比較提示版本，再以獨立測試集驗證；手機僅使用審核後的設定，不執行昂貴搜尋。",
    verified:
      "2026-10-15｜作者 README HTTP 200；Stanford NLP DSPy README 亦明列 Jul 2025 與同編號。",
  },
  {
    id: "qwen3-comparison",
    title: "Qwen3 Technical Report · arXiv:2505.09388",
    author: "An Yang、Anfeng Li 等／Qwen 團隊",
    year: "2025",
    type: "paper",
    url: "https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md",
    summary:
      "官方提供 2025 報告引文與 thinking／non-thinking 說明；作為後續系列比較，不代表網站換用 Qwen3。",
    application:
      "未來比較中文科學正確率、引用、首字延遲與峰值記憶體；目前保留指定底座。",
    verified:
      "2026-10-15｜官方 README HTTP 200，核對題名、年份與 arXiv；未完成全文核對。",
  },
  {
    id: "mlc-compile",
    title: "MLC LLM：自訂模型編譯與部署",
    author: "MLC 團隊",
    year: "持續更新",
    type: "technology",
    url: "https://raw.githubusercontent.com/mlc-ai/mlc-llm/main/README.md",
    summary:
      "官方列出 WebGPU／WASM 等目標；自訂權重需與 tokenizer、chat template、量化格式與模型 library 相容。",
    application:
      "將底座、adapter、合併權重、量化、WASM library、checksum 與評測共同版本化。",
    verified:
      "2026-10-15｜官方 README HTTP 200，核對 WebGPU／WASM 目標與工具鏈。",
  },
  {
    id: "peft-tooling",
    title: "PEFT：參數高效率微調工具",
    author: "Hugging Face／PEFT 維護者",
    year: "2022 起持續更新",
    type: "technology",
    url: "https://raw.githubusercontent.com/huggingface/peft/main/README.md",
    summary:
      "提供 LoRA 等調適工具；adapter 與底座、目標層及權重形狀有相容性要求。",
    application:
      "保存授權資料版本、科別、訓練設定與 adapter 參數，再完成合併與編譯檢查。",
    verified: "2026-10-15｜官方 README HTTP 200，核對用途、引用及調適支援。",
  },
  {
    id: "webgpu-spec",
    title: "WebGPU／WGSL 規格儲存庫",
    author: "W3C GPU for the Web 社群與工作小組",
    year: "持續更新",
    type: "official",
    url: "https://raw.githubusercontent.com/gpuweb/gpuweb/main/README.md",
    summary:
      "官方規格儲存庫說明 WebGPU 與 WGSL 標準化；API 存在、取得 adapter 與模型能在記憶體內執行是不同條件。",
    application:
      "檢查安全內容環境、navigator.gpu、requestAdapter、features 與 limits；失敗時仍可學習與本地檢索。",
    verified: "2026-10-15｜官方 README HTTP 200，核對 W3C 小組及規格範圍。",
  },
  {
    id: "ios-webgpu",
    title: "WebGPU 瀏覽器相容性資料",
    author: "Can I use 維護者",
    year: "查核於 2026-10-15",
    type: "technology",
    url: "https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/webgpu.json",
    summary:
      "資料標示 iOS Safari 26.0 支援；18.x 預設關閉並有 feature flag 註記。社群相容性資料不是指定機型推論認證。",
    application:
      "390×844 響應式版面與 iPhone 13 實機推論分開驗收，以實際能力決定是否允許模型載入。",
    verified:
      "2026-10-15｜原始資料 HTTP 200，核對 ios_saf 18.x／26.0 與註腳；未做 iPhone 13 實機測試。",
  },
  {
    id: "ceec-official",
    title: "大考中心：自然考科考試說明（待線上覆核）",
    author: "財團法人大學入學考試中心基金會",
    year: "適用版依官方公告",
    type: "official",
    url: "https://www.ceec.edu.tw/",
    summary:
      "課程範圍依使用者提供的 111 起適用自然考科考試說明整理；附件不自動證明目前沒有官方修訂。",
    application:
      "以附件頁碼題號追溯，正式發布前覆核現行版本、答案、更正與再利用條件。",
    verified:
      "2026-10-15｜官方站請求遭本機代理 403；未完成線上版本覆核，另看附件解析紀錄。",
  },
  {
    id: "naer-official",
    title: "國家教育研究院：自然領域課程綱要（待線上覆核）",
    author: "國家教育研究院／教育部課綱公開資料",
    year: "現行版待官方覆核",
    type: "official",
    url: "https://www.naer.edu.tw/",
    summary:
      "正式課綱、考試說明與網站教學分類用途不同，章節清單不代表完成課綱逐條對照。",
    application:
      "後續補正式條目代碼、版本、學習內容與學習表現；未覆核前不宣稱全課綱完整涵蓋。",
    verified: "2026-10-15｜官方站請求遭本機代理 403，無法確認現行公告版本。",
  },
];
