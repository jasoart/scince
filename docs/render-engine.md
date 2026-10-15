# Scince 科學排版引擎

這是本站自行實作的有限科學語法解析器與呈現層，沒有使用 KaTeX、MathJax 或把外部排版套件包裝成「自研」。字元掃描器直接建立有型別的數學／化學 AST，再由 React 建立原生 MathML。瀏覽器負責字型、數學字距、伸縮括號與排版；它不是自行重寫瀏覽器字型引擎。

## 使用

```tsx
import {
  ScienceFormula, ScienceText, parseChemicalFormula, checkReactionBalance,
} from './render/ScienceRenderer';

<ScienceFormula source={String.raw`v=\frac{\Delta x}{\Delta t}`} kind="math" display />
<ScienceFormula source="2H2(g) + O2(g) -> 2H2O(l)" kind="chemistry" display />
<ScienceText text={String.raw`用 $F=ma$，再比較 \ce{NH4^+} 與 \ce{NH3}。`} />

const water = parseChemicalFormula('2H2O(l)');
// water.elements = { H: 2, O: 1 }; water.coefficient = 2
const result = checkReactionBalance('2H2 + O2 -> 2H2O');
// result.balanced = true
```

`ScienceFormula` 接受 `source`、`kind: 'auto' | 'math' | 'chemistry'`、`display` 與 `className`。教材分科已知時可以指定種類。`auto` 對 `\ce{...}` 明確使用化學解析；對疑似化學式先嘗試化學，再使用數學解析，因此不應以自動判斷取代科學意義的判斷。

`ScienceText` 辨認 `$...$`、`$$...$$`、`\(...\)`、`\[...\]`、`\ce{...}`。其餘內容是 React 跳脫後的純文字，不處理 Markdown／HTML。未關閉的分隔符保留原文。`\$` 不會開啟公式。Qwen 串流尚未產生完整分隔符時也可安全閱讀，公式完成後才呈現。

## 支援的數學子集

- 分數 `\frac`／`\dfrac`／`\tfrac`、二項係數 `\binom`、平方根／n 次根 `\sqrt[n]{...}`。
- 群組 `{...}`、上下標 `x_i^2`、計算機慣用括號指數 `a^(b+c)`、既有 Unicode 數字／字母上下標 `m₁`／`r²`／`Iᴬ`／`eₛ`、結合附加符號 `v̄`。TeX 無括號引數依單一 token 解讀，因此 `\frac12` 正確表示 1/2，多位指數請寫 `10^{23}`。
- 常見希臘字母、`\sum`／`\prod`／`\int`／`\iint`／`\oint`、比較與集合符號、箭號。
- `\vec`／`\overrightarrow`、`\hat`、`\bar`／`\overline`、`\dot`／`\ddot`。
- 上下註記 `\overset`／`\underset`、具可選下方註記的 `\xrightarrow[下方]{上方}`／`\xleftarrow`、條件機率分隔符 `\mid`。
- 直立函數 `\sin`／`\cos`／`\tan`／`\log`／`\ln` 等；純文字 `\text`／`\mathrm`／`\mathbf`／`\mathit`／`\operatorname`。
- `matrix`、`pmatrix`、`bmatrix` 環境；`&` 分格、`\\` 分列，必須是長方形，最多 12 × 12。
- 一般括號與 `\left`／`\right` 分隔符。原生 MathML 會依內容伸縮括號。

它不是完整 TeX：不支援巨集定義、外部檔案、超連結、HTML、圖形指令、任意環境或套件。文字命令只接受純文字，不接受內層 TeX 命令。未知命令會使整個公式回退成原文，避免默默改變科學意義。

## 化學 AST 與守恆

`parseChemicalFormula(source)` 接受 118 種正式元素符號、巢狀 `()`／`[]`、正整數原子數、化學計量係數、結晶水、離子電荷、同位素標記、電子與物態：

