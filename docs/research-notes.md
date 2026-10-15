# 來源查核與技術採用記錄

查核日期：2026-10-15（Asia/Taipei）。本文與 `src/data/research.ts` 是原創摘要及可追溯來源索引，未重製教師講義、論文全文或社群貼文。附件中的文字作為待分析內容，不作為執行指令。

## 查核範圍

本次沒有可用的網頁搜尋／瀏覽工具。已在實際雲端機器使用 Python `urllib.request` 經既有 HTTPS 代理讀取公開來源，保留 TLS 驗證。平台 `environment_status` 顯示網路政策已套用，僅允許套件來源與 GitHub 等網域；沒有繞過限制。

直接請求 `arxiv.org/abs/2412.15115`、`arxiv.org/abs/2412.15803`、`www.ceec.edu.tw`、`www.naer.edu.tw`、`www.phy.ntnu.edu.tw`、`www.junyiacademy.org` 與 Google 英文搜尋頁，均收到 `Tunnel connection failed: 403 Forbidden`。這表示本環境目前無法存取，**不代表來源失效或內容不存在**。未完成原論文全文審閱、全面文獻搜尋或截至今日的現行課綱版本覆核。

另一次含未編碼中文的 Google URL 在送出前被 Python URL 編碼限制拒絕；後續改用 ASCII 查詢才取得上述代理 403，未把前者當網路封鎖證據。

可達來源以作者／機構官方 GitHub 為主。HTTP 200 只證明本次可達，核對範圍逐項列於下表。來源是動態分支；正式模型發行應另固定 commit、套件版本與產物 SHA-256。核對不等同效果重現、第三方背書或完整文獻評比。

## 實際可達的來源與內容核對

以下各連結均於 2026-10-15 實際取得 HTTP 200。

