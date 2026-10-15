# SCINCE 自然探索室

以理解與操作為核心的學測自然學習 PWA。**113 個學習單元、275 題原創自我檢核、12 個互動模型**，以及自研數學／化學渲染引擎。

網站部署目標：[https://jasoart.github.io/scince/](https://jasoart.github.io/scince/)。正式版本由 `main` 的 GitHub Actions 驗證、建置並發布。

## 學習功能

- 64 個核心課加 49 個補寫專題與探究單元。每課都有目標、先備、分段教學、公式條件、分步例題、解析練習、應用、摘要與筆記；補寫課每課至少四段教學、三題練習。
- 課綱對照列出附件的 163 條四科學習內容與 14 項探究索引，附印刷／PDF 頁碼、對應課程與補寫說明；可搜尋代碼或觀念。圖書館可篩選本次補寫與探究課，舊課也能連到深入單元。
- 學習路徑會記住掌握進度與自我檢核；想錯的單元會列入待複習，改正後自動移出。
- 12 個 SVG 模型：拋體、波疊加、歐姆定律、理想氣體、可逆平衡、酸鹼稀釋、遺傳、族群、酵素、四季、地震定位與行星能量收支。
- 公式工作台可編輯、預覽並匯出 MathML；支援分式、根式、上下標、向量、矩陣、離子、同位素、水合物及反應式，並檢查元素與電荷守恆。
- 收藏、私人筆記、JSON 匯出、單元深連結、可安裝 PWA 與離線學習。
- Qwen2.5-1.5B-Instruct WebGPU Worker 整合，含角色／目標／模式與參數客製、JSON 匯出入、按需下載、停止、釋放 GPU 及清理快取；未啟用模型時可使用真實本機教材檢索。

**公開網站不提供歷屆試題、原卷 PDF 或題目索引。** 原始附件只在本機 `reference-material/` 保留，不進版控、不進 `dist`。發布前會執行 `scripts/check-release.mjs` 確認。

## 開發與驗證

Node.js 22.12+（本環境 24.19）與 npm。使用現有 checkout；每個雲端任務已隔離，不必額外建立 Git worktree。

```sh
cd /workspace/scince
export npm_config_cache=/workspace/.npm-cache
npm ci --no-audit --no-fund
npm run dev -- --port 5173
```

```sh
npm test
npm run build
npx playwright test
node scripts/check-release.mjs
```

Playwright 優先使用 `/usr/bin/chromium`；其他開發機可執行 `npx playwright install chromium`。測試自動啟動 4173 port 的正式預覽。以根目錄部署時直接使用 `dist/`；GitHub Pages 子路徑建置：

```sh
VITE_BASE_PATH=/scince/ npm run build
```

靜態素材、manifest、Service Worker、Worker 與應用程式模組均使用建置 base；單元以 hash URL 分享，例如 `#/library/physics-motion`。

## 工程文件

- [課綱範圍審核與補課紀錄](docs/curriculum-audit.md)
- [產品架構與視覺](docs/architecture.md)
- [自研渲染引擎](docs/render-engine.md)
- [AI 設計與微調部署路線](docs/ai-architecture.md)
- [來源與研究紀錄](docs/research-notes.md)
- [GitHub Pages 發布](docs/deployment.md)
- [驗證紀錄](docs/validation.md)

## 內容與裝置範圍

課程依使用者提供的「111 學年度起適用學測自然考科考試說明」及必修核心範圍編寫，區分國中銜接與延伸。完整單元頁不等同外部機構逐條課綱認證；教師學歷、本人帳號與後續官方修訂仍以可查證原始來源為準，沒有冒稱名師代言。

手機版面以 390×844 等 Chromium viewport 驗證；尚未完成 iPhone 13／Safari 實機模型推論。Qwen q4f16 官方 VRAM 估值約 1.63 GB，裝置仍可能無法載入。模型不自動下載，無需 API key。客製功能目前是提示、檢索與推論參數；沒有聲稱完成 LoRA 訓練。

進度與筆記儲存在目前瀏覽器，沒有帳號或跨裝置同步；請用匯出功能備份。瀏覽器清理儲存空間可能移除離線快取。原創配圖僅作自然探索意象，科學模型另外標示單位與假設。