```text
H2O        Ca(OH)2         K4[Fe(CN)6]
CuSO4·5H2O SO4^{2-}        NH4^+
SO₄²⁻      ^{14}_{6}C      e^-
2H2O(l)    NaCl(aq)        CaCO3(s)
```

回傳 `source`、`coefficient`、`segments`、`elements`、`charge`、`state?`、`electron`。`segments` 保留群組、原子數、同位素及結晶水係數供呈現；`elements` 是**一個化學式單位**的元素數量，尚未乘反應係數；`charge` 同樣是單位淨電荷。

多價離子請明確寫 `Fe^{3+}`。沒有上標標記的 `Fe3+` 會依字面被解讀為 `Fe₃⁺`，不猜測作者想寫的電荷。化學式內不接受空白，反應物間用 `+` 分隔。係數目前需為正整數，不接受分數。

`parseChemicalReaction(source)` 接受 `->`、`→`、`⟶`、`<=>`、`⇌`、`⇄`、`<->`、`↔`、`=`，回傳 `{ reactants, products, arrow, arrowLabel? }`。也支援化學下標 `H_2O`／`C_6H_{12}O_6` 與一個 `\xrightarrow{\text{光能}}` 反應條件標示（短純文字或 `\text`／`\mathrm`，不執行其他指令）。掃描時會區分離子正號、群組與物種分隔號；建議採用有空白的 `NH4^+ + OH^- -> NH3 + H2O`。

`checkReactionBalance(source | reaction)` 回傳：

```ts
{
  balanced: boolean,
  elementsBalanced: boolean,
  chargeBalanced: boolean,
  reactants: { elements: Record<string, number>, charge: number },
  products:  { elements: Record<string, number>, charge: number },
  difference: { elements: Record<string, number>, charge: number }
}
```

總計包含每個物種的反應係數。`difference` 是生成物減反應物，只列非零元素差。它可找出「元素已守恆但淨電荷不同」的反應式，支援 `Fe^{3+} + e^- -> Fe^{2+}` 等半反應。它不自動配平、不預測可否反應、不計算熱力學；也不檢核核反應的核子數、同位素豐度、鍵結、立體結構或質量精確值。同位素原子序會與元素核對，但元素守恆計數不區分同位素。

## 安全、效能與手機

- 全部解析是純資料處理；不使用 `eval`、`Function`、`innerHTML` 或 `dangerouslySetInnerHTML`。
- 所有命令需在明確白名單；`\href`、`\input`、`\htmlClass` 等不執行，直接保留原文。錯誤回退也經 React 文字跳脫。
- 數學式最多 8,192 字元、32 層、1,800 個節點。化學物種最多 4,096 字元、24 層、1,000 個節點，反應最多 8,192 字元、每側 64 物種。原子數與電荷總計最多 10⁹ 且須為安全整數。
- 混合文章最多處理 64,000 字元、約 256 個片段、128,000 次掃描預算，過長內容保留可閱讀的縮短尾端。單公式超長時回退最多顯示 8,192 字元。解析失敗可從 `data-render-status="fallback"` 與提示文字識別。
- 使用原生 MathML，沒有網路字型或額外排版 CDN 依賴，可隨 PWA 離線運作。瀏覽器及輔助科技的 MathML 支援仍會影響呈現與朗讀；不支援時可讀取元素內原文字元。
- `.sr-*` 樣式把寬公式限制在容器內橫向捲動。390px 螢幕上，矩陣與長反應式會在公式內捲動，不應把整頁撐寬。這是版面支援，與 WebGPU／iPhone 實機推論能力無關。

## 驗證

`node --test tests/render.test.mjs` 執行真實 TS 解析器與 React SSR，涵蓋數學 AST／MathML、Unicode、矩陣、巢狀化學式、結晶水、同位素、多價離子、電子半反應、元素與淨電荷差、格式／預算拒絕、混合文章及惡意來源跳脫；也逐一載入現有課程的導讀公式、詳解公式及內文公式，檢查沒有非預期語法回退。瀏覽器版面檢查由整站 Playwright 測試涵蓋。
