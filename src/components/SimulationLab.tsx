import { useEffect, useRef, useState, type ReactNode } from "react";
import "./SimulationLab.css";

export const simulationCatalog: {
  id: string;
  title: string;
  subject: string;
  description: string;
}[] = [
  {
    id: "physics-motion",
    title: "拋物線實驗室",
    subject: "物理",
    description: "改變初速、角度與重力，觀察射程和最高點。",
  },
  {
    id: "physics-wave",
    title: "波的疊加",
    subject: "物理",
    description: "兩列波如何干涉？親手調出拍頻。",
  },
  {
    id: "physics-circuit",
    title: "歐姆定律",
    subject: "物理",
    description: "從電壓與電阻，即時看見電流及功率。",
  },
  {
    id: "chemistry-gas",
    title: "理想氣體",
    subject: "化學",
    description: "溫度、體積、莫耳數與壓力的定量關係。",
  },
  {
    id: "chemistry-equilibrium",
    title: "可逆反應平衡",
    subject: "化學",
    description: "從不同起點接近同一個動態平衡。",
  },
  {
    id: "chemistry-ph",
    title: "酸鹼與稀釋",
    subject: "化學",
    description: "加入水後，強酸和強鹼的 pH 如何變化？",
  },
  {
    id: "biology-genetics",
    title: "孟德爾交配棋盤",
    subject: "生物",
    description: "用親代基因型，推算子代機率。",
  },
  {
    id: "biology-population",
    title: "族群成長",
    subject: "生物",
    description: "資源有限時，族群為何呈現 S 型成長？",
  },
  {
    id: "biology-enzyme",
    title: "酵素的工作條件",
    subject: "生物",
    description: "探索溫度、pH 與受質濃度的影響。",
  },
  {
    id: "earth-orbit",
    title: "地球與四季",
    subject: "地科",
    description: "比較日期、地軸傾角與緯度造成的日照變化。",
  },
  {
    id: "earth-seismic",
    title: "P・S 波定位",
    subject: "地科",
    description: "用三個測站的到時差，找出震央。",
  },
  {
    id: "earth-climate",
    title: "行星能量收支",
    subject: "地科",
    description: "反照率與太陽輻射如何決定平衡溫度？",
  },
];

