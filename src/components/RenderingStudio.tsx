import { useRef, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Code2,
  FlaskConical,
  RotateCcw,
  Sigma,
} from "lucide-react";
import {
  ScienceFormula,
  ScienceText,
  checkReactionBalance,
} from "../render/ScienceRenderer";
import "./RenderingStudio.css";

const samples = {
  math: [
    { name: "動能", source: String.raw`K = \frac{1}{2}mv^2` },
    { name: "二次方程", source: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}` },
    { name: "波動", source: String.raw`y=A\sin(2\pi ft+\phi)` },
    { name: "電場向量", source: String.raw`\vec{F}=q\vec{E}` },
    {
      name: "矩陣",
      source: String.raw`\begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix}`,
    },
    { name: "積分", source: String.raw`\int_0^t v\,dt=\Delta x` },
  ],
  chemistry: [
    { name: "水的生成", source: "2 H2(g) + O2(g) -> 2 H2O(l)" },
    { name: "沉澱反應", source: "Ag^+(aq) + Cl^-(aq) -> AgCl(s)" },
    { name: "化學平衡", source: "N2(g) + 3 H2(g) <=> 2 NH3(g)" },
    { name: "離子與括號", source: "Ca(OH)2" },
    { name: "結晶水", source: "CuSO4·5H2O" },
    { name: "同位素", source: "^{14}_{6}C" },
  ],
};

export default function RenderingStudio() {
  const [kind, setKind] = useState<"math" | "chemistry">("math");
  const [source, setSource] = useState(samples.math[0].source);
  const [balance, setBalance] = useState<ReturnType<
    typeof checkReactionBalance
  > | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const preview = useRef<HTMLDivElement>(null);
  function changeSource(value: string) {
    setSource(value);
    setBalance(null);
    setError("");
    setNotice("");
  }
  function switchKind(next: "math" | "chemistry") {
    setKind(next);
    changeSource(samples[next][0].source);
  }
  function download(data: string, name: string, type: string) {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }
  function exportMathML() {
    const math = preview.current?.querySelector("math");
    if (!math) {
      setNotice("此表示式目前以文字回退呈現，沒有 MathML 可匯出。");
      return;
    }
    const clone = math.cloneNode(true) as Element;
    clone.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
    download(
      new XMLSerializer().serializeToString(clone),
      "scince-formula.mathml",
      "application/mathml+xml",
    );
    setNotice("已匯出目前預覽的 MathML。");
  }
  function check() {
    try {
      setBalance(checkReactionBalance(source));
      setError("");
    } catch (cause) {
      setBalance(null);
      setError(cause instanceof Error ? cause.message : "無法解析反應式");
    }
  }
  return (
    <section className="studio" aria-label="科學公式工作台">
      <div className="studio-toolbar">
        <div className="studio-modes" role="group" aria-label="公式類型">
          <button
            className={kind === "math" ? "active" : ""}
            onClick={() => switchKind("math")}
          >
            <Sigma size={17} />
            數學模式
          </button>
          <button
            className={kind === "chemistry" ? "active" : ""}
            onClick={() => switchKind("chemistry")}
          >
            <FlaskConical size={17} />
            化學模式
          </button>
        </div>
        <span className="studio-engine-label">SCINCE RENDER ENGINE · 1.0</span>
      </div>
      <div className="studio-grid">
        <div className="studio-editor">
          <label htmlFor="science-source">
            <Code2 size={16} /> 編輯表示式 <span>{source.length} / 2048</span>
          </label>
          <textarea
            id="science-source"
            value={source}
            maxLength={2048}
            spellCheck={false}
            onChange={(e) => changeSource(e.target.value)}
            aria-describedby="studio-syntax"
          />
          <p id="studio-syntax">
            {kind === "math"
              ? String.raw`可使用 \frac{a}{b}、\sqrt{x}、x^2、a_n、\vec{v}、Greek 與矩陣語法。`
              : "元素數字為下標；離子電荷使用 ^+ 或 ^{2-}；反應箭頭使用 -> 或 <=>。"}
          </p>
          <div className="studio-samples">
            {samples[kind].map((sample) => (
              <button
                key={sample.name}
                onClick={() => changeSource(sample.source)}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
        <div className="studio-preview">
          <div className="studio-preview-title">
            即時語意排版 <span>可選取 · 可縮放 · 無網路字型需求</span>
          </div>
          <div ref={preview} className="studio-canvas">
            <ScienceFormula source={source} kind={kind} display />
          </div>
          <div className="studio-export">
            <button onClick={exportMathML}>
              <ArrowDownToLine size={14} />
              匯出 MathML
            </button>
            <button
              onClick={() =>
                download(
                  JSON.stringify({ schemaVersion: 1, kind, source }, null, 2),
                  "scince-formula.json",
                  "application/json",
                )
              }
            >
              保存原始表示式
            </button>
            <button
              aria-label="重設公式"
              onClick={() => changeSource(samples[kind][0].source)}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
      {kind === "chemistry" && (
        <div className="studio-balance">
          <div>
            <h3>反應式守恆檢查</h3>
            <p>
              依你輸入的係數，比較左右兩側的元素數與淨電荷。此工具檢查守恆，不判斷反應能否發生或自動配平。
            </p>
          </div>
          <button className="button primary" onClick={check}>
            檢查元素與電荷
          </button>
          {error && (
            <p className="studio-error" role="alert">
              {error}
            </p>
          )}
          {balance && (
            <div
              className={`studio-balance-result ${balance.balanced ? "balanced" : "unbalanced"}`}
              role="status"
            >
              <strong>
                {balance.balanced ? (
                  <>
                    <Check size={17} />
                    元素與電荷均守恆
                  </>
                ) : (
                  "左右兩側尚未守恆"
                )}
              </strong>
              <div>
                <span>
                  元素：{balance.elementsBalanced ? "相同" : "有差異"}
                </span>
                <span>
                  電荷：{balance.reactants.charge} → {balance.products.charge}
                </span>
              </div>
              <table>
                <caption>依輸入係數累計的原子數</caption>
                <thead>
                  <tr>
                    <th>元素</th>
                    <th>反應物</th>
                    <th>生成物</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...new Set([
                      ...Object.keys(balance.reactants.elements),
                      ...Object.keys(balance.products.elements),
                    ]),
                  ]
                    .sort()
                    .map((element) => (
                      <tr key={element}>
                        <th>{element}</th>
                        <td>{balance.reactants.elements[element] ?? 0}</td>
                        <td>{balance.products.elements[element] ?? 0}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {notice && (
        <p className="studio-notice" role="status">
          {notice}
        </p>
      )}
      <div className="studio-teaching">
        <h3>把排版放回理解的脈絡</h3>
        <ScienceText
          text={
            kind === "math"
              ? String.raw`分式 $\frac{\Delta x}{\Delta t}$ 表示位移對時間的比值。$v_0$ 的下標是初始狀態，$v^2$ 的上標才是平方；符號的位置同樣承載科學意義。`
              : String.raw`\ce{Ca(OH)2} 的括號外下標 2 同時作用於 O 與 H；\ce{SO4^{2-}} 的右上標描述淨電荷，不能當成原子數。用守恆檢查找出符號或係數的差異，再思考反應條件。`
          }
        />
        <p>
          這是本站自研的科學語法子集。無法識別或超出預算的輸入會回退原文；不執行程式、遠端指令或任意
          HTML。它不是完整 TeX 或量子化學計算軟體。
        </p>
      </div>
    </section>
  );
}