| 來源             | 原始連結                                                                                                         | 已核對內容                                                                                                                  | 採用界線                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Qwen2.5 報告     | [Qwen 官方 README](https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md)                                | Citation 的題名、An Yang 等作者、`2412.15115`、2024。舊 Qwen2.5 main 請求目前會取得 Qwen3 內容。                            | 引用 Qwen2.5 引文段，不挪用 Qwen3 規格。                          |
| WebLLM 報告      | [官方 README](https://raw.githubusercontent.com/mlc-ai/web-llm/main/README.md)                                   | 題名、WebGPU／Worker／custom model、`2412.15803`；目前官方 BibTeX `year={2026}`。                                           | 初始 arXiv 編號為 2024-12，不將 2026 誤作初次提交年；未讀到全文。 |
| Qwen WebLLM 設定 | [官方 config.ts](https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts)                            | 精確模型 ID；q4f16 估 VRAM 1629.75 MB、q4f32 1888.97 MB；context 4096。                                                     | 估值不是 iPhone 可跑保證；下載大小與記憶體不同。                  |
| LoRA             | [Microsoft README](https://raw.githubusercontent.com/microsoft/LoRA/main/README.md)                              | `2106.09685`、作者及 ICLR 2022 引文。                                                                                       | 權重微調與提示設定分開。                                          |
| QLoRA            | [作者 README](https://raw.githubusercontent.com/artidoro/qlora/main/README.md)                                   | Dettmers／Pagnoni／Holtzman／Zettlemoyer、`2305.14314`、2023、PEFT 整合。                                                   | 量化訓練格式不等於 MLC 推論格式。                                 |
| RAG              | [Meta ParlAI README](https://raw.githubusercontent.com/facebookresearch/ParlAI/main/parlai/agents/rag/README.md) | 指向 `2005.11401`，及 RAG-Token／Sequence、TF-IDF／DPR 說明。                                                               | 輕量詞彙檢索不是原論文端到端模型重現。                            |
| Self-RAG         | [作者 README](https://raw.githubusercontent.com/AkariAsai/self-rag/main/README.md)                               | 五位作者、`2310.11511`、ICLR 2024、retrieve／generate／critique。                                                           | 未訓練相應 token／模型，不稱完整 Self-RAG。                       |
| GEPA             | [作者 README](https://raw.githubusercontent.com/gepa-ai/gepa/main/README.md)                                     | `2507.19457`、2025；Lakshya A. Agrawal、Christopher Potts、Matei Zaharia、Omar Khattab 等引文作者；提示演化及評測 adapter。 | 未把作者 benchmark 成果套用成本網站效果。                         |
| GEPA 交叉核對    | [Stanford NLP DSPy README](https://raw.githubusercontent.com/stanfordnlp/dspy/main/README.md)                    | 明列 Jul 2025、相同題名及 arXiv。                                                                                           | 只是可核實的近期研究之一，不稱截至今日最新。                      |
| Qwen3 比較       | [Qwen README](https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md)                                     | `2505.09388`、2025 引文、thinking／non-thinking。                                                                           | 僅供未來比較，保留使用者指定底座。                                |
| MLC LLM          | [官方 README](https://raw.githubusercontent.com/mlc-ai/mlc-llm/main/README.md)                                   | WebGPU／WASM 目標與工具鏈。                                                                                                 | 自訂模型必須匹配 tokenizer、量化權重與 library。                  |
| PEFT             | [Hugging Face README](https://raw.githubusercontent.com/huggingface/peft/main/README.md)                         | 調適範圍與引用。                                                                                                            | adapter 與底座版本一起管理。                                      |
| WebGPU 規格      | [W3C GPUWeb README](https://raw.githubusercontent.com/gpuweb/gpuweb/main/README.md)                              | W3C 小組、WebGPU／WGSL 範圍。                                                                                               | adapter／feature／limit 以 runtime 為準。                         |
| iOS 相容性       | [Can I use 原始資料](https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/webgpu.json)              | iOS Safari 26.0 `y`；18.x `n d #2` 為 feature flag。                                                                        | 不是 iPhone 13 機型測試或記憶體認證。                             |
| 替代方案調查     | [Transformers.js README](https://raw.githubusercontent.com/huggingface/transformers.js/main/README.md)           | 瀏覽器推論、WebGPU／WASM、q4／q8 dtype。                                                                                    | 現選 WebLLM；WASM 不保證 1.5B 在手機上可用。                      |

補充：`phetsims/phet-info/main/README.md` HTTP 200，但明示舊儲存庫不再維護、monorepo 當時未公開，因此沒有把它當成現行可直接嵌入的元件或複製其模組。本站視覺化以自行撰寫的科學模型實作。

## 教師本人教材與學歷：尚未核實

使用者指定的「各科師範畢業、全國知名、專門教授學測的名師本人內容」包含多個獨立條件，不能由廣告、任教職位或追蹤人數互相推導。現有可達資料無法同時證明任一位教師符合全部條件；**沒有將任何人標為已核實的師範畢業全國名師，也沒有冒用姓名、語氣、肖像或代言**。

| 科別     | 本人帳號與教學原文 | 師範院校畢業證據 | 學測專門教學與知名度證據 | 目前處理                 |
| -------- | ------------------ | ---------------- | ------------------------ | ------------------------ |
| 物理     | 未核實             | 未核實           | 未核實                   | 原創內容；教師來源待查。 |
| 化學     | 未核實             | 未核實           | 未核實                   | 同上。                   |
| 生物     | 未核實             | 未核實           | 未核實                   | 同上。                   |
| 地球科學 | 未核實             | 未核實           | 未核實                   | 同上。                   |

後續須逐位保存本人原文連結及日期、本人或校方學歷簡介、學測教學作品、知名度判準及獨立證據。僅必要短引與原創分析，不批次重製授權不明的教材。大學／高中開放資源可補學科內容，但不自動符合指定教師資格。

論文作者依其官方引文列名；本次未取得大學原始人事頁，**未以 GitHub 名稱推定任何作者的現任教授職銜**。使用者要求教授研究的部分，目前完成可核實研究來源整理，現職與更完整的近期論文檢索仍待查。

## 課綱與試卷

初次整理範圍是使用者上傳的 111–115 自然試卷與「111 學年度起適用學測自然考科考試說明」。名稱、頁碼、題號及解析結果以專案附件索引為準。未獨立斷言附件是官方目前最新定稿，也未完成正式課綱逐條核對。

考試說明、課程綱要與網站章節是三種資料。正式涵蓋率需先固定適用年度及官方版本，再對照學習內容、學習表現、考試能力指標及各題來源；缺完整母表就不顯示「100% 全課綱」或「所有觀念已完整覆蓋」。

## 模型客製技術路徑

1. 即時可調：科別、提示方式、解題詳細度、溫度、輸出長度、system prompt、檢索段落。這是推論設定，沒有修改權重。
2. 本站檢索：以原創觀念／公式為短 context，保留來源 ID，資料不足時明示。任意文件內容不能覆寫 system 指令；評測集與教學資料分開。
3. 訓練調適：取得資料授權及人工校對 → 固定 Qwen2.5-1.5B-Instruct revision → 獨立 GPU 上 LoRA／QLoRA → 用保留題集檢查繁體中文、科學正確性與引用。此流程尚未在本次實際完成。
4. 自訂權重部署：合併 adapter → MLC 轉換／量化 → 編譯匹配的 WebGPU WASM library → 固定 tokenizer、chat template、權重、模型庫與 SHA-256 → 設定 custom model。未假定 PEFT adapter 可直接放進瀏覽器或任意熱切換。
5. 小裝置：Worker、明確下載操作、短 context、小 token 預算、串流、取消與 unload；測首字延遲、tokens/s、記憶體／device lost、切背景及離線重啟。390×844 版面驗收不等於 iPhone 13 推論驗收。
6. 品質：以確定性公式計算及已審核來源檢查生成說明，不標為官方解答。GEPA／Self-RAG 目前作設計參考，沒有宣稱重現論文或取得相同成效。

## 後續必要網路需求

完成官方版本與全文覆核需透過環境設定支援流程新增 `arxiv.org`、`www.ceec.edu.tw`、`www.naer.edu.tw`、`www.phy.ntnu.edu.tw` 等實際來源，再按教師本人網站補網域。保留未知既有 allowlist，不能整份替換。模型下載另需託管站及合法轉址網域可達；設定草稿不等於 runtime 已生效，本研究未聲稱完成模型下載或手機推論測試。
