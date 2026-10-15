# GitHub Pages 正式發布

儲存庫：`jasoart/scince`。站台目標：`https://jasoart.github.io/scince/`。

`.github/workflows/pages.yml` 在 main 更新後，執行 npm ci、資料／渲染測試、正式建置及 Playwright 驗證，再以 `VITE_BASE_PATH=/scince/` 重建。`check-release.mjs` 確認發行內容沒有 PDF、原卷文字或題目索引，之後使用官方 upload-pages-artifact 與 deploy-pages。

Pages 設定須以 GitHub Actions 作為來源（API build_type 為 workflow），不是將 TypeScript 原始碼當作 Jekyll 網站發布。可於 Settings → Pages → Build and deployment 選 GitHub Actions。首次從 legacy 切換時，需具備調整 Pages 設定的權限。

驗證順序：

1. 確認 main 遠端提交為預定發行提交。
2. 核對 Publish SCINCE 工作流程與 deployment 均成功。
3. 請求正式網址，確認 HTML、具 base 的模組、配圖與 manifest 可達。
4. 以真實瀏覽器開啟課程、公式工作台與學習路徑，確認無 pageerror。
5. 確認網站沒有歷屆試題入口，公開發行資料不包含原卷或索引。

網站程式以靜態檔部署，沒有資料庫遷移。日後若需回復版本，對來源建立一般 revert 提交，讓相同驗證流程重建；不要任意 force-push main。

雲端環境若無法連線，不代表 GitHub Pages 本身未完成。須把 API 部署結果與實際網址的連線結果分開記錄；不在沒有證據時聲稱正式發布成功。