const defaults: Record<string, Record<string, number>> = {
  "physics-motion": { speed: 22, angle: 45, gravity: 9.8 },
  "physics-wave": { f1: 1, f2: 1.25, offset: 0 },
  "physics-circuit": { voltage: 12, resistance: 24 },
  "chemistry-gas": { temperature: 300, volume: 20, amount: 1 },
  "chemistry-equilibrium": { constant: 3, total: 1, initial: 0, time: 4 },
  "chemistry-ph": { logc: -3, dilution: 10, base: 0 },
  "biology-genetics": { parent1: 1, parent2: 1, offspring: 100 },
  "biology-population": { capacity: 500, rate: 0.25, initial: 20, time: 16 },
  "biology-enzyme": { temperature: 37, ph: 7, substrate: 4 },
  "earth-orbit": { day: 172, tilt: 23.4, latitude: 23.5 },
  "earth-seismic": { x: 155, y: 95, vp: 6, vs: 3.5 },
  "earth-climate": { solar: 1361, albedo: 0.3, emissivity: 0.77 },
};
const rad = Math.PI / 180;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const fixed = (value: number, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : "∞";
const curve = (
  fn: (x: number) => number,
  min: number,
  max: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
  count = 150,
) =>
  Array.from({ length: count + 1 }, (_, i) => {
    const x = min + ((max - min) * i) / count;
    return `${i ? "L" : "M"}${sx(x).toFixed(2)},${sy(fn(x)).toFixed(2)}`;
  }).join(" ");

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="sim-metric">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="sim-control">
      <span>
        {label}
        <output>{display ?? value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="sim-range-limits">
        <small>{min}</small>
        <small>{max}</small>
      </span>
    </label>
  );
}
function Graphic({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      className="sim-svg"
      viewBox="0 0 360 250"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}
function Axes({
  xLabel,
  yLabel,
  zeroY = 205,
}: {
  xLabel: string;
  yLabel: string;
  zeroY?: number;
}) {
  return (
    <g className="sim-axes">
      <path d={`M38 24V205H336M38 ${zeroY}H336`} />
      <text x="336" y="233" textAnchor="end">
        {xLabel}
      </text>
      <text x="39" y="15">
        {yLabel}
      </text>
      {[0.25, 0.5, 0.75].map((f) => (
        <path key={f} className="sim-grid" d={`M38 ${24 + f * 181}H336`} />
      ))}
    </g>
  );
}
function Formula({ children, note }: { children: ReactNode; note: string }) {
  return (
    <div className="sim-explanation">
      <div className="sim-formula">{children}</div>
      <p>{note}</p>
    </div>
  );
}

export default function SimulationLab({
  initialId = "physics-motion",
  onModuleChange,
}: {
  initialId?: string;
  onModuleChange?: (id: string) => void;
}) {
  const validId = (id: string) =>
    simulationCatalog.some((item) => item.id === id) ? id : "physics-motion";
  const [id, setId] = useState(() => validId(initialId));
  const [parameters, setParameters] = useState<
    Record<string, Record<string, number>>
  >(() =>
    Object.fromEntries(
      Object.entries(defaults).map(([key, values]) => [key, { ...values }]),
    ),
  );
  const [running, setRunning] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const [clock, setClock] = useState(0);
  const timer = useRef(0);
  const dynamic = [
    "physics-motion",
    "physics-wave",
    "physics-circuit",
  ].includes(id);
  useEffect(() => {
    setId(validId(initialId));
    timer.current = 0;
    setClock(0);
  }, [initialId]);
  useEffect(() => {
    if (!running || !dynamic) return;
    let frame = 0;
    let previous = 0;
    let lastPaint = 0;
    const tick = (now: number) => {
      if (previous) timer.current += Math.min((now - previous) / 1000, 0.08);
      previous = now;
      if (now - lastPaint > 32) {
        setClock(timer.current);
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, dynamic, id]);
  const p = parameters[id];
  const change = (key: string, value: number) =>
    setParameters((previous) => ({
      ...previous,
      [id]: { ...previous[id], [key]: value },
    }));
  const control = (
    key: string,
    label: string,
    min: number,
    max: number,
    step = 1,
    display?: string,
  ) => (
    <Range
      key={key}
      label={label}
      min={min}
      max={max}
      step={step}
      value={p[key]}
      display={display}
      onChange={(value) => change(key, value)}
    />
  );
  const reset = () => {
    setParameters((previous) => ({ ...previous, [id]: { ...defaults[id] } }));
    timer.current = 0;
    setClock(0);
  };
  const select = (nextId: string) => {
    setId(nextId);
    onModuleChange?.(nextId);
    timer.current = 0;
    setClock(0);
  };
  let controls: ReactNode;
  let graphic: ReactNode;
  let metrics: ReactNode;
  let explanation: ReactNode;

  if (id === "physics-motion") {
    const vx = p.speed * Math.cos(p.angle * rad),
      vy = p.speed * Math.sin(p.angle * rad);
    const flight = (2 * vy) / p.gravity,
      range = vx * flight,
      height = (vy * vy) / (2 * p.gravity);
    const duration = Math.max(2.5, Math.min(flight, 6)),
      time = ((clock % duration) / duration) * flight;
    const sx = (x: number) => 38 + (x / Math.max(range * 1.12, 1)) * 290;
    const sy = (y: number) => 205 - (y / Math.max(height * 1.25, 1)) * 175;
    controls = (
      <>
        {control("speed", "初速度", 5, 40, 1, `${p.speed} m/s`)}
        {control("angle", "仰角", 10, 80, 1, `${p.angle}°`)}
        {control(
          "gravity",
          "重力加速度",
          1.6,
          15,
          0.1,
          `${fixed(p.gravity)} m/s²`,
        )}
      </>
    );
    graphic = (
      <Graphic label="拋體軌跡；琥珀色圓點沿計算出的拋物線運動">
        <Axes xLabel="水平距離 x（m）" yLabel="高度 y（m）" />
        <path
          className="sim-line sim-line-dashed"
          d={curve(
            (t) => vy * t - (p.gravity * t * t) / 2,
            0,
            flight,
            (t) => sx(vx * t),
            sy,
          )}
        />
        <path
          className="sim-line"
          d={curve(
            (t) => vy * t - (p.gravity * t * t) / 2,
            0,
            time,
            (t) => sx(vx * t),
            sy,
          )}
        />
        <circle
          className="sim-particle"
          cx={sx(vx * time)}
          cy={sy(Math.max(0, vy * time - (p.gravity * time * time) / 2))}
          r="7"
        />
        <text
          className="sim-chart-label"
          x={sx(range / 2)}
          y={sy(height) - 12}
          textAnchor="middle"
        >
          最高 {fixed(height)} m
        </text>
        <text
          className="sim-chart-label"
          x={sx(range)}
          y="220"
          textAnchor="middle"
        >
          {fixed(range)}
        </text>
        <text className="sim-chart-label" x="49" y="43">
          t = {fixed(time, 2)} s
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="水平射程" value={fixed(range)} unit="m" />
        <Metric label="最大高度" value={fixed(height)} unit="m" />
        <Metric label="飛行時間" value={fixed(flight, 2)} unit="s" />
      </>
    );
    explanation = (
      <Formula note="假設無空氣阻力、重力均勻且發射與落地等高。固定初速時，45° 射程最大；互補的兩個角度有相同射程。動畫以每次 2.5～6 秒播放，讀值仍為物理時間。">
        x = v₀ cosθ · t　y = v₀ sinθ · t − ½gt²
        <br />R = v₀² sin(2θ) / g
      </Formula>
    );
  } else if (id === "physics-wave") {
    const wave1 = (x: number) => Math.sin(2 * Math.PI * p.f1 * (x / 2 - clock));
    const wave2 = (x: number) =>
      Math.sin(2 * Math.PI * p.f2 * (x / 2 - clock) + p.offset * rad);
    const sx = (x: number) => 38 + (x / 4) * 290,
      sy = (y: number) => 114 - y * 38;
    controls = (
      <>
        {control("f1", "波 1 頻率", 0.5, 3, 0.05, `${fixed(p.f1, 2)} Hz`)}
        {control("f2", "波 2 頻率", 0.5, 3, 0.05, `${fixed(p.f2, 2)} Hz`)}
        {control("offset", "波 2 初相位", 0, 360, 5, `${p.offset}°`)}
      </>
    );
    graphic = (
      <Graphic label="藍色與綠色分別是兩列行進波，琥珀色是它們的位移和">
        <Axes xLabel="位置 x（m）" yLabel="位移（m）" zeroY={114} />
        <path
          className="sim-line sim-line-blue"
          d={curve(wave1, 0, 4, sx, sy)}
        />
        <path
          className="sim-line sim-line-green"
          d={curve(wave2, 0, 4, sx, sy)}
        />
        <path
          className="sim-line"
          d={curve((x) => wave1(x) + wave2(x), 0, 4, sx, sy)}
        />
        <text className="sim-chart-label" x="45" y="39">
          +2
        </text>
        <text className="sim-chart-label" x="45" y="198">
          −2
        </text>
        <g className="sim-chart-label">
          <text x="140" y="22" className="sim-blue-text">
            波 1
          </text>
          <text x="196" y="22" className="sim-green-text">
            波 2
          </text>
          <text x="252" y="22">
            疊加
          </text>
        </g>
      </Graphic>
    );
    metrics = (
      <>
        <Metric
          label="拍頻"
          value={fixed(Math.abs(p.f1 - p.f2), 2)}
          unit="Hz"
        />
        <Metric label="波 1 波長" value={fixed(2 / p.f1, 2)} unit="m" />
        <Metric
          label="x = 2 m 的總位移"
          value={fixed(wave1(2) + wave2(2), 2)}
          unit="m"
        />
      </>
    );
    explanation = (
      <Formula note="兩列波的振幅均為 1 m、波速均為 2 m/s，符合線性疊加。兩頻率接近時可清楚聽見拍；相同頻率且相差 180° 時，兩波在所有位置抵消。">
        y = sin[2πf₁(x/v − t)] + sin[2πf₂(x/v − t) + φ]
        <br />
        f拍 = |f₁ − f₂|　λ = v / f
      </Formula>
    );
  } else if (id === "physics-circuit") {
    const current = p.voltage / p.resistance,
      power = p.voltage * current;
    const pathPoints = [
      [70, 55],
      [285, 55],
      [285, 187],
      [70, 187],
      [70, 55],
    ];
    const perimeter = 694;
    const pointAt = (distance: number) => {
      let rest = distance % perimeter;
      for (let i = 0; i < 4; i++) {
        const a = pathPoints[i],
          b = pathPoints[i + 1],
          length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (rest <= length)
          return [
            a[0] + ((b[0] - a[0]) * rest) / length,
            a[1] + ((b[1] - a[1]) * rest) / length,
          ];
        rest -= length;
      }
      return pathPoints[0];
    };
    controls = (
      <>
        {control("voltage", "電池電壓", 1, 24, 0.5, `${fixed(p.voltage)} V`)}
        {control("resistance", "電阻", 5, 100, 1, `${p.resistance} Ω`)}
      </>
    );
    graphic = (
      <Graphic label="理想直流電路；光點表示傳統電流方向，速率僅為示意">
        <path
          className="sim-circuit-wire"
          d="M70 95V55H285V96M285 145V187H70V145"
        />
        <path
          className="sim-circuit-wire"
          d="M70 95V111M70 131V145M49 111H91M58 131H82"
        />
        <path
          className="sim-line"
          d="M285 96L276 101L294 109L276 117L294 125L276 133L285 140V145"
        />
        {Array.from({ length: 7 }, (_, i) => {
          const [x, y] = pointAt(
            (i * perimeter) / 7 + clock * (20 + current * 45),
          );
          return (
            <circle key={i} className="sim-particle" cx={x} cy={y} r="3.5" />
          );
        })}
        <text className="sim-chart-label" x="26" y="158">
          {fixed(p.voltage)} V
        </text>
        <text className="sim-chart-label" x="304" y="125">
          {p.resistance} Ω
        </text>
        <text
          className="sim-current-readout"
          x="177"
          y="116"
          textAnchor="middle"
        >
          {fixed(current, 2)} A
        </text>
        <text className="sim-chart-label" x="177" y="143" textAnchor="middle">
          傳統電流方向 →
        </text>
        <text className="sim-chart-label" x="180" y="227" textAnchor="middle">
          光點速率為示意，非電子實際漂移速率
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="電流 I" value={fixed(current, 2)} unit="A" />
        <Metric label="消耗功率 P" value={fixed(power, 2)} unit="W" />
        <Metric label="每秒通過的電量" value={fixed(current, 2)} unit="C" />
      </>
    );
    explanation = (
      <Formula note="假設電池無內電阻、導線電阻可忽略，且電阻溫度固定。電壓固定時，電阻加倍使電流與功率減半；電阻固定時，電壓加倍使功率變為四倍。">
        V = IR　P = VI = I²R = V²/R　Q = It
      </Formula>
    );
  } else if (id === "chemistry-gas") {
    const pressure = (p.amount * 8.314462618 * p.temperature) / p.volume;
    const boxWidth = 100 + p.volume * 4,
      left = 180 - boxWidth / 2;
    controls = (
      <>
        {control("temperature", "絕對溫度", 200, 600, 5, `${p.temperature} K`)}
        {control("volume", "體積", 5, 40, 0.5, `${fixed(p.volume)} L`)}
        {control(
          "amount",
          "物質的量",
          0.25,
          3,
          0.05,
          `${fixed(p.amount, 2)} mol`,
        )}
      </>
    );
    graphic = (
      <Graphic label="理想氣體容器示意，容器寬度反映體積，粒子數反映物質的量">
        <rect
          className="sim-vessel"
          x={left}
          y="54"
          width={boxWidth}
          height="140"
          rx="8"
        />
        {Array.from({ length: Math.round(p.amount * 14) }, (_, i) => (
          <g key={i}>
            <circle
              className="sim-gas-particle"
              cx={left + 12 + (((i * 71 + 23) % 101) / 101) * (boxWidth - 24)}
              cy={69 + (((i * 43 + 17) % 101) / 101) * 108}
              r="3.5"
            />
            <path
              className="sim-gas-arrow"
              d={`M${left + 12 + (((i * 71 + 23) % 101) / 101) * (boxWidth - 24)} ${69 + (((i * 43 + 17) % 101) / 101) * 108}l${Math.sqrt(p.temperature / 300) * 8} -4`}
            />
          </g>
        ))}
        <text className="sim-chart-label" x="180" y="29" textAnchor="middle">
          {fixed(pressure, 1)} kPa
        </text>
        <text className="sim-chart-label" x="180" y="224" textAnchor="middle">
          粒子與箭頭為數量／熱運動示意，非分子動力學計算
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="氣體壓力" value={fixed(pressure, 1)} unit="kPa" />
        <Metric
          label="攝氏溫度"
          value={fixed(p.temperature - 273.15)}
          unit="°C"
        />
        <Metric label="PV = nRT" value={fixed(pressure * p.volume)} unit="J" />
      </>
    );
    explanation = (
      <Formula note="R = 8.314 J/(mol·K)，且 1 kPa·L = 1 J。理想氣體忽略分子本身體積與分子間作用力；低溫、高壓時真實氣體的偏差會增大。">
        PV = nRT　P = nRT / V<br />
        固定 n、T：P ∝ 1/V；固定 n、V：P ∝ T
      </Formula>
    );
  } else if (id === "chemistry-equilibrium") {
    const equilibriumB = (p.total * p.constant) / (1 + p.constant),
      initialB = (p.total * p.initial) / 100;
    const kReverse = 0.18,
      kForward = p.constant * kReverse;
    const concentrationB = (t: number) =>
      equilibriumB +
      (initialB - equilibriumB) * Math.exp(-(kForward + kReverse) * t);
    const b = concentrationB(p.time),
      a = p.total - b;
    const sx = (t: number) => 38 + (t / 20) * 290,
      sy = (c: number) => 205 - (c / p.total) * 170;
    controls = (
      <>
        {control("constant", "平衡常數 K", 0.1, 10, 0.1, fixed(p.constant))}
        {control(
          "total",
          "總濃度 [A] + [B]",
          0.1,
          3,
          0.1,
          `${fixed(p.total)} mol/L`,
        )}
        {control("initial", "起始 B 的比例", 0, 100, 5, `${p.initial}%`)}
        {control("time", "觀察時間", 0, 20, 0.1, `${fixed(p.time)} s`)}
      </>
    );
    graphic = (
      <Graphic label="A 與 B 的濃度隨時間趨近平衡；虛線是 B 的平衡濃度">
        <Axes xLabel="時間（s）；右端 20 s" yLabel="濃度（mol/L）" />
        <path
          className="sim-grid sim-line-dashed"
          d={`M38 ${sy(equilibriumB)}H328`}
        />
        <path
          className="sim-line sim-line-blue"
          d={curve((t) => p.total - concentrationB(t), 0, 20, sx, sy)}
        />
        <path className="sim-line" d={curve(concentrationB, 0, 20, sx, sy)} />
        <path className="sim-marker-line" d={`M${sx(p.time)} 30V205`} />
        <circle className="sim-particle" cx={sx(p.time)} cy={sy(b)} r="5" />
        <text
          className="sim-chart-label sim-blue-text"
          x="265"
          y={sy(p.total - equilibriumB) - 10}
        >
          A
        </text>
        <text className="sim-chart-label" x="265" y={sy(equilibriumB) - 10}>
          B
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="此時 [A]" value={fixed(a, 3)} unit="mol/L" />
        <Metric label="此時 [B]" value={fixed(b, 3)} unit="mol/L" />
        <Metric
          label="此時反應商 Q"
          value={a < 1e-10 ? "∞" : fixed(b / a, 3)}
        />
      </>
    );
    explanation = (
      <Formula note="封閉系統的一階可逆反應 A ⇌ B，化學計量為 1:1。模型取 k逆 = 0.18 s⁻¹、k正 = K·k逆；用來呈現到達平衡的過程，非特定實驗的速率擬合。平衡時正逆反應仍持續，且 Q = K。">
        K = k正/k逆 = [B]平衡/[A]平衡
        <br />
        d[B]/dt = k正[A] − k逆[B]
      </Formula>
    );
  } else if (id === "chemistry-ph") {
    const start = 10 ** p.logc,
      concentration = start / p.dilution;
    const acidity = (c: number) => {
      const major = (c + Math.sqrt(c * c + 4e-14)) / 2;
      return p.base ? 14 + Math.log10(major) : -Math.log10(major);
    };
    const ph = acidity(concentration),
      before = acidity(start);
    const sx = (x: number) => 38 + (x / 2) * 290,
      sy = (y: number) => 205 - (y / 14) * 175;
    controls = (
      <>
        <div className="sim-choice" role="group" aria-label="溶液種類">
          <button
            type="button"
            className={!p.base ? "sim-choice-active" : ""}
            aria-pressed={!p.base}
            onClick={() => change("base", 0)}
          >
            強酸
          </button>
          <button
            type="button"
            className={p.base ? "sim-choice-active" : ""}
            aria-pressed={!!p.base}
            onClick={() => change("base", 1)}
          >
            強鹼
          </button>
        </div>
        {control(
          "logc",
          "起始濃度 log₁₀ C",
          -8,
          -1,
          0.1,
          `${start.toExponential(1)} M`,
        )}
        {control(
          "dilution",
          "稀釋倍數（最終／起始體積）",
          1,
          100,
          1,
          `${p.dilution} 倍`,
        )}
      </>
    );
    graphic = (
      <Graphic label="強酸或強鹼的 pH 隨稀釋倍數變化；橫軸為對數尺度">
        <Axes xLabel="稀釋倍數（對數刻度）" yLabel="pH" />
        <path className="sim-grid sim-line-dashed" d={`M38 ${sy(7)}H328`} />
        <text className="sim-chart-label" x="42" y={sy(7) - 8}>
          中性 7
        </text>
        <path
          className="sim-line"
          d={curve((logd) => acidity(start / 10 ** logd), 0, 2, sx, sy)}
        />
        <circle
          className="sim-particle"
          cx={sx(Math.log10(p.dilution))}
          cy={sy(ph)}
          r="6"
        />
        <text className="sim-chart-label" x="38" y="219">
          1×
        </text>
        <text className="sim-chart-label" x="183" y="219" textAnchor="middle">
          10×
        </text>
        <text className="sim-chart-label" x="328" y="219" textAnchor="end">
          100×
        </text>
        <text className="sim-chart-label" x="18" y={sy(14) + 3}>
          14
        </text>
        <text className="sim-chart-label" x="22" y="208">
          0
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="稀釋前 pH" value={fixed(before, 2)} />
        <Metric label="稀釋後 pH" value={fixed(ph, 2)} />
        <Metric
          label="稀釋後分析濃度"
          value={concentration.toExponential(1)}
          unit="M"
        />
      </>
    );
    explanation = (
      <Formula note="25°C、單價強酸或強鹼完全解離，忽略活性係數與空氣中 CO₂。已納入水的自解離，因此極稀的酸鹼會趨近 pH 7；單純加水不會使強酸變成鹼性。">
        C後 = C前 / 稀釋倍數　K水 = 10⁻¹⁴
        <br />
        [主要離子] = (C + √(C² + 4K水)) / 2
      </Formula>
    );
  } else if (id === "biology-genetics") {
    const genotypes = ["aa", "Aa", "AA"],
      first = genotypes[p.parent1].split(""),
      second = genotypes[p.parent2].split("");
    const offspring = first.flatMap((a) =>
      second.map((b) => [a, b].sort().join("")),
    );
    const aa = offspring.filter((g) => g === "aa").length / 4,
      AA = offspring.filter((g) => g === "AA").length / 4,
      Aa = 1 - aa - AA;
    controls = (
      <>
        {control("parent1", "親代一基因型", 0, 2, 1, genotypes[p.parent1])}
        {control("parent2", "親代二基因型", 0, 2, 1, genotypes[p.parent2])}
        {control(
          "offspring",
          "預期子代樣本數",
          20,
          200,
          4,
          `${p.offspring} 個`,
        )}
      </>
    );
    graphic = (
      <Graphic
        label={`${genotypes[p.parent1]} 與 ${genotypes[p.parent2]} 的潘尼特方格；四格各有四分之一機率`}
      >
        <text className="sim-chart-label" x="180" y="21" textAnchor="middle">
          每個格子機率均為 ¼
        </text>
        {second.map((allele, i) => (
          <text
            className="sim-allele"
            key={`top${i}`}
            x={146 + i * 82}
            y="51"
            textAnchor="middle"
          >
            {allele}
          </text>
        ))}
        {first.map((allele, i) => (
          <text
            className="sim-allele"
            key={`left${i}`}
            x="81"
            y={102 + i * 74}
            textAnchor="middle"
          >
            {allele}
          </text>
        ))}
        {offspring.map((genotype, i) => (
          <g key={i}>
            <rect
              className={
                genotype === "aa" ? "sim-gene-recessive" : "sim-gene-dominant"
              }
              x={108 + (i % 2) * 82}
              y={64 + Math.floor(i / 2) * 74}
              width="76"
              height="68"
              rx="9"
            />
            <text
              className="sim-gene-text"
              x={146 + (i % 2) * 82}
              y={106 + Math.floor(i / 2) * 74}
              textAnchor="middle"
            >
              {genotype}
            </text>
          </g>
        ))}
        <text className="sim-chart-label" x="180" y="236" textAnchor="middle">
          A 為完全顯性；Aa 與 AA 表現顯性性狀
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric
          label="AA 機率／預期數"
          value={`${AA * 100}% · ${AA * p.offspring}`}
        />
        <Metric
          label="Aa 機率／預期數"
          value={`${Aa * 100}% · ${Aa * p.offspring}`}
        />
        <Metric
          label="aa 機率／預期數"
          value={`${aa * 100}% · ${aa * p.offspring}`}
        />
      </>
    );
    explanation = (
      <Formula note="單一體染色體基因座、完全顯性、配子隨機結合且無選汰。預期個數是機率乘樣本數，真實小樣本未必剛好符合；這個模型不適用多基因或性聯遺傳。">
        P(子代基因型) = 對應格數 / 4<br />
        Aa × Aa → AA : Aa : aa = 1 : 2 : 1
      </Formula>
    );
  } else if (id === "biology-population") {
    const population = (t: number) =>
      p.capacity / (1 + (p.capacity / p.initial - 1) * Math.exp(-p.rate * t));
    const current = population(p.time),
      growth = p.rate * current * (1 - current / p.capacity),
      ymax = Math.max(p.capacity, p.initial) * 1.15;
    const sx = (t: number) => 38 + (t / 40) * 290,
      sy = (n: number) => 205 - (n / ymax) * 174;
    controls = (
      <>
        {control(
          "capacity",
          "環境負載量 K",
          50,
          1000,
          10,
          `${p.capacity} 個體`,
        )}
        {control(
          "rate",
          "內在成長率 r",
          0.05,
          0.8,
          0.01,
          `${fixed(p.rate, 2)} /時間`,
        )}
        {control("initial", "初始族群 N₀", 5, 200, 5, `${p.initial} 個體`)}
        {control("time", "觀察時間", 0, 40, 0.5, fixed(p.time))}
      </>
    );
    graphic = (
      <Graphic label="邏輯斯族群成長曲線；虛線是環境負載量 K">
        <Axes xLabel="時間（任意單位）；右端 40" yLabel="族群個體數 N" />
        <path
          className="sim-grid sim-line-dashed"
          d={`M38 ${sy(p.capacity)}H328`}
        />
        <text className="sim-chart-label" x="48" y={sy(p.capacity) - 8}>
          K = {p.capacity}
        </text>
        <path className="sim-line" d={curve(population, 0, 40, sx, sy)} />
        <path className="sim-marker-line" d={`M${sx(p.time)} 30V205`} />
        <circle
          className="sim-particle"
          cx={sx(p.time)}
          cy={sy(current)}
          r="6"
        />
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="此時族群 N" value={fixed(current)} />
        <Metric label="即時成長 dN/dt" value={fixed(growth, 2)} />
        <Metric
          label="占環境負載量"
          value={fixed((current / p.capacity) * 100)}
          unit="%"
        />
      </>
    );
    explanation = (
      <Formula note="連續時間的 logistic 模型，假設 K 與 r 固定、無遷入遷出。N < K 時成長，N > K 時下降；當 N = K/2 時正成長量最大。圖中可有小數，代表模型的期望值。">
        dN/dt = rN(1 − N/K)
        <br />
        N(t) = K / [1 + (K/N₀ − 1)e⁻ʳᵗ]
      </Formula>
    );
  } else if (id === "biology-enzyme") {
    const tempFactor = (temperature: number) =>
      Math.exp(-(((temperature - 37) / (temperature > 37 ? 12 : 23)) ** 2));
    const phFactor = Math.exp(-(((p.ph - 7) / 1.8) ** 2)),
      saturation = p.substrate / (2 + p.substrate);
    const activity = tempFactor(p.temperature) * phFactor * 100,
      rate = activity * saturation;
    const sx = (temperature: number) => 38 + (temperature / 80) * 290,
      sy = (value: number) => 205 - value * 1.7;
    controls = (
      <>
        {control("temperature", "溫度", 5, 75, 1, `${p.temperature}°C`)}
        {control("ph", "溶液 pH", 2, 12, 0.1, fixed(p.ph))}
        {control(
          "substrate",
          "受質濃度 [S]",
          0.1,
          10,
          0.1,
          `${fixed(p.substrate)} mmol/L`,
        )}
      </>
    );
    graphic = (
      <Graphic label="教學示意酵素曲線，非任何特定酵素的實驗擬合">
        <Axes xLabel="溫度（°C）；右端 80°C" yLabel="相對反應速率（%）" />
        <path
          className="sim-line sim-line-dashed"
          d={curve((t) => tempFactor(t) * phFactor * 100, 0, 80, sx, sy)}
        />
        <path
          className="sim-line"
          d={curve(
            (t) => tempFactor(t) * phFactor * 100 * saturation,
            0,
            80,
            sx,
            sy,
          )}
        />
        <circle
          className="sim-particle"
          cx={sx(p.temperature)}
          cy={sy(rate)}
          r="6"
        />
        <text className="sim-chart-label" x="42" y="31">
          100
        </text>
        <text className="sim-chart-label" x="209" y="54">
          虛線：受質飽和極限
        </text>
        <text className="sim-chart-label" x="180" y="247" textAnchor="middle">
          教學示意，非實驗擬合
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="環境活性因子" value={fixed(activity)} unit="%" />
        <Metric label="相對反應速率" value={fixed(rate)} unit="%" />
        <Metric label="受質飽和度" value={fixed(saturation * 100)} unit="%" />
      </>
    );
    explanation = (
      <Formula note="溫度與 pH 曲線是人為設定的教學示意，非特定酵素的擬合；不可用來推論高溫變性可逆或所有酵素最適溫度相同。受質部分使用 Michaelis–Menten 式，Km = 2 mmol/L；未模擬抑制、時間或不可逆變性。">
        v / Vmax = f溫度 · fpH · [S] / (Km + [S])
        <br />
        本示意設定最高活性：37°C、pH 7
      </Formula>
    );
  } else if (id === "earth-orbit") {
    const theta = (2 * Math.PI * (p.day - 80)) / 365.2422;
    const declination = Math.asin(Math.sin(p.tilt * rad) * Math.sin(theta)),
      latitude = p.latitude * rad;
    const cosHour = -Math.tan(latitude) * Math.tan(declination),
      hour = Math.acos(clamp(cosHour, -1, 1));
    const daylight = (24 * hour) / Math.PI,
      altitude = 90 - Math.abs(p.latitude - declination / rad);
    const meanInsolation =
      (1361 / Math.PI) *
      (hour * Math.sin(latitude) * Math.sin(declination) +
        Math.cos(latitude) * Math.cos(declination) * Math.sin(hour));
    const ex = 180 + 124 * Math.cos(theta),
      ey = 123 + 67 * Math.sin(theta);
    const axisX = Math.sin(p.tilt * rad) * 31,
      axisY = Math.cos(p.tilt * rad) * 31;
    controls = (
      <>
        {control("day", "一年中的日期", 1, 365, 1, `第 ${p.day} 日`)}
        {control("tilt", "地軸傾角", 0, 30, 0.1, `${fixed(p.tilt)}°`)}
        {control(
          "latitude",
          "觀測緯度（北正南負）",
          -60,
          60,
          0.5,
          `${fixed(p.latitude)}°`,
        )}
      </>
    );
    graphic = (
      <Graphic label="地球公轉與地軸傾斜示意，軌道以透視方式繪製而非等比例">
        <ellipse className="sim-orbit" cx="180" cy="123" rx="124" ry="67" />
        <circle className="sim-sun-halo" cx="180" cy="123" r="34" />
        <circle className="sim-sun" cx="180" cy="123" r="22" />
        <path className="sim-solar-ray" d={`M180 123L${ex} ${ey}`} />
        <circle className="sim-earth" cx={ex} cy={ey} r="19" />
        <path
          className="sim-earth-land"
          d={`M${ex - 12} ${ey - 12}l10 1 5 10 -6 7 5 9M${ex + 6} ${ey - 14}l4 9 9 3`}
        />
        <path
          className="sim-axis-tilt"
          d={`M${ex - axisX} ${ey - axisY}L${ex + axisX} ${ey + axisY}`}
        />
        <text className="sim-chart-label" x={ex - axisX - 6} y={ey - axisY - 5}>
          北
        </text>
        <text className="sim-chart-label" x="180" y="35" textAnchor="middle">
          北半球冬至附近
        </text>
        <text className="sim-chart-label" x="180" y="220" textAnchor="middle">
          北半球夏至附近
        </text>
        <text className="sim-chart-label" x="180" y="246" textAnchor="middle">
          圓形軌道近似；軌道、大小與傾角線為示意
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="太陽赤緯" value={fixed(declination / rad)} unit="°" />
        <Metric label="白晝長度" value={fixed(daylight, 2)} unit="hr" />
        <Metric label="當地正午太陽仰角" value={fixed(altitude)} unit="°" />
      </>
    );
    explanation = (
      <Formula
        note={`假設圓形軌道、春分在第 80 日，忽略大氣折射與地形。當地大氣頂日平均入射約 ${fixed(Math.max(0, meanInsolation))} W/m²。四季來自地軸傾斜造成的日照角度與日長變化；本模型未納入地表溫度的季節遲滯。`}
      >
        sinδ = sinε · sin[2π(d − 80)/365.2422]
        <br />
        晝長 = (24/π) arccos(−tan緯度 · tanδ)
      </Formula>
    );
  } else if (id === "earth-seismic") {
    const stations = [
      { x: 30, y: 25, name: "A" },
      { x: 265, y: 40, name: "B" },
      { x: 150, y: 175, name: "C" },
    ];
    const distances = stations.map((station) =>
      Math.hypot(p.x - station.x, p.y - station.y),
    );
    const delta = distances[0] * (1 / p.vs - 1 / p.vp);
    controls = (
      <>
        {control("x", "震央東西位置 x", 20, 280, 1, `${p.x} km`)}
        {control("y", "震央南北位置 y", 20, 180, 1, `${p.y} km`)}
        {control("vp", "P 波速率", 5, 8, 0.1, `${fixed(p.vp)} km/s`)}
        {control("vs", "S 波速率", 2.5, 4.5, 0.1, `${fixed(p.vs)} km/s`)}
      </>
    );
    graphic = (
      <Graphic label="三測站各自的到時差換算為震央距離；三個距離圓交於震央">
        <defs>
          <clipPath id="sim-seismic-clip">
            <rect x="20" y="20" width="300" height="200" rx="6" />
          </clipPath>
        </defs>
        <rect
          className="sim-map"
          x="20"
          y="20"
          width="300"
          height="200"
          rx="6"
        />
        <g clipPath="url(#sim-seismic-clip)">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              className="sim-grid"
              d={`M${20 + i * 60} 20V220M20 ${20 + i * 40}H320`}
            />
          ))}
          {stations.map((station, i) => (
            <circle
              className={`sim-seismic-radius sim-station-${i}`}
              key={station.name}
              cx={station.x + 20}
              cy={station.y + 20}
              r={distances[i]}
            />
          ))}
        </g>
        {stations.map((station, i) => (
          <g key={station.name}>
            <path
              className={`sim-station-marker sim-station-${i}`}
              d={`M${station.x + 20} ${station.y + 13}l-6 12h12Z`}
            />
            <text
              className="sim-chart-label"
              x={station.x + 30}
              y={station.y + 17}
            >
              {station.name} · Δt {fixed(distances[i] * (1 / p.vs - 1 / p.vp))}s
            </text>
          </g>
        ))}
        <circle className="sim-particle" cx={p.x + 20} cy={p.y + 20} r="5" />
        <path
          className="sim-epicenter"
          d={`M${p.x + 10} ${p.y + 20}h20M${p.x + 20} ${p.y + 10}v20`}
        />
        <text className="sim-chart-label" x="175" y="242" textAnchor="middle">
          每一圓：由一個測站到震央的推算距離
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric
          label="A 站 P 波到時"
          value={fixed(distances[0] / p.vp, 2)}
          unit="s"
        />
        <Metric label="A 站 S−P 到時差" value={fixed(delta, 2)} unit="s" />
        <Metric
          label="A 站推算震央距離"
          value={fixed(delta / (1 / p.vs - 1 / p.vp))}
          unit="km"
        />
      </>
    );
    explanation = (
      <Formula note="假設震源在地表、介質均勻且波速固定，忽略折射與地形；圖上三測站不共線，可用三個圓的共同交點定位震央。真實地震須分辨震源深度，並使用地球速度構造與更多測站。">
        Δt = tS − tP = d(1/vS − 1/vP)
        <br />d = Δt / (1/vS − 1/vP)
      </Formula>
    );
  } else {
    const sigma = 5.670374419e-8,
      absorbed = (p.solar * (1 - p.albedo)) / 4;
    const effective = (absorbed / sigma) ** 0.25;
    const surface = (absorbed / (sigma * (1 - p.emissivity / 2))) ** 0.25;
    const sx = (albedo: number) => 38 + (albedo / 0.8) * 290;
    const temperature = (albedo: number) =>
      ((p.solar * (1 - albedo)) / 4 / (sigma * (1 - p.emissivity / 2))) **
        0.25 -
      273.15;
    const sy = (celsius: number) => 205 - ((celsius + 110) / 200) * 174;
    controls = (
      <>
        {control("solar", "太陽常數 S₀", 900, 1800, 5, `${p.solar} W/m²`)}
        {control("albedo", "行星反照率 α", 0, 0.8, 0.01, fixed(p.albedo, 2))}
        {control(
          "emissivity",
          "單層大氣紅外放射率 ε",
          0,
          0.95,
          0.01,
          fixed(p.emissivity, 2),
        )}
      </>
    );
    graphic = (
      <Graphic label="灰體單層大氣模型的地表平衡溫度與反照率關係">
        <Axes xLabel="反照率 α；右端 0.8" yLabel="地表平衡溫度（°C）" />
        <path className="sim-grid sim-line-dashed" d={`M38 ${sy(0)}H328`} />
        <text className="sim-chart-label" x="42" y={sy(0) - 8}>
          0°C
        </text>
        <path className="sim-line" d={curve(temperature, 0, 0.8, sx, sy)} />
        <circle
          className="sim-particle"
          cx={sx(p.albedo)}
          cy={sy(surface - 273.15)}
          r="6"
        />
        <text className="sim-chart-label" x="46" y="30">
          90
        </text>
        <text className="sim-chart-label" x="9" y="208">
          −110
        </text>
        <text className="sim-chart-label" x="180" y="247" textAnchor="middle">
          大氣頂平衡：吸收短波 = 向外長波
        </text>
      </Graphic>
    );
    metrics = (
      <>
        <Metric label="有效輻射溫度 Te" value={fixed(effective)} unit="K" />
        <Metric
          label="地表平衡溫度 Ts"
          value={fixed(surface - 273.15)}
          unit="°C"
        />
        <Metric label="大氣頂吸收／放出" value={fixed(absorbed)} unit="W/m²" />
      </>
    );
    explanation = (
      <Formula note="全球平均、穩態、單層灰體大氣：對太陽短波透明，對地表長波的吸收率與放射率同為 ε，地表視為黑體。除以 4 來自球體表面積／截面積。未含雲、對流、水氣回饋與熱輸送，不能作為真實氣候預測。">
        Te = [S₀(1 − α) / (4σ)]¼
        <br />
        Ts = [S₀(1 − α) / (4σ(1 − ε/2))]¼
      </Formula>
    );
  }

  const selected = simulationCatalog.find((item) => item.id === id)!;
  return (
    <section className="sim-lab" aria-label="互動科學實驗室">
      <div className="sim-toolbar">
        <label className="sim-module-select">
          <span>切換實驗</span>
          <select value={id} onChange={(e) => select(e.target.value)}>
            {["物理", "化學", "生物", "地科"].map((subject) => (
              <optgroup label={subject} key={subject}>
                {simulationCatalog
                  .filter((item) => item.subject === subject)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="sim-actions">
          {dynamic && (
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              aria-pressed={!running}
            >
              {running ? "Ⅱ 暫停" : "▶ 播放"}
            </button>
          )}
          <button type="button" onClick={reset}>
            ↺ 重設
          </button>
        </div>
      </div>
      <div className="sim-lab-heading">
        <span className="sim-subject">{selected.subject} EXPERIMENT</span>
        <h3>{selected.title}</h3>
        <p>{selected.description}</p>
      </div>
      <div className="sim-workbench">
        <div className="sim-visual">
          <div className="sim-visual-caption">
            <span>
              <i /> 即時模型
            </span>
            <span>拖動滑桿，觀察變化</span>
          </div>
          {graphic}
          <div className="sim-metrics" aria-live="off">
            {metrics}
          </div>
        </div>
        <div className="sim-controls">
          <span className="sim-control-eyebrow">由你設定實驗條件</span>
          {controls}
        </div>
      </div>
      {explanation}
    </section>
  );
}
