/**
 * 原創學習導讀，依使用者提供的「111 學年度起適用學測自然考科考試說明」
 * 附錄二整理。課綱代碼標籤用於追溯範圍，不表示每條學習內容已完整教學。
 * 公式同時包含必修核心與解題所需的國中基礎；適用條件寫在 meaning 中。
 * simulation 是共用互動模型的識別碼，各模型只示範部分概念。
 */
export type SubjectId = "physics" | "chemistry" | "biology" | "earth";

export interface Lesson {
  id: string;
  subject: SubjectId;
  title: string;
  subtitle: string;
  chapter: string;
  duration: number;
  difficulty: "基礎" | "進階";
  concepts: string[];
  formulas: { expression: string; meaning: string }[];
  explanation: string;
  strategy: string[];
  misconception: string;
  simulation: string;
  tags: string[];
}

export const subjects: {
  id: SubjectId;
  name: string;
  english: string;
  description: string;
  color: string;
}[] = [
  {
    id: "physics",
    name: "物理",
    english: "Physics",
    description: "從運動、波動到量子，建立可驗證的自然模型。",
    color: "#58b8fa",
  },
  {
    id: "chemistry",
    name: "化學",
    english: "Chemistry",
    description: "用粒子與定量關係，理解物質的組成與轉變。",
    color: "#ffbd69",
  },
  {
    id: "biology",
    name: "生物",
    english: "Biology",
    description: "連結細胞、遺傳與演化，閱讀生命的共同語言。",
    color: "#7ed7ae",
  },
  {
    id: "earth",
    name: "地科",
    english: "Earth Science",
    description: "從地球深處到星空，讀懂環境與時間的證據。",
    color: "#b5a0f5",
  },
];

export const lessons: Lesson[] = [
  {
    id: "physics-motion",
    subject: "physics",
    title: "把運動變成圖像",
    subtitle: "位置、速度與加速度如何互相描述？",
    chapter: "運動與科學測量",
    duration: 12,
    difficulty: "基礎",
    concepts: ["位置與位移", "平均速度", "位置—時間圖斜率", "速度—時間圖面積"],
    formulas: [
      {
        expression: "v̄ = Δx / Δt",
        meaning: "一段時間的平均速度；位移有正負，與平均速率不同。",
      },
      { expression: "v = v₀ + at", meaning: "僅適用於加速度固定的一維運動。" },
      {
        expression: "Δx = v₀t + ½at²",
        meaning: "固定加速度下，初速、時間與位移的關係。",
      },
    ],
    explanation:
      "先選定正方向，再把運動分成時間區間。位置圖越陡代表速度量值越大；速度圖在時間軸下方表示向負方向運動。速度圖的有號面積給位移，各區面積取絕對值後相加才是路程。",
    strategy: [
      "圈出圖軸、單位及正方向。",
      "判斷題目要位移、路程、速度或速率。",
      "分段讀取斜率或面積，最後檢查正負與單位。",
    ],
    misconception: "加速度為負不一定減速；速度與加速度同向時，速率增加。",
    simulation: "physics-motion",
    tags: ["圖表判讀", "國中基礎銜接", "PEb-Vc-2"],
  },
  {
    id: "physics-measurement",
    subject: "physics",
    title: "尺度、單位與測量",
    subtitle: "先問量了什麼，再談數字有多精準。",
    chapter: "運動與科學測量",
    duration: 9,
    difficulty: "基礎",
    concepts: ["國際單位制", "科學記號", "間接測量", "量綱與估算"],
    formulas: [
      {
        expression: "ρ = m / V",
        meaning: "以質量與體積的測量間接求密度；單位須一致。",
      },
      {
        expression: "1 nm = 10⁻⁹ m",
        meaning: "奈米與公尺的換算，注意長度、面積、體積換算的次方。",
      },
    ],
    explanation:
      "自然科常透過可量測的量推得另一個量，例如由路程與時間求速率。原子尺度約為 10⁻¹⁰ 公尺，原子核約為 10⁻¹⁵ 公尺；尺度差異不能只看科學記號前面的數。測量會受工具解析度與方法影響，數字位數多不代表更準確。",
    strategy: [
      "先把數值與單位分開整理。",
      "用基本單位檢查公式兩邊是否一致。",
      "估算合理數量級，再處理有效數字與誤差。",
    ],
    misconception: "把長度單位換算倍率直接套到體積，會漏掉倍率的三次方。",
    simulation: "physics-motion",
    tags: ["PEa-Vc-1", "PEa-Vc-2", "PEa-Vc-3", "探究與實作"],
  },
  {
    id: "physics-newton",
    subject: "physics",
    title: "受力圖與牛頓定律",
    subtitle: "速度的改變來自合力，而不是來自運動本身。",
    chapter: "力與交互作用",
    duration: 14,
    difficulty: "基礎",
    concepts: ["慣性", "合力", "加速度", "作用力與反作用力", "正向力與摩擦力"],
    formulas: [
      {
        expression: "ΣF = ma",
        meaning: "在慣性參考系中，物體受到的合力等於其質量乘加速度。",
      },
      {
        expression: "W = mg",
        meaning: "近地表重力的近似式；此處 W 表示重量而非作功。",
      },
    ],
    explanation:
      "挑選一個研究物體，把其他物體施於它的力畫出來，再沿座標方向加總。靜止與等速度運動的合力都為零。作用力與反作用力大小相等、方向相反，但作用在不同物體上，因此不能在同一物體的受力圖中互相抵消。",
    strategy: [
      "明確標示研究物體及參考系。",
      "只畫作用在該物體上的外力。",
      "分方向列合力式，以運動情況核對結果。",
    ],
    misconception: "物體往右運動不代表合力往右；等速直線運動時合力為零。",
    simulation: "physics-motion",
    tags: ["PEb-Vc-4", "PEb-Vc-5", "受力分析"],
  },
  {
    id: "physics-gravity",
    subject: "physics",
    title: "從落體到行星軌道",
    subtitle: "同一個重力模型，連接地面與太空。",
    chapter: "力與交互作用",
    duration: 13,
    difficulty: "進階",
    concepts: ["萬有引力", "軌道運動", "克卜勒三定律", "向心加速度"],
    formulas: [
      {
        expression: "F = Gm₁m₂ / r²",
        meaning: "球對稱物體外部的重力可用質心距離 r 計算。",
      },
      {
        expression: "T² ∝ a³",
        meaning:
          "繞相同中央天體運動且衛星質量可忽略時，週期平方與橢圓半長軸立方成正比。",
      },
    ],
    explanation:
      "行星繞日不是因為沒有重力，而是重力持續改變速度方向。克卜勒以觀測歸納軌道定律，牛頓再以運動與引力定律提供統一解釋。橢圓軌道的太陽在一個焦點，行星近日時較快，遠日時較慢。",
    strategy: [
      "區分離地高度與到天體中心的距離。",
      "比較同一中央天體的軌道時，優先用比例。",
      "遇到橢圓軌道，先判斷近日點、遠日點與掃掠面積。",
    ],
    misconception: "太空人的失重不是沒有重力，而是和太空船一起自由落下。",
    simulation: "physics-motion",
    tags: ["PEb-Vc-3", "PKb-Vc-1", "PKb-Vc-2"],
  },
  {
    id: "physics-energy",
    subject: "physics",
    title: "能量轉換與作功",
    subtitle: "追蹤能量流向，才能知道哪些量真的守恆。",
    chapter: "能量與熱",
    duration: 12,
    difficulty: "基礎",
    concepts: ["動能", "重力位能", "作功", "能量守恆", "機械能與熱能"],
    formulas: [
      { expression: "K = ½mv²", meaning: "遠小於光速時，物體平移動能的公式。" },
      {
        expression: "ΔU = mgΔh",
        meaning: "近地表、重力加速度近似固定時的重力位能變化。",
      },
      {
        expression: "W = Fd cosθ",
        meaning: "大小與方向固定的力，對位移 d 所作的功。",
      },
    ],
    explanation:
      "能量守恆需先界定系統與外界。滑下斜面的物體可以把位能轉成動能，若有摩擦，一部分能量轉成物體與環境的熱能。此時機械能可能減少，但納入熱與其他形式後，總能量仍守恆。",
    strategy: [
      "畫出初態、末態與系統邊界。",
      "列出能量形式及穿越邊界的傳遞。",
      "檢查能否忽略摩擦，再選機械能或總能量關係。",
    ],
    misconception: "有摩擦不表示能量消失；通常是可觀察的機械能轉成其他形式。",
    simulation: "physics-motion",
    tags: ["PBa-Vc-2", "PNc-Vc-3", "PNc-Vc-4"],
  },
  {
    id: "physics-heat",
    subject: "physics",
    title: "溫度、內能與熱",
    subtitle: "熱是能量的傳遞，溫度是描述狀態的量。",
    chapter: "能量與熱",
    duration: 11,
    difficulty: "基礎",
    concepts: ["克氏溫標", "粒子運動", "熱平衡", "內能", "能源效率"],
    formulas: [
      {
        expression: "T(K) = t(°C) + 273.15",
        meaning: "攝氏與絕對溫標換算；涉及氣體比例時應用 K。",
      },
      {
        expression: "Q = mcΔT",
        meaning: "物態不變且比熱可近似固定時，吸收熱量與溫度變化的關係。",
      },
      {
        expression: "η = 有效輸出能量 / 輸入能量",
        meaning: "效率必須在相同時間或同一次過程中比較能量。",
      },
    ],
    explanation:
      "物體內粒子的動能與交互作用能量共同構成內能。因溫度差造成的能量傳遞稱為熱，方向自發地由高溫流向低溫。相同溫度的不同物體，內能不一定相同；將熱轉為功也受過程與環境條件限制。",
    strategy: [
      "先分清題目問溫度、熱量或內能。",
      "檢查有無相變，避免全程套用比熱式。",
      "討論發電時，同時比較能量守恆與可作功能力。",
    ],
    misconception: "物體不是「含有熱」；熱描述跨系統邊界的能量傳遞。",
    simulation: "chemistry-gas",
    tags: ["PBb-Vc-1", "PBb-Vc-2", "PBb-Vc-3", "PBb-Vc-4"],
  },
  {
    id: "physics-waves",
    subject: "physics",
    title: "波速、頻率與波長",
    subtitle: "波形前進，介質粒子卻不跟著走完全程。",
    chapter: "波與光",
    duration: 11,
    difficulty: "基礎",
    concepts: ["週期", "頻率", "波長", "橫波與縱波", "能量傳遞"],
    formulas: [
      { expression: "v = fλ", meaning: "週期性行進波的波速、頻率與波長關係。" },
      {
        expression: "f = 1 / T",
        meaning: "頻率為每秒振動次數，週期為一次振動所需時間。",
      },
    ],
    explanation:
      "波傳遞擾動與能量，介質粒子通常在平衡位置附近振動。空間波形圖提供波長，固定位置的振動時間圖提供週期。當波由一介質進入另一介質，在穩定波源下頻率維持不變，改變的是波速與波長。",
    strategy: [
      "辨認橫軸是位置還是時間。",
      "量取相鄰同相位點的間距，避免把半波長當波長。",
      "跨介質時先固定波源頻率，再以 v = fλ 比較。",
    ],
    misconception: "振幅大不代表頻率高；振幅與振動快慢是不同特徵。",
    simulation: "physics-wave",
    tags: ["PKa-Vc-1", "圖表判讀"],
  },
  {
    id: "physics-doppler",
    subject: "physics",
    title: "聲音與都卜勒效應",
    subtitle: "救護車靠近時，為什麼聽起來音調較高？",
    chapter: "波與光",
    duration: 9,
    difficulty: "基礎",
    concepts: [
      "音調與頻率",
      "響度與振幅",
      "波源與觀察者相對運動",
      "聲波需要介質",
    ],
    formulas: [
      {
        expression: "v = fλ",
        meaning:
          "聲波在同一均勻介質中的波速近似固定，接收到的頻率變化與波峰到達間隔有關。",
      },
    ],
    explanation:
      "移動的波源在前方壓縮波峰間距，在後方拉大間距。波源與觀察者接近時，接收到的頻率通常較高；遠離時較低。介質中的聲速主要取決於介質狀態，並不因波源朝觀察者移動就直接增加。",
    strategy: [
      "畫出波源、觀察者及各自運動方向。",
      "比較連續波峰到達觀察者的時間間隔。",
      "區分音調變化與遠近造成的音量變化。",
    ],
    misconception: "都卜勒效應改變接收頻率，不代表波源本身的振動頻率改變。",
    simulation: "physics-wave",
    tags: ["PKa-Vc-2", "生活應用"],
  },
  {
    id: "physics-refraction",
    subject: "physics",
    title: "光的反射與折射",
    subtitle: "用波速變化理解光路彎折。",
    chapter: "波與光",
    duration: 12,
    difficulty: "基礎",
    concepts: ["法線", "入射角", "反射定律", "折射率", "光的模型"],
    formulas: [
      { expression: "θ入射 = θ反射", meaning: "角度皆由光線與界面法線量起。" },
      {
        expression: "n = c / v",
        meaning: "介質折射率為真空光速與介質中光速的比。",
      },
      {
        expression: "n₁ sinθ₁ = n₂ sinθ₂",
        meaning: "均勻、各向同性介質界面的折射定律。",
      },
    ],
    explanation:
      "光跨越介質界面時，頻率由光源決定而保持不變，傳播速度與波長則可能改變。進入折射率較大的介質，折射光通常偏向法線。惠更斯觀點可用波前各部分前進速度的差異說明方向改變。",
    strategy: [
      "先畫界面法線，再標角度。",
      "比較兩介質折射率，先定性判斷偏折方向。",
      "檢查角度是相對法線還是相對界面，再代公式。",
    ],
    misconception: "入射角不是光線與水面的夾角，而是與法線的夾角。",
    simulation: "physics-wave",
    tags: ["PKa-Vc-3", "PKa-Vc-4", "PKa-Vc-6"],
  },
  {
    id: "physics-interference",
    subject: "physics",
    title: "干涉、繞射與波動證據",
    subtitle: "光暗條紋揭露單靠直線光路看不見的事。",
    chapter: "波與光",
    duration: 13,
    difficulty: "進階",
    concepts: ["疊加原理", "同相與反相", "路徑差", "障礙尺度與波長"],
    formulas: [
      {
        expression: "Δr = mλ",
        meaning: "兩個同頻、同相且相干的波源，路徑差為整數倍波長時相長干涉。",
      },
      {
        expression: "Δr = (m + ½)λ",
        meaning: "上述條件下，半整數倍波長對應相消；完全抵消另需振幅相等。",
      },
    ],
    explanation:
      "兩列波相遇時，位移依疊加原理相加，因此產生增強或減弱的區域。繞射則是波遇狹縫或障礙後展開的現象；障礙尺度接近波長時更明顯。干涉與繞射支持光的波動性，但不能單獨說明所有光與物質的作用。",
    strategy: [
      "先判斷兩波源是否同頻且相位關係固定。",
      "計算或比較路徑差，再判斷相長或相消。",
      "比較波長與狹縫尺度，而非只看光線畫得多細。",
    ],
    misconception: "相消位置的局部振幅減小，不表示整個系統的能量被消滅。",
    simulation: "physics-wave",
    tags: ["PKa-Vc-5", "PKa-Vc-6", "模型證據"],
  },
  {
    id: "physics-electromagnetism",
    subject: "physics",
    title: "電荷、場與電磁波",
    subtitle: "從兩個電荷的作用，到手機訊號的傳遞。",
    chapter: "電磁與應用",
    duration: 13,
    difficulty: "基礎",
    concepts: ["電場", "庫侖定律", "電磁感應", "電磁波譜", "場的能量"],
    formulas: [
      {
        expression: "F = k|q₁q₂| / r²",
        meaning: "真空中兩個點電荷間電力的量值，方向另由電荷正負判斷。",
      },
      {
        expression: "c = fλ",
        meaning: "所有電磁波在真空中具有相同光速，頻率與波長成反比。",
      },
    ],
    explanation:
      "電荷產生電場；變動的磁場會產生電場，變動的電場也與磁場相連。馬克士威理論預測電磁擾動能在空間傳播，且速度等於光速。無線電、可見光與 X 射線同屬電磁波，差異在頻率與波長。",
    strategy: [
      "以電荷正負先判斷吸引或排斥。",
      "用平方反比判斷改變距離後的作用力。",
      "比較波段時同時區分真空波速、頻率及光子能量。",
    ],
    misconception: "無線電波不需要空氣傳播；電磁波可在真空中傳遞。",
    simulation: "physics-wave",
    tags: [
      "PKc-Vc-1",
      "PKc-Vc-3",
      "PKc-Vc-4",
      "PKc-Vc-5",
      "PKc-Vc-6",
      "PBa-Vc-1",
    ],
  },
  {
    id: "physics-circuits",
    subject: "physics",
    title: "電路、功率與用電安全",
    subtitle: "從串並聯判讀，連結家庭用電。",
    chapter: "電磁與應用",
    duration: 12,
    difficulty: "基礎",
    concepts: ["電流", "電壓", "電阻", "串聯與並聯", "短路與接地"],
    formulas: [
      {
        expression: "V = IR",
        meaning: "溫度等條件固定的歐姆性元件，電壓與電流成正比。",
      },
      {
        expression: "P = VI",
        meaning: "直流元件的電功率；交流用電需依題目條件判斷。",
      },
      {
        expression: "E = Pt",
        meaning: "功率固定時的用電能量；1 度電 = 1 kWh。",
      },
    ],
    explanation:
      "串聯元件通過相同電流，並聯各支路兩端電壓相同。家庭電器大多並聯，因此可獨立使用；同時使用太多高功率電器會讓總電流過大。保險絲與斷路器主要防過電流，接地與漏電保護則降低漏電危險。",
    strategy: [
      "先辨認節點與支路，別只依圖形外觀。",
      "判斷每個元件的電壓與電流，再求功率。",
      "用電量要把瓦、千瓦、小時與秒統一。",
    ],
    misconception: "電流不是流過燈泡後被用完；轉換的是電能。",
    simulation: "physics-circuit",
    tags: ["PMc-Vc-1", "PMc-Vc-2", "國中基礎銜接"],
  },
  {
    id: "physics-photons",
    subject: "physics",
    title: "光子與光電效應",
    subtitle: "為什麼提高亮度，仍可能打不出電子？",
    chapter: "近代物理",
    duration: 12,
    difficulty: "進階",
    concepts: ["光子能量", "頻率與強度", "最低頻率", "光電效應應用"],
    formulas: [
      {
        expression: "E = hf = hc / λ",
        meaning: "單一光子的能量；h 為普朗克常數，λ 為真空波長。",
      },
    ],
    explanation:
      "光的粒子模型把能量視為一份份光子。頻率越高，每個光子的能量越大；同頻率下光強增加，主要表示單位時間光子數增加。若單一光子能量不足以讓材料中的電子逸出，單純增加亮度不能彌補這項能量門檻。",
    strategy: [
      "先判斷題目改變頻率、波長還是強度。",
      "將單一光子能量與材料門檻分開比較。",
      "由實驗結果指出波動模型與光子模型各能解釋什麼。",
    ],
    misconception: "高亮度不等於每個光子的能量較高。",
    simulation: "physics-wave",
    tags: ["PKd-Vc-1", "PKd-Vc-2", "科學模型"],
  },
  {
    id: "physics-atomic",
    subject: "physics",
    title: "能階、光譜與波粒二象性",
    subtitle: "原子的線光譜，是微觀能量的指紋。",
    chapter: "近代物理",
    duration: 13,
    difficulty: "進階",
    concepts: ["離散能階", "吸收與放射", "線光譜", "電子干涉", "模型適用範圍"],
    formulas: [
      {
        expression: "|ΔE| = hf",
        meaning: "原子在兩能階間轉換時，吸收或放出的光子能量對應能階差。",
      },
    ],
    explanation:
      "原子內可允許的能量不是任意連續值。向較低能階躍遷時可放光，向較高能階則需吸收相符的能量，形成特定光譜線。電子也能呈現干涉，因此微觀粒子不能只想成有固定路徑的小球；牛頓模型在原子尺度有適用限制。",
    strategy: [
      "畫出高低能階，標明躍遷方向。",
      "比較能階差，判斷光子的頻率與波長大小。",
      "辨識觀測是支持粒子性、波動性，還是能量量子化。",
    ],
    misconception: "能階高低與相鄰間距是不同的事；不能只靠線條位置猜光子能量。",
    simulation: "physics-wave",
    tags: ["PKd-Vc-3", "PKd-Vc-4", "PKd-Vc-5", "PKd-Vc-6", "PKd-Vc-7"],
  },
  {
    id: "physics-nuclear",
    subject: "physics",
    title: "核能與四種基本交互作用",
    subtitle: "連結核融合、核分裂與輻射安全。",
    chapter: "近代物理",
    duration: 12,
    difficulty: "基礎",
    concepts: [
      "重力與電磁力",
      "強作用與弱作用",
      "質能關係",
      "核融合",
      "核分裂",
    ],
    formulas: [
      {
        expression: "ΔE = Δmc²",
        meaning:
          "核反應前後靜質量的減少，可對應釋出的能量；需統一質量與能量單位。",
      },
    ],
    explanation:
      "原子核內帶正電質子互斥，但短距離強作用能維繫核子。弱作用參與某些粒子衰變。特定輕核融合與重核分裂都能釋出能量，來自反應前後總靜質量差。討論核能需分開比較發電、廢料、曝露途徑與風險管理。",
    strategy: [
      "先辨認變化發生在原子核還是電子。",
      "核反應檢查電荷與核子數的平衡。",
      "比較能源時同時列出效益、限制與證據來源。",
    ],
    misconception:
      "所有核融合與核分裂都放熱並不正確；是否釋能取決於反應前後的質量與束縛狀態。",
    simulation: "physics-motion",
    tags: [
      "PBa-Vc-3",
      "PBa-Vc-4",
      "PKe-Vc-1",
      "PKe-Vc-2",
      "PKe-Vc-3",
      "PNc-Vc-1",
      "PNc-Vc-2",
    ],
  },
  {
    id: "physics-inquiry",
    subject: "physics",
    title: "把觀察變成可檢驗的主張",
    subtitle: "設計公平比較，讀出資料真正支持的結論。",
    chapter: "探究與實作",
    duration: 10,
    difficulty: "基礎",
    concepts: ["操作變因", "應變變因", "控制變因", "重複測量", "模型限制"],
    formulas: [
      {
        expression: "平均值 = 各次量測值總和 / 次數",
        meaning: "相同條件下重複量測的集中趨勢；不能單靠平均消除系統性偏差。",
      },
    ],
    explanation:
      "先提出能用證據回答的問題，再指定操作方式、量測指標與控制條件。重複試驗能觀察資料變異，但無法自動修正儀器零點偏差。圖表中的相關性提供線索，因果主張仍要檢查其他可能影響結果的因素。",
    strategy: [
      "用一句話寫出「改變什麼、測量什麼」。",
      "檢查對照組、控制變因與樣本是否足夠。",
      "以資料支持的範圍寫結論，另外指出限制。",
    ],
    misconception:
      "多做幾次可以減少隨機誤差的影響，卻不一定使有偏差的儀器更準確。",
    simulation: "physics-motion",
    tags: ["PMc-Vc-3", "PMc-Vc-4", "跨科探究", "實驗設計"],
  },

  {
    id: "chemistry-elements",
    subject: "chemistry",
    title: "元素、原子與同位素",
    subtitle: "從質量守恆，走向物質的粒子模型。",
    chapter: "物質的組成與結構",
    duration: 11,
    difficulty: "基礎",
    concepts: ["元素", "原子序", "質量數", "同位素", "原子說的歷史"],
    formulas: [
      {
        expression: "質量數 A = 質子數 Z + 中子數 N",
        meaning: "質量數是核子個數，不等同精確的原子質量。",
      },
      {
        expression: "平均原子量 = Σ(同位素相對質量 × 豐度)",
        meaning: "各豐度以小數表示且總和為 1；採樣來源不同可能略有差異。",
      },
    ],
    explanation:
      "元素由原子核中的質子數區分；同一元素的同位素具有相同質子數、不同中子數。拉瓦節以定量實驗推動質量守恆觀念，道耳頓原子說則用粒子組合解釋反應比例。模型會隨新證據修正，不應把歷史假設當成全部現代結論。",
    strategy: [
      "先用原子序決定元素。",
      "由質量數與原子序求中子數，再判斷是否同位素。",
      "計算平均原子量時使用加權平均。",
    ],
    misconception: "同位素的化學性質通常相近，但物理性質與核穩定性不必相同。",
    simulation: "chemistry-gas",
    tags: ["CAa-Vc-1", "CAa-Vc-2", "CAa-Vc-4", "科學史"],
  },
  {
    id: "chemistry-periodic",
    subject: "chemistry",
    title: "週期表是一張關係圖",
    subtitle: "排列依據與族群特徵，比死背位置更重要。",
    chapter: "物質的組成與結構",
    duration: 10,
    difficulty: "基礎",
    concepts: ["原子序", "週期與族", "金屬", "非金屬", "類金屬"],
    formulas: [],
    explanation:
      "現代週期表依原子序遞增排列，同族元素常呈現相近的化學性質。金屬通常有良好導電性與延展性，非金屬的性質則較多樣；類金屬具有部分介於兩者間的特徵。判斷材料用途時，要把元素位置、鍵結與實際性質資料一起使用。",
    strategy: [
      "確認題目給的是原子序還是質量數。",
      "先找元素所在族，再比較表列性質。",
      "面對例外或新材料，以題目提供的實驗資料為準。",
    ],
    misconception: "週期表不是依原子量嚴格遞增排列；現代排列的依據是原子序。",
    simulation: "chemistry-gas",
    tags: ["CAa-Vc-3", "CAb-Vc-2", "資料判讀"],
  },
  {
    id: "chemistry-bonding",
    subject: "chemistry",
    title: "化學鍵與材料性質",
    subtitle: "從微觀結構推論熔點、導電性與溶解行為。",
    chapter: "物質的組成與結構",
    duration: 13,
    difficulty: "基礎",
    concepts: ["離子鍵", "共價鍵", "金屬鍵", "分子與離子化合物", "結構與功能"],
    formulas: [],
    explanation:
      "離子晶體由正負離子的靜電吸引維繫；分子化合物中的原子以共價鍵結合，分子間另有作用力。材料是否導電，關鍵在有沒有能移動的帶電粒子。離子固體通常不導電，但熔融或在水中形成可移動離子時可能導電。",
    strategy: [
      "先判斷組成粒子是原子、分子還是離子。",
      "分開討論粒子內部的鍵與粒子間作用。",
      "由可移動電荷解釋固態、液態與水溶液的導電差異。",
    ],
    misconception: "分子物質熔化通常不是把分子內所有共價鍵打斷。",
    simulation: "chemistry-gas",
    tags: ["CAb-Vc-3", "CCb-Vc-1", "CCb-Vc-2"],
  },
  {
    id: "chemistry-phase",
    subject: "chemistry",
    title: "三相圖與物態變化",
    subtitle: "溫度和壓力一起決定物質的穩定狀態。",
    chapter: "物質的組成與結構",
    duration: 12,
    difficulty: "進階",
    concepts: ["固液氣三相", "相界線", "三相點", "沸騰與蒸發", "壓力影響"],
    formulas: [],
    explanation:
      "三相圖把溫度、壓力與穩定物態連在一起。沿著相界線，兩相可以共存；三相點則允許三相共存。加熱不一定經過液態，還要看壓力所在的位置。沸點是液體蒸氣壓等於外壓時的溫度，因此外壓改變會影響沸點。",
    strategy: [
      "確認圖軸方向、刻度及單位。",
      "固定壓力或溫度，沿指定路徑追蹤跨越的界線。",
      "讀出相變順序，再判斷是否有足夠資料談吸放熱。",
    ],
    misconception: "「水一定在 100°C 沸騰」只適合特定外壓條件。",
    simulation: "chemistry-equilibrium",
    tags: ["CAb-Vc-1", "圖表判讀"],
  },
  {
    id: "chemistry-separation",
    subject: "chemistry",
    title: "混合物分離與水處理",
    subtitle: "選方法之前，先找成分性質的差異。",
    chapter: "分析與計量",
    duration: 11,
    difficulty: "基礎",
    concepts: ["過濾", "蒸餾", "萃取", "色層分析", "水的純化"],
    formulas: [
      {
        expression: "Rf = 成分移動距離 / 溶劑前緣移動距離",
        meaning: "相同色層分析條件下可比較滯留行為；距離都由起始線量起。",
      },
    ],
    explanation:
      "分離技術利用粒徑、揮發性、溶解性或對不同相的親和力差異。過濾可移除懸浮固體，卻不能直接去除所有溶解離子。蒸餾利用揮發性差異，萃取利用溶質在不同溶劑的分配差異。飲用水處理還需考慮消毒與檢驗。",
    strategy: [
      "列出待分離成分及已知性質。",
      "把目標性質對應到適當分離方法。",
      "檢查目標是去污、消毒、軟化還是取得純水。",
    ],
    misconception: "透明的水不一定純淨或安全；外觀不能取代化學與微生物檢驗。",
    simulation: "chemistry-equilibrium",
    tags: ["CCa-Vc-1", "CCa-Vc-2", "CMc-Vc-1", "探究與實作"],
  },
  {
    id: "chemistry-mole",
    subject: "chemistry",
    title: "莫耳：連結粒子與秤重",
    subtitle: "把看不見的粒子數，換成可量測的質量。",
    chapter: "分析與計量",
    duration: 12,
    difficulty: "基礎",
    concepts: ["物量", "亞佛加厥常數", "莫耳質量", "粒子種類", "單位換算"],
    formulas: [
      {
        expression: "n = m / M",
        meaning: "物量 n 等於質量 m 除以莫耳質量 M。",
      },
      {
        expression: "N = nNₐ",
        meaning: "粒子數等於物量乘亞佛加厥常數；Nₐ = 6.02214076 × 10²³ mol⁻¹。",
      },
    ],
    explanation:
      "莫耳是物量的單位，用於描述指定粒子的數量。1 莫耳水分子與 1 莫耳氧分子含相同分子數，但質量不同。題目中的「粒子」可能指原子、分子或離子，計算前要先指定對象，避免把分子數與原子總數混淆。",
    strategy: [
      "寫出要數的是哪一種粒子。",
      "依質量、物量、粒子數三層逐步換算。",
      "涉及化學式時，再乘每個粒子所含的原子個數。",
    ],
    misconception: "1 莫耳不同物質的質量不相同；相同的是指定粒子的數目。",
    simulation: "chemistry-gas",
    tags: ["CJa-Vc-3", "定量推理"],
  },
  {
    id: "chemistry-stoichiometry",
    subject: "chemistry",
    title: "反應式與限量試劑",
    subtitle: "先守恆，再依莫耳比例推算。",
    chapter: "分析與計量",
    duration: 14,
    difficulty: "進階",
    concepts: [
      "原子守恆",
      "反應係數",
      "限量試劑",
      "理論產量",
      "反應前後總質量",
    ],
    formulas: [
      {
        expression: "n(A) / a = n(B) / b",
        meaning: "aA + bB → 產物中，實際被消耗的 A、B 物量遵守係數比。",
      },
      {
        expression: "產率 = 實際產量 / 理論產量 × 100%",
        meaning: "實際與理論產量需使用相同單位及同一產物。",
      },
    ],
    explanation:
      "化學反應改變原子的組合，而非任意創造或消滅原子。平衡反應式之後，係數提供物量比例。若多種反應物給定，應比較各自能支持的反應程度；最先耗盡者決定理論產物量。開放系統中測得質量改變，可能來自氣體進出。",
    strategy: [
      "平衡反應式，但不改化學式下標。",
      "把所有反應物換成物量並比較 n／係數。",
      "依限量試劑求產物，再檢查剩餘物與質量。",
    ],
    misconception: "係數比是粒子數或莫耳數之比，通常不是直接的質量比。",
    simulation: "chemistry-equilibrium",
    tags: ["CJa-Vc-1", "CJa-Vc-2", "CJa-Vc-3"],
  },
  {
    id: "chemistry-gases",
    subject: "chemistry",
    title: "氣體的壓力與粒子運動",
    subtitle: "用粒子碰撞理解體積、溫度與壓力。",
    chapter: "氣體與溶液",
    duration: 12,
    difficulty: "基礎",
    concepts: ["氣體壓力", "絕對溫度", "波以耳關係", "查理關係", "理想模型"],
    formulas: [
      {
        expression: "PV = nRT",
        meaning: "理想氣體狀態方程式；高壓、低溫或接近液化時偏差可能增大。",
      },
      {
        expression: "P₁V₁ / T₁ = P₂V₂ / T₂",
        meaning: "氣體物量固定時的兩狀態關係，溫度一律用 K。",
      },
    ],
    explanation:
      "氣體壓力來自粒子撞擊容器壁。固定溫度與氣體量時，壓縮體積會提高碰撞頻率，壓力增加。提高絕對溫度會使粒子平均平移動能增加。解題時每個比例關係都隱含固定條件，不能忽略容器是否可伸縮或有無漏氣。",
    strategy: [
      "先列出固定量與改變量。",
      "將攝氏溫度換成絕對溫度。",
      "以比例或狀態方程式求解，再從粒子觀點檢查方向。",
    ],
    misconception: "氣體受熱不代表粒子本身變大；主要改變的是粒子運動與間距。",
    simulation: "chemistry-gas",
    tags: ["CEc-Vc-1", "模型適用範圍"],
  },
  {
    id: "chemistry-concentration",
    subject: "chemistry",
    title: "溶液濃度與稀釋",
    subtitle: "記住分母是溶液，不是加入的溶劑。",
    chapter: "氣體與溶液",
    duration: 11,
    difficulty: "基礎",
    concepts: ["溶質與溶劑", "體積莫耳濃度", "稀釋", "混合", "溶液種類"],
    formulas: [
      {
        expression: "C = n / V",
        meaning: "體積莫耳濃度常用 mol/L；V 為配成的溶液體積。",
      },
      {
        expression: "C₁V₁ = C₂V₂",
        meaning: "無反應、無溶質損失的單純稀釋，依溶質物量守恆。",
      },
    ],
    explanation:
      "濃度同時涉及溶質量與溶液體積。配製定濃度溶液時，應先溶解，再定容至目標體積，而非直接加入同體積的水。混合不同溶液時要先確認是否發生反應，且總體積能否依題意近似相加。",
    strategy: [
      "先算溶質物量，再處理總體積。",
      "將毫升轉成升，或確保比例兩邊一致。",
      "若有沉澱、中和或氣體生成，先處理反應再求剩餘濃度。",
    ],
    misconception: "把 1 mol 溶質加到 1 L 水中，不保證得到恰好 1 L 的溶液。",
    simulation: "chemistry-ph",
    tags: ["CJb-Vc-1", "CJb-Vc-3", "實驗操作"],
  },
  {
    id: "chemistry-solubility",
    subject: "chemistry",
    title: "溶解度與動態平衡",
    subtitle: "看似不變的飽和溶液，微觀仍在交換。",
    chapter: "氣體與溶液",
    duration: 12,
    difficulty: "進階",
    concepts: [
      "未飽和與飽和",
      "溶解度曲線",
      "溶解與結晶",
      "動態平衡",
      "降溫析晶",
    ],
    formulas: [
      {
        expression: "溶解度 = 飽和時溶質質量 / 溶劑質量 × 100",
        meaning: "常以每 100 g 溶劑可溶解的溶質克數表示，必須註明溫度。",
      },
    ],
    explanation:
      "定溫下，與未溶固體接觸的飽和溶液中，溶解和結晶速率可達相同。這是動態平衡，並非粒子停止運動。由溶解度曲線推算析晶量時，要追蹤溶劑質量與溫度；不同物質的溶解度對溫度反應不一定相同。",
    strategy: [
      "讀清溶解度的分母是水還是整份溶液。",
      "換算當前溶劑量可溶解的最大溶質量。",
      "比較前後溫度的容量，檢查有無蒸發或結晶水條件。",
    ],
    misconception: "飽和不等於濃度很高；低溶解度物質也可形成很稀的飽和溶液。",
    simulation: "chemistry-equilibrium",
    tags: ["CJb-Vc-2", "CJe-Vc-1", "圖表判讀"],
  },
  {
    id: "chemistry-energy",
    subject: "chemistry",
    title: "反應中的吸熱與放熱",
    subtitle: "系統與環境的能量變化，符號相反。",
    chapter: "化學反應",
    duration: 10,
    difficulty: "基礎",
    concepts: ["系統與環境", "放熱反應", "吸熱反應", "能量圖", "能量守恆"],
    formulas: [
      {
        expression: "ΔH = H產物 − H反應物",
        meaning: "以焓變描述定壓反應的熱效應；放熱為負，吸熱為正。",
      },
      {
        expression: "q溶液 = mcΔT",
        meaning:
          "無相變、比熱近似固定時，估計溶液吸收的熱量；須另考慮容器與散熱。",
      },
    ],
    explanation:
      "若產物能量低於反應物，差額可釋放到環境，屬放熱；反之需由環境吸收能量。放熱反應仍可能需要點火，因為反應開始有能量障礙。量熱實驗應清楚區分反應系統與被加熱的溶液，才能正確判斷符號。",
    strategy: [
      "先指出討論的是反應系統還是環境。",
      "由溫度變化判斷熱的方向。",
      "讀能量圖時分開看反應物、產物差與活化障礙。",
    ],
    misconception: "環境溫度升高通常代表反應放熱，而不是反應系統吸熱。",
    simulation: "chemistry-equilibrium",
    tags: ["CBa-Vc-1", "CBa-Vc-2", "跨科能量"],
  },
  {
    id: "chemistry-rate",
    subject: "chemistry",
    title: "反應速率與公平比較",
    subtitle: "粉末比塊狀快，關鍵是可接觸的表面。",
    chapter: "化學反應",
    duration: 10,
    difficulty: "基礎",
    concepts: ["反應速率", "接觸面積", "粒子碰撞", "催化劑", "控制變因"],
    formulas: [
      {
        expression: "平均生成速率 = Δ產物量 / Δt",
        meaning: "依題目可用濃度、氣體體積或質量表示，須註明量測條件。",
      },
    ],
    explanation:
      "把固體磨成粉末可增加與另一反應物接觸的面積，常使反應更快。比較速率時，應保持總量、溫度等條件一致，並以相同指標量測。催化劑能改變反應途徑與速率，但不會任意增加反應物所能生成的理論產量。",
    strategy: [
      "辨認以哪個物理量追蹤反應進度。",
      "以初期斜率或相同時間產量比較，避免混用指標。",
      "檢查各組是否只改變欲研究的操作變因。",
    ],
    misconception: "反應完成所需時間變短，不代表最後生成的物質一定較多。",
    simulation: "chemistry-equilibrium",
    tags: ["CJe-Vc-2", "實驗設計", "圖表斜率"],
  },
  {
    id: "chemistry-acid-base",
    subject: "chemistry",
    title: "酸鹼、pH 與中和",
    subtitle: "強弱描述解離程度，濃稀描述含量。",
    chapter: "化學反應",
    duration: 14,
    difficulty: "進階",
    concepts: [
      "水的自解離",
      "阿瑞尼斯酸鹼",
      "強酸與弱酸",
      "pH 的對數尺度",
      "中和",
    ],
    formulas: [
      {
        expression: "pH = −log₁₀[H⁺]",
        meaning: "高中稀水溶液以 mol/L 數值近似計算；嚴格定義使用活度。",
      },
      {
        expression: "[H⁺][OH⁻] ≈ 10⁻¹⁴",
        meaning: "25°C 的稀水溶液近似關係；其他溫度的水離子積不同。",
      },
    ],
    explanation:
      "強酸在水中幾乎完全解離，弱酸只有部分解離，不能直接把強酸等同濃酸。pH 每差 1，氫離子濃度約差 10 倍。酸鹼混合先以反應物量判斷剩餘酸或鹼，再求濃度，不能直接平均兩個 pH。",
    strategy: [
      "先分辨強弱與濃稀兩組概念。",
      "混合時先算酸鹼可反應的物量。",
      "除以反應後總體積，再計算 pH 並檢查近似條件。",
    ],
    misconception:
      "任何溫度的中性溶液都滿足 [H⁺] = [OH⁻]，但 pH 不一定恰為 7。",
    simulation: "chemistry-ph",
    tags: ["CJd-Vc-1", "CJd-Vc-2", "CJd-Vc-3", "CJd-Vc-4"],
  },
  {
    id: "chemistry-redox",
    subject: "chemistry",
    title: "氧化還原與電子轉移",
    subtitle: "先追蹤誰失電子，再命名氧化劑。",
    chapter: "化學反應",
    duration: 11,
    difficulty: "基礎",
    concepts: ["氧化", "還原", "氧化劑", "還原劑", "電子守恆"],
    formulas: [
      {
        expression: "失去的電子數 = 得到的電子數",
        meaning: "同一完整氧化還原反應中，電子轉移必須平衡。",
      },
    ],
    explanation:
      "廣義氧化是失去電子，還原是得到電子，兩者必然配對。氧化劑使別的物質氧化，自己則被還原；還原劑恰好相反。可由電荷或氧化數變化追蹤電子，並把燃燒、腐蝕、漂白與電池連成共同概念。",
    strategy: [
      "找出反應前後電子或氧化數的變化。",
      "先命名被氧化與被還原的物質。",
      "最後再判斷氧化劑、還原劑並核對電子數。",
    ],
    misconception: "氧化劑不是「自己被氧化」的物質；它接受電子而被還原。",
    simulation: "physics-circuit",
    tags: ["CJc-Vc-1", "CJc-Vc-2", "生活應用"],
  },
  {
    id: "chemistry-organic",
    subject: "chemistry",
    title: "生活中的有機物與清潔",
    subtitle: "用分子結構理解營養與界面活性。",
    chapter: "化學與永續",
    duration: 11,
    difficulty: "基礎",
    concepts: ["醣類", "蛋白質", "油脂", "核酸", "親水端與親油端"],
    formulas: [],
    explanation:
      "醣類、蛋白質、油脂與核酸的結構差異，對應儲能、催化、膜結構與遺傳等功能。界面活性劑同時有親水與親油部分，可幫助油污分散於水中。肥皂在硬水中可能與鈣、鎂離子形成不溶物，因此清潔表現會受水質影響。",
    strategy: [
      "先分辨化合物類別，再討論功能。",
      "畫出親水端、親油端與油水位置。",
      "比較清潔實驗時，同時控制水量、硬度與攪拌條件。",
    ],
    misconception: "能把油污分散的清潔劑，不代表把所有油脂都化學分解了。",
    simulation: "chemistry-equilibrium",
    tags: ["CJf-Vc-1", "CJf-Vc-2", "CJf-Vc-3", "跨科生命"],
  },
  {
    id: "chemistry-sustainability",
    subject: "chemistry",
    title: "污染、材料與永續選擇",
    subtitle: "比較效益與代價，需要系統邊界與證據。",
    chapter: "化學與永續",
    duration: 13,
    difficulty: "進階",
    concepts: [
      "酸雨",
      "臭氧層",
      "溫室效應",
      "碳與水循環",
      "水資源再利用",
      "替代能源",
    ],
    formulas: [
      {
        expression: "質量收支 = 輸入 − 輸出 + 生成 − 消耗",
        meaning: "在指定系統與時間內追蹤污染物或資源；跨系統轉移不代表消失。",
      },
    ],
    explanation:
      "酸雨、臭氧層耗損與全球暖化具有不同機制，不能混為一談。評估新材料、藥品、能源或化學製程時，應同時檢視原料、製造、使用及廢棄階段。資源回收可減少部分負擔，但效果取決於處理效率、能源與污染轉移。",
    strategy: [
      "明確指出問題的主要物質、來源與作用機制。",
      "比較方案時使用相同功能單位與系統邊界。",
      "區分可量測結果、價值選擇與尚未確定的推論。",
    ],
    misconception: "臭氧層破洞不是近代全球暖化的主要直接成因。",
    simulation: "earth-climate",
    tags: [
      "CMa-Vc-1",
      "CMc-Vc-2",
      "CMc-Vc-3",
      "CMe-Vc-1",
      "CMe-Vc-2",
      "CMe-Vc-3",
      "CMe-Vc-4",
      "CNa-Vc-1",
      "CNa-Vc-2",
      "CNa-Vc-3",
      "CNa-Vc-4",
      "CNc-Vc-1",
    ],
  },

  {
    id: "biology-cell-theory",
    subject: "biology",
    title: "細胞學說與生命尺度",
    subtitle: "觀察工具如何改變我們對生命的理解？",
    chapter: "細胞與能量",
    duration: 10,
    difficulty: "基礎",
    concepts: ["細胞學說", "顯微觀察", "生命的基本單位", "原核與真核"],
    formulas: [
      {
        expression: "影像長度 = 實際長度 × 放大倍率",
        meaning: "線性放大倍率的關係；數位縮放後須以圖中比例尺為準。",
      },
    ],
    explanation:
      "細胞學說指出生物由細胞構成、細胞是構造與功能基本單位，且新細胞由既有細胞產生。這些主張來自不同研究者與工具累積的證據。原核細胞沒有核膜包圍的細胞核，但仍具有 DNA、核糖體與細胞膜。",
    strategy: [
      "先讀比例尺，再比較細胞大小。",
      "以有無核膜等證據區分原核與真核。",
      "科學史題用實驗證據連結主張，避免只背人名。",
    ],
    misconception: "沒有細胞核不等於沒有遺傳物質；原核細胞也有 DNA。",
    simulation: "biology-enzyme",
    tags: ["BDa-Vc-1", "BDa-Vc-2", "BMb-Vc-1", "科學史"],
  },
  {
    id: "biology-organelles",
    subject: "biology",
    title: "細胞構造與分工",
    subtitle: "形態、位置與功能之間，有可追問的關係。",
    chapter: "細胞與能量",
    duration: 12,
    difficulty: "基礎",
    concepts: ["細胞膜", "細胞核", "粒線體", "葉綠體", "核糖體", "細胞分化"],
    formulas: [],
    explanation:
      "細胞以構造分工完成生命活動。核糖體負責蛋白質合成，粒線體參與有氧呼吸，葉綠體參與光合作用。不同細胞的構造數量與形態會配合功能，例如需要大量能量的細胞常有較多粒線體；推論仍須配合實際觀察。",
    strategy: [
      "先判讀是動物、植物還是原核細胞。",
      "把功能需求對應到相關構造。",
      "將「常見」與「所有細胞一定具有」分開判斷。",
    ],
    misconception: "植物細胞不只有葉綠體，也可有粒線體並進行呼吸作用。",
    simulation: "biology-enzyme",
    tags: ["BDa-Vc-1", "BDa-Vc-2", "BDa-Vc-9"],
  },
  {
    id: "biology-membrane",
    subject: "biology",
    title: "膜與物質進出",
    subtitle: "濃度差、選擇性與能量需求要一起看。",
    chapter: "細胞與能量",
    duration: 11,
    difficulty: "基礎",
    concepts: ["選擇性通透", "擴散", "滲透", "主動運輸", "細胞大小限制"],
    formulas: [
      {
        expression: "表面積／體積 ∝ 1 / 線性尺度",
        meaning: "對形狀相同的幾何體，尺寸變大時表面積與體積比下降。",
      },
    ],
    explanation:
      "細胞膜不是完全密封的牆，而是具有選擇性的界面。粒子可有隨機運動，但在濃度差存在時呈現淨擴散；水經選擇性通透膜的淨移動涉及滲透。細胞變大時，每單位體積可用來交換物質的表面積相對減少。",
    strategy: [
      "先辨認膜能讓哪些粒子通過。",
      "分開追蹤水與溶質的淨移動方向。",
      "判斷是否逆濃度梯度，以及是否需要能量來源。",
    ],
    misconception: "達平衡後粒子仍持續運動，消失的是整體淨移動。",
    simulation: "chemistry-equilibrium",
    tags: ["BDa-Vc-1", "國中基礎銜接", "跨科擴散"],
  },
  {
    id: "biology-enzymes",
    subject: "biology",
    title: "酵素與實驗曲線",
    subtitle: "反應變快，並不代表能量需求被憑空創造。",
    chapter: "細胞與能量",
    duration: 12,
    difficulty: "進階",
    concepts: ["生物催化", "受質專一性", "溫度與 pH", "變性", "速率量測"],
    formulas: [
      {
        expression: "平均反應速率 = Δ產物量 / Δt",
        meaning: "比較酵素作用時需使用相同測定方式與時間區段。",
      },
    ],
    explanation:
      "酵素是生物催化劑，多數為蛋白質，能降低反應所需的活化障礙。溫度與酸鹼條件會影響其結構及作用。受質很多時，固定量酵素的處理能力可能接近上限。這些曲線提供細胞功能與探究方法的銜接，不宜把單一曲線視為所有酵素的通則。",
    strategy: [
      "辨認操作變因、應變變因及控制條件。",
      "以初期斜率比較速率，留意產物累積曲線的平臺。",
      "區分低溫作用慢與高溫造成結構破壞。",
    ],
    misconception: "酵素不改變反應的總能量差，也不保證讓所有反應都放熱。",
    simulation: "biology-enzyme",
    tags: ["BDa-Vc-1", "跨科探究", "實驗設計", "銜接補充"],
  },
  {
    id: "biology-energy",
    subject: "biology",
    title: "ATP、光合與呼吸",
    subtitle: "追蹤物質與能量，別只背互為反應式。",
    chapter: "細胞與能量",
    duration: 14,
    difficulty: "基礎",
    concepts: ["ATP", "光合作用", "細胞呼吸", "能量轉換", "碳循環"],
    formulas: [
      {
        expression: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
        meaning:
          "光合作用的簡化總反應式；需有光能與相關生物機制，不代表單一步驟。",
      },
      {
        expression: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
        meaning: "有氧呼吸的簡化總反應式，釋能可部分轉存於 ATP，其餘散為熱。",
      },
    ],
    explanation:
      "光合作用把光能轉存到有機物相關的化學能，呼吸作用則釋出有機物能量供細胞使用。ATP 是細胞生理作用可直接利用的重要能量媒介，並非長期大量儲能的唯一物質。植物日夜都可呼吸，白天的淨氣體交換取決於光合與呼吸的相對速率。",
    strategy: [
      "分開列出物質來源、去向與能量來源。",
      "讀氣體變化時辨認總速率或淨速率。",
      "比較光照、暗處與對照組，避免把呼吸忽略。",
    ],
    misconception: "植物不是只在夜間呼吸；有光時也持續進行細胞呼吸。",
    simulation: "biology-enzyme",
    tags: ["BDa-Vc-3", "BDa-Vc-4", "跨科能量"],
  },
  {
    id: "biology-cycle",
    subject: "biology",
    title: "細胞週期與 DNA 量",
    subtitle: "染色體數和 DNA 含量不是同一把尺。",
    chapter: "分裂與生殖",
    duration: 12,
    difficulty: "進階",
    concepts: ["間期", "DNA 複製", "細胞分裂期", "姊妹染色分體", "染色體計數"],
    formulas: [
      {
        expression: "DNA 量：複製前 2C → 複製後 4C",
        meaning:
          "以一般二倍體體細胞為例；C 是單套未複製基因組的 DNA 量，不代表染色體套數。",
      },
    ],
    explanation:
      "細胞週期包括間期與分裂期。DNA 在間期的 S 期複製，之後每條已複製染色體可含兩條姊妹染色分體。辨認染色體數通常依著絲點計數；DNA 量加倍不等於染色體套數加倍。題目若問整個細胞或每個細胞核，答案也可能不同。",
    strategy: [
      "先標明細胞階段與統計單位。",
      "用著絲點數辨認染色體數。",
      "將 DNA 含量曲線與複製、分離、胞質分裂分別對應。",
    ],
    misconception: "S 期後 DNA 含量加倍，但一般不直接稱為由二倍體變成四倍體。",
    simulation: "biology-genetics",
    tags: ["BDa-Vc-5", "BDa-Vc-6", "圖表判讀"],
  },
  {
    id: "biology-mitosis",
    subject: "biology",
    title: "有絲分裂與細胞分化",
    subtitle: "相同基因組，如何成為不同功能的細胞？",
    chapter: "分裂與生殖",
    duration: 11,
    difficulty: "基礎",
    concepts: [
      "染色體排列",
      "姊妹染色分體分離",
      "生長與修復",
      "細胞分化",
      "基因表現差異",
    ],
    formulas: [
      {
        expression: "1 個親細胞 → 2 個子細胞",
        meaning:
          "一次典型有絲分裂完成胞質分裂後的細胞數變化；不包含例外與未完成分裂情況。",
      },
    ],
    explanation:
      "有絲分裂把複製後的遺傳物質分配到兩個子細胞，通常維持染色體套數。受精卵透過分裂增加細胞數，再由不同基因表現形成多種細胞。分化多半不是把不需要的基因全部丟掉，而是調整哪些基因何時、何處表現。",
    strategy: [
      "看染色體位於中央還是正在分離，判讀分裂階段。",
      "區分細胞數增加與單一細胞體積增加。",
      "解釋分化時，連結基因表現與細胞構造功能。",
    ],
    misconception:
      "神經細胞與肌肉細胞功能不同，通常不表示它們擁有完全不同的基因組。",
    simulation: "biology-genetics",
    tags: ["BDa-Vc-6", "BDa-Vc-7", "BDa-Vc-9"],
  },
  {
    id: "biology-meiosis",
    subject: "biology",
    title: "減數分裂與遺傳多樣性",
    subtitle: "同源染色體分開，為配子保留一套資訊。",
    chapter: "分裂與生殖",
    duration: 14,
    difficulty: "進階",
    concepts: [
      "同源染色體",
      "減數第一分裂",
      "減數第二分裂",
      "獨立分配",
      "互換與受精",
    ],
    formulas: [
      {
        expression: "2n → n",
        meaning: "典型二倍體生物經減數分裂形成單倍體產物的套數變化。",
      },
      {
        expression: "獨立分配的染色體組合數 = 2ⁿ",
        meaning: "n 為同源染色體對數；此式只計獨立分配，不含互換等來源。",
      },
    ],
    explanation:
      "減數分裂前 DNA 複製一次，之後連續分裂兩次。第一分裂主要分離同源染色體，第二分裂主要分離姊妹染色分體。獨立分配、互換與隨機受精讓後代有多種遺傳組合；動物配子形成還可能有不均等的胞質分裂。",
    strategy: [
      "先找同源配對，分辨第一與第二分裂。",
      "分開計算套數、染色體數與 DNA 量。",
      "使用組合公式前，檢查題目是否考慮互換與連鎖。",
    ],
    misconception:
      "一次減數分裂不一定產生四個等大的成熟配子；卵的形成會有極體。",
    simulation: "biology-genetics",
    tags: ["BDa-Vc-8", "BGa-Vc-3", "染色體學說"],
  },
  {
    id: "biology-mendel",
    subject: "biology",
    title: "孟德爾法則與機率",
    subtitle: "把基因型、配子與表現型分成三層。",
    chapter: "遺傳的規律",
    duration: 13,
    difficulty: "基礎",
    concepts: ["等位基因", "顯性與隱性", "分離律", "獨立分配律", "試交"],
    formulas: [
      {
        expression: "Aa × Aa → 1 AA : 2 Aa : 1 aa",
        meaning:
          "單一基因、雙等位、配子等機率結合且無選汰等條件下的期望基因型比。",
      },
      {
        expression: "P(A 且 B) = P(A)P(B)",
        meaning: "僅當事件 A、B 獨立時可直接相乘。",
      },
    ],
    explanation:
      "孟德爾以大量可比較的交配資料推論遺傳規律。等位基因在形成配子時分離；不同基因若符合獨立分配，才可把機率相乘。3：1 表現型比還需要完全顯性等條件，且是大量後代的期望，不保證小家庭恰好符合。",
    strategy: [
      "先定義等位基因及顯隱性。",
      "列親代可能產生的配子與機率。",
      "由後代資料反推親代，再檢查模型前提。",
    ],
    misconception: "顯性不代表常見、較有利或一定比隱性強。",
    simulation: "biology-genetics",
    tags: ["BGa-Vc-1", "BGa-Vc-3", "BMb-Vc-2", "機率推理"],
  },
  {
    id: "biology-inheritance-extension",
    subject: "biology",
    title: "遺傳法則的延伸",
    subtitle: "不符合 3：1，不代表遺傳失去規律。",
    chapter: "遺傳的規律",
    duration: 13,
    difficulty: "進階",
    concepts: ["不完全顯性", "共顯性", "複等位基因", "多基因性狀", "環境影響"],
    formulas: [
      {
        expression: "Iᴬi × Iᴮi → A、B、AB、O 各 1/4",
        meaning: "ABO 血型單純模型的交配期望，忽略罕見型與其他基因影響。",
      },
    ],
    explanation:
      "基因型到表現型的關係可比完全顯性更複雜。ABO 血型展示族群中可有多種等位基因，但單一二倍體個體仍通常只有兩個。身高等連續性狀常受多基因與環境共同影響，不能硬套單基因方格。",
    strategy: [
      "先由題目資料決定顯性關係。",
      "區分族群中的等位基因種類與個體攜帶的數目。",
      "面對連續分布，考慮多基因及環境，而非強求整數比。",
    ],
    misconception: "共顯性不是兩種表徵平均混合；兩種等位基因的效果可同時呈現。",
    simulation: "biology-genetics",
    tags: ["BGa-Vc-2", "BGa-Vc-7"],
  },
  {
    id: "biology-sex-linked",
    subject: "biology",
    title: "性聯遺傳與家族譜",
    subtitle: "把性染色體傳遞方向畫清楚。",
    chapter: "遺傳的規律",
    duration: 13,
    difficulty: "進階",
    concepts: ["X 聯遺傳", "帶因者", "家族譜", "性染色體", "條件機率"],
    formulas: [
      {
        expression: "P(患病且為男性) = P(男性) × P(患病 | 男性)",
        meaning:
          "需依題目族群與親代條件指定各機率，不可混淆所有後代與男性後代。",
      },
    ],
    explanation:
      "在典型 XX／XY 系統中，父親把 X 傳給女兒、把 Y 傳給兒子。X 聯隱性性狀因男性通常只有一條 X，較容易在其攜帶該等位基因時表現。家族譜只提供部分證據，個別小家族未必能唯一判定遺傳模式。",
    strategy: [
      "先讀圖例，標性別與親子關係。",
      "依遺傳假設填入可確定的基因型。",
      "分清問的是全部子女、兒子或女兒中的機率。",
    ],
    misconception: "X 聯性狀通常不會沿父親的 X 直接傳給兒子。",
    simulation: "biology-genetics",
    tags: ["BGa-Vc-4", "BMb-Vc-3", "家族譜判讀"],
  },
  {
    id: "biology-dna",
    subject: "biology",
    title: "DNA、RNA 與遺傳資訊",
    subtitle: "化學組成與鹼基配對，支持資訊的複製。",
    chapter: "分子遺傳與科技",
    duration: 12,
    difficulty: "基礎",
    concepts: ["核苷酸", "DNA 雙股", "互補配對", "半保留複製", "遺傳物質證據"],
    formulas: [
      {
        expression: "雙股 DNA：A = T，G = C",
        meaning:
          "比較整個雙股 DNA 的鹼基總數；不適合直接套在任意單股片段或 RNA。",
      },
    ],
    explanation:
      "核酸由核苷酸連成鏈，序列可承載資訊。DNA 的互補配對讓每條舊股能作為新股合成的模板，這是半保留複製的基礎。證明遺傳物質的實驗要辨認處理、對照與可追蹤物質，而非只記最後一句結論。",
    strategy: [
      "先確認樣本是 DNA 還是 RNA、單股還是雙股。",
      "寫互補序列時注意股的方向標示。",
      "實驗題把操作處理與最後觀察分開列出。",
    ],
    misconception:
      "互補配對規律約束兩股之間的關係，不表示單股一定有相等的 A 與 T。",
    simulation: "biology-genetics",
    tags: ["BGa-Vc-5", "分子證據"],
  },
  {
    id: "biology-expression",
    subject: "biology",
    title: "中心法則與基因表現",
    subtitle: "從序列資訊，走向具有功能的產物。",
    chapter: "分子遺傳與科技",
    duration: 13,
    difficulty: "進階",
    concepts: ["轉錄", "轉譯", "遺傳密碼", "蛋白質", "突變與表徵"],
    formulas: [
      {
        expression: "DNA → RNA → 蛋白質",
        meaning:
          "細胞中常見的資訊表現路徑；RNA 也可能本身具有功能，並有反轉錄等情形。",
      },
      {
        expression: "1 個密碼子 = 3 個 RNA 核苷酸",
        meaning: "轉譯依閱讀框讀取密碼子，終止密碼子不指定胺基酸。",
      },
    ],
    explanation:
      "轉錄以 DNA 模板產生 RNA，轉譯再依 mRNA 序列合成多肽。不同細胞可調控不同基因的表現，因此相似基因組可呈現不同功能。序列改變不一定改變胺基酸，即使改變胺基酸，也不一定造成可觀察的表徵差異。",
    strategy: [
      "辨認模板股、編碼股與 mRNA。",
      "確認閱讀框，再依題附密碼表翻譯。",
      "把序列、蛋白質功能與表徵三層推論分開。",
    ],
    misconception: "不是每個基因都只以「做出一種蛋白質」為唯一終點。",
    simulation: "biology-genetics",
    tags: ["BGa-Vc-6", "BGa-Vc-7", "BDa-Vc-9"],
  },
  {
    id: "biology-biotechnology",
    subject: "biology",
    title: "基因轉殖與生技證據",
    subtitle: "知道操作目標，也要知道對照能排除什麼。",
    chapter: "分子遺傳與科技",
    duration: 12,
    difficulty: "進階",
    concepts: ["目標基因", "載體", "基因表現", "選殖", "風險與效益"],
    formulas: [],
    explanation:
      "基因轉殖把特定遺傳資訊帶入目標細胞或生物，以研究功能或產生所需產物。基因進入細胞不保證一定表現成功，還要檢查調控條件與實際產物。討論生技應分清技術能否達成目標、可能影響，以及倫理與管理的價值選擇。",
    strategy: [
      "以流程圖標示基因來源、載體與接受者。",
      "指定能確認轉入與表現的證據。",
      "比較有無目標基因的對照，避免把其他差異誤認為基因效果。",
    ],
    misconception: "偵測到某段 DNA，不等於已證明有足量且功能正常的蛋白質產生。",
    simulation: "biology-genetics",
    tags: ["BMc-Vc-1", "探究與實作", "科學與社會"],
  },
  {
    id: "biology-evolution",
    subject: "biology",
    title: "天擇如何改變族群",
    subtitle: "個體有差異，跨世代的比例才會改變。",
    chapter: "演化與多樣性",
    duration: 13,
    difficulty: "基礎",
    concepts: ["可遺傳變異", "差異繁殖成功", "天擇", "等位基因頻率", "抗藥性"],
    formulas: [
      {
        expression: "p(A) = A 等位基因數 / 全部等位基因數",
        meaning:
          "指定同一基因座與族群後的頻率定義；一般二倍體常染色體總數為 2N。",
      },
    ],
    explanation:
      "天擇需要族群中存在可遺傳差異，且不同表徵在特定環境下有不同繁殖成功率。環境改變可能使既有變異的比例改變，並非每個個體因需求而主動產生指定突變。抗生素可篩選原有或新生的抗藥變異，讓其後代比例提高。",
    strategy: [
      "找出變異、遺傳與繁殖成功三項證據。",
      "比較不同世代的表徵或等位基因頻率。",
      "檢查環境條件改變後，原有優勢是否仍成立。",
    ],
    misconception:
      "天擇不具有預先規畫的目標，演化也不是每個個體在一生中刻意進步。",
    simulation: "biology-population",
    tags: ["BGb-Vc-1", "BGb-Vc-2", "BMb-Vc-4"],
  },
  {
    id: "biology-classification",
    subject: "biology",
    title: "共同祖先與生命樹",
    subtitle: "分類是對親緣關係的可修正假說。",
    chapter: "演化與多樣性",
    duration: 12,
    difficulty: "進階",
    concepts: ["同源構造", "化石", "分子證據", "分支圖", "生物多樣性"],
    formulas: [],
    explanation:
      "現代分類強調共同祖先與演化分支，會整合形態、化石與分子資料。分支圖的節點代表共同祖先，親緣遠近取決於最近共同祖先，而不是圖上兩個名稱的距離。相似功能可能由不同祖先獨立演化，因此不能只靠外觀判斷。",
    strategy: [
      "先找兩群最近的共同祖先。",
      "用共享衍生特徵支持分支關係。",
      "資料衝突時比較證據與方法，保留模型修正空間。",
    ],
    misconception: "現生物種不是排成由低等到高等的單一路線；分支可同時延續。",
    simulation: "biology-population",
    tags: ["BGb-Vc-3", "BGb-Vc-4", "BGb-Vc-5", "證據整合"],
  },

  {
    id: "earth-universe",
    subject: "earth",
    title: "宇宙尺度與觀測",
    subtitle: "用不同波段，看見不同物理過程。",
    chapter: "宇宙與觀星",
    duration: 11,
    difficulty: "基礎",
    concepts: [
      "太陽系與銀河系",
      "光年",
      "宇宙膨脹",
      "多波段天文",
      "觀測與推論",
    ],
    formulas: [
      {
        expression: "距離 = 光速 × 傳播時間",
        meaning: "在適用的近似下估計光行距離；宇宙學遙遠距離需考慮空間膨脹。",
      },
    ],
    explanation:
      "行星、恆星、星系與星系群具有不同尺度。光年是光在一年內走過的距離，並非時間單位。紅外線、可見光、電波與 X 射線觀測可揭露不同溫度、成分與能量過程；單一波段的影像並不代表天體的全部面貌。",
    strategy: [
      "先辨識天體層級與距離單位。",
      "以波段與儀器條件判斷能取得的資訊。",
      "區分直接觀測量與依模型推得的結論。",
    ],
    misconception: "銀河系不是太陽系的另一個名稱；太陽系是銀河系的一小部分。",
    simulation: "earth-orbit",
    tags: ["EEd-Vc-1", "EEd-Vc-3", "自然尺度"],
  },
  {
    id: "earth-stars",
    subject: "earth",
    title: "恆星顏色、亮度與距離",
    subtitle: "看起來亮，不一定本身發出的能量多。",
    chapter: "宇宙與觀星",
    duration: 13,
    difficulty: "進階",
    concepts: ["光度", "視亮度", "視星等", "絕對星等", "表面溫度"],
    formulas: [
      {
        expression: "F = L / (4πd²)",
        meaning: "忽略消光且各向均勻輻射時，接收通量隨距離平方反比變化。",
      },
      {
        expression: "m₁ − m₂ = −2.5 log₁₀(F₁ / F₂)",
        meaning: "同一波段的星等差與通量比；題目提供時可作定量比較。",
      },
    ],
    explanation:
      "光度描述恆星本身單位時間釋出的能量，視亮度還受距離與介質消光影響。星等數值越小表示越亮；絕對星等把距離統一到 10 秒差距以便比較。恆星顏色可反映表面溫度，一般藍白色比紅色表面溫度高。",
    strategy: [
      "先判斷比較的是觀測亮度還是內在光度。",
      "同光度時先用距離平方反比。",
      "讀星等注意大小方向，並確認波段及消光條件。",
    ],
    misconception: "肉眼看到最亮的星，不一定是光度最大或離我們最近的恆星。",
    simulation: "earth-orbit",
    tags: ["EEd-Vc-2", "EEd-Vc-4", "圖表判讀"],
  },
  {
    id: "earth-solar-system",
    subject: "earth",
    title: "太陽系與地球的宜居環境",
    subtitle: "行星差異，來自形成條件與後續演變。",
    chapter: "宇宙與觀星",
    duration: 11,
    difficulty: "基礎",
    concepts: [
      "太陽星雲學說",
      "類地與類木行星",
      "小行星與彗星",
      "液態水",
      "大氣演化",
    ],
    formulas: [],
    explanation:
      "太陽星雲學說以旋轉氣塵盤的演化解釋太陽系形成。距離太陽不同，溫度與可凝結材料不同，有助於說明行星差異。地球適合生命與軌道、質量、大氣及長期環境演變有關；海洋與生物也參與大氣成分的改變。",
    strategy: [
      "比較行星時逐項列出質量、組成、溫度與大氣。",
      "以形成過程解釋特徵，避免只背分類。",
      "把宜居條件與已找到生命的證據分開。",
    ],
    misconception: "位在適居帶不等於已證明有生命，還需考慮大氣與表面等條件。",
    simulation: "earth-orbit",
    tags: ["EHa-Vc-1", "EHa-Vc-2", "EHa-Vc-3"],
  },
  {
    id: "earth-sky-motion",
    subject: "earth",
    title: "星空的周日與周年運動",
    subtitle: "把地球自轉與公轉的效果分開。",
    chapter: "宇宙與觀星",
    duration: 13,
    difficulty: "進階",
    concepts: ["地球自轉", "地球公轉", "天球", "北天極", "觀測緯度"],
    formulas: [
      {
        expression: "周日視運動約 15°／小時",
        meaning: "以一周約 24 小時作近似；精確恆星日約為 23 小時 56 分。",
      },
      {
        expression: "北天極仰角 ≈ 北緯緯度",
        meaning: "北半球理想幾何關係，忽略地形遮蔽與大氣折射。",
      },
    ],
    explanation:
      "地球自西向東自轉，使恆星呈現由東向西的周日視運動。地球公轉讓同一鐘錶時間可見的星空隨季節改變。觀測地點的緯度影響星跡中心的仰角與可見星區，不能把臺灣看到的星軌方向直接套到所有地點。",
    strategy: [
      "先辨認題目是同一夜、不同季節或不同緯度。",
      "標出東西南北與北天極。",
      "用旋轉方向推星跡，再檢查照片朝向。",
    ],
    misconception:
      "星空每天的主要轉動不是恆星繞地球公轉，而是地球自轉的視效果。",
    simulation: "earth-orbit",
    tags: ["EFb-Vc-1", "天文觀測"],
  },
  {
    id: "earth-seasons",
    subject: "earth",
    title: "四季、日照與太陽軌跡",
    subtitle: "地軸傾角改變受光方式，而非只靠日地距離。",
    chapter: "宇宙與觀星",
    duration: 12,
    difficulty: "基礎",
    concepts: ["地軸傾斜", "太陽直射緯度", "正午高度", "晝長", "南北半球季節"],
    formulas: [
      {
        expression: "正午太陽高度 = 90° − |φ − δ|",
        meaning: "φ 為觀測緯度、δ 為太陽赤緯，採同一正負約定，忽略折射與地形。",
      },
    ],
    explanation:
      "地軸傾斜且方向在一年中近似不變，使太陽直射緯度在南北回歸線間移動，連帶改變日照長短與入射角。北半球夏季時南半球為冬季，這也顯示日地距離不是四季的主要成因。臺灣不同季節的日出方位與正午影長會變化。",
    strategy: [
      "先標觀測地點的半球與緯度。",
      "依日期判斷太陽赤緯與晝長趨勢。",
      "比較正午高度、影長與單位面積受光，不把三者混成一個量。",
    ],
    misconception:
      "夏天較熱主要與日照時間及太陽高度有關，不是地球在夏天一定離太陽較近。",
    simulation: "earth-orbit",
    tags: ["EId-Vc-1", "跨科幾何"],
  },
  {
    id: "earth-interior",
    subject: "earth",
    title: "地震波看見地球內部",
    subtitle: "無法直接走進地心，也能用波找到分層。",
    chapter: "固體地球",
    duration: 13,
    difficulty: "進階",
    concepts: ["P 波", "S 波", "地殼與地函", "地核", "成分與力學分層"],
    formulas: [
      {
        expression: "傳播時間 = 路徑長 / 波速",
        meaning: "均勻介質的簡化估計；真實地球波速隨深度變化，路徑也會折射。",
      },
    ],
    explanation:
      "P 波可在固體與流體中傳播，S 波不能在一般液體中傳播。走時、折射與陰影區提供地球內部分層的證據。地殼、地函、地核偏重成分分類；岩石圈、軟流圈則偏重力學性質。地函大部分是固態，仍能在長時間尺度緩慢流動。",
    strategy: [
      "確認圖中是走時、振幅還是速度。",
      "以波速變化與有無 S 波推論介質性質。",
      "分清震源位置、測站位置與地球分層界線。",
    ],
    misconception:
      "地函並不是一整層液態岩漿；固態也可能在地質時間尺度產生流動。",
    simulation: "earth-seismic",
    tags: ["EFa-Vc-1", "EFa-Vc-2", "間接證據"],
  },
  {
    id: "earth-plate-tectonics",
    subject: "earth",
    title: "板塊邊界與臺灣",
    subtitle: "地震、火山與地形，是相對運動留下的線索。",
    chapter: "固體地球",
    duration: 14,
    difficulty: "基礎",
    concepts: ["大陸漂移", "海底擴張", "張裂", "聚合", "錯動", "隱沒帶"],
    formulas: [
      {
        expression: "平均速率 = 位移 / 時間",
        meaning:
          "板塊速率常以 cm／年表示；長時間平均不代表每一時刻的局部斷層運動。",
      },
    ],
    explanation:
      "大陸輪廓、化石、海底年齡與磁條帶等證據逐步支持板塊構造。不同邊界的相對運動造成不同地形與震源分布。臺灣位於聚合環境，但區域構造複雜，不能把整座島只用單一簡圖完全描述。",
    strategy: [
      "先由箭頭判斷板塊相對運動。",
      "以海溝、山脈、火山與震源深度交叉驗證。",
      "讀剖面時檢查水平距離與深度比例。",
    ],
    misconception: "板塊邊界不等於海岸線；一個板塊可同時包含大陸與海洋岩石圈。",
    simulation: "earth-seismic",
    tags: ["EIa-Vc-1", "EIa-Vc-2", "EIa-Vc-3", "EIa-Vc-4"],
  },
  {
    id: "earth-geologic-time",
    subject: "earth",
    title: "地層、化石與地質時間",
    subtitle: "先排列事件，再判斷能否算出年齡。",
    chapter: "固體地球",
    duration: 13,
    difficulty: "進階",
    concepts: ["地層疊置", "切割關係", "化石對比", "相對年代", "放射性定年"],
    formulas: [
      {
        expression: "N = N₀(½)^(t / t½)",
        meaning: "封閉系統且衰變常數穩定時，母同位素隨時間衰減；t½ 為半衰期。",
      },
    ],
    explanation:
      "未被倒轉或擾動的沉積層，通常下老上新；侵入與斷層切割可提供事件先後。化石能協助不同地點地層對比，放射性定年則可提供數值年代。定年結果對應的是特定物質及事件，不是看到任何岩石就能直接得到其沉積時間。",
    strategy: [
      "先依疊置、切割與不整合排事件順序。",
      "辨認定年的樣本與所代表的地質事件。",
      "使用半衰期前，確認母子同位素與初始條件資訊。",
    ],
    misconception: "沉積岩中的碎屑礦物年齡，可能早於沉積岩本身的形成。",
    simulation: "earth-seismic",
    tags: ["EHb-Vc-1", "EHb-Vc-2", "時間尺度"],
  },
  {
    id: "earth-atmosphere",
    subject: "earth",
    title: "大氣垂直結構與輻射",
    subtitle: "氣壓隨高度下降，溫度卻不是一路下降。",
    chapter: "大氣與天氣",
    duration: 11,
    difficulty: "基礎",
    concepts: ["對流層", "平流層", "氣壓", "輻射吸收", "臭氧"],
    formulas: [],
    explanation:
      "大氣壓來自上方空氣柱的重量，因此通常隨高度增加而下降。溫度剖面由能量吸收與傳遞決定，對流層常隨高度降溫，平流層則因臭氧吸收紫外線而呈不同趨勢。大氣分層依據主要是溫度變化，不是以固定化學成分分成硬殼。",
    strategy: [
      "先讀橫軸是溫度、氣壓還是密度。",
      "逐段判斷溫度隨高度的增減。",
      "用主要能量來源解釋差異，避免把氣壓趨勢誤套到溫度。",
    ],
    misconception: "越高越冷不是所有大氣層都成立的規律。",
    simulation: "earth-climate",
    tags: ["EFa-Vc-3", "大氣剖面"],
  },
  {
    id: "earth-humidity",
    subject: "earth",
    title: "水氣、露點與雲",
    subtitle: "相對濕度變大，不一定是水氣變多。",
    chapter: "大氣與天氣",
    duration: 13,
    difficulty: "基礎",
    concepts: ["水氣壓", "飽和", "相對濕度", "露點", "上升冷卻"],
    formulas: [
      {
        expression: "RH = e / eₛ(T) × 100%",
        meaning:
          "相對濕度是實際水氣壓與同溫飽和水氣壓的比，並非水氣質量百分比。",
      },
    ],
    explanation:
      "飽和水氣壓通常隨溫度升高而增加。若水氣量近似不變，降溫會提高相對濕度，冷卻至露點後可能出現凝結。空氣上升到較低氣壓處會膨脹降溫，是雲形成的重要機制；不宜把它想成空氣容器被水氣塞滿。",
    strategy: [
      "先判斷改變的是溫度、水氣量或兩者。",
      "把實際水氣量與飽和值分別追蹤。",
      "若有上升過程，連結氣壓下降、膨脹與冷卻。",
    ],
    misconception:
      "相對濕度 100% 不代表空氣有 100% 都是水，也不保證一定正在下雨。",
    simulation: "earth-climate",
    tags: ["EIb-Vc-1", "EIb-Vc-2", "EIb-Vc-3", "EIb-Vc-4"],
  },
  {
    id: "earth-winds",
    subject: "earth",
    title: "氣壓與風的方向",
    subtitle: "風場是多種力共同作用的結果。",
    chapter: "大氣與天氣",
    duration: 13,
    difficulty: "進階",
    concepts: ["氣壓梯度力", "科氏力", "摩擦力", "等壓線", "南北半球差異"],
    formulas: [],
    explanation:
      "氣壓梯度力由高壓指向低壓，科氏力使北半球運動方向偏右、南半球偏左，摩擦則影響近地面風。北半球地面低壓附近常呈逆時針向內輻合，高壓常順時針向外輻散。風向描述風吹來的方向，而非吹去的位置。",
    strategy: [
      "先確認半球與近地面或高空。",
      "由等壓線疏密判斷氣壓梯度大小。",
      "綜合偏向與摩擦，推定風向及輻合、輻散。",
    ],
    misconception: "在大尺度風場中，風不一定直接垂直等壓線從高壓吹向低壓。",
    simulation: "earth-climate",
    tags: ["EIb-Vc-5", "EIb-Vc-6", "天氣圖判讀"],
  },
  {
    id: "earth-weather-map",
    subject: "earth",
    title: "天氣圖、鋒面與季風",
    subtitle: "把壓力、風與雲雨證據放回同一張圖。",
    chapter: "大氣與天氣",
    duration: 14,
    difficulty: "進階",
    concepts: ["地面天氣圖", "冷暖氣團", "鋒面", "季風", "衛星與雷達資料"],
    formulas: [],
    explanation:
      "天氣圖整合各地同一時段的觀測，能呈現壓力系統與鋒面位置。鋒面附近不同氣團相遇，常造成上升、雲與降水，但實際天氣仍受水氣、地形與系統移動影響。臺灣季節風向與降雨分布要同時考慮大尺度環流及迎背風坡。",
    strategy: [
      "先確認圖的時間、圖例及系統位置。",
      "以風、溫度與濕度的變化判斷系統通過。",
      "加入臺灣地形與水氣來源，再推估區域差異。",
    ],
    misconception: "低氣壓或鋒面存在不代表每個地點都一定同時下雨。",
    simulation: "earth-climate",
    tags: ["EIb-Vc-6", "資料整合", "臺灣環境"],
  },
  {
    id: "earth-ocean",
    subject: "earth",
    title: "海水性質、海流與聖嬰",
    subtitle: "海洋儲存熱量，也和大氣交換訊息。",
    chapter: "海洋與氣候",
    duration: 14,
    difficulty: "進階",
    concepts: ["鹽度", "溫躍層", "密度", "表面海流", "湧升流", "聖嬰現象"],
    formulas: [],
    explanation:
      "表水鹽度受蒸發、降水、河川與冰的形成融化等影響；海溫會隨深度與緯度變化。盛行風驅動表面海流，海水與大氣交換熱量。聖嬰涉及熱帶太平洋海溫、風場與對流的耦合改變，不宜只用單一地點變暖或單次暴雨判定。",
    strategy: [
      "分清剖面圖與水平分布圖。",
      "把風向、海流、海溫與降水資料逐一連結。",
      "與多年平均比較，辨認異常而非只看絕對值。",
    ],
    misconception:
      "鹽度高不一定代表密度絕對較大；溫度與壓力等條件也會影響密度。",
    simulation: "earth-climate",
    tags: ["EFa-Vc-4", "EFa-Vc-5", "EIc-Vc-1", "EIb-Vc-7"],
  },
  {
    id: "earth-tides",
    subject: "earth",
    title: "波浪、潮汐與海岸",
    subtitle: "波高、潮位與潮流，是不同的量。",
    chapter: "海洋與氣候",
    duration: 12,
    difficulty: "基礎",
    concepts: ["風浪", "潮汐", "大潮與小潮", "日地月配置", "潮流與海岸地形"],
    formulas: [
      {
        expression: "v = fλ",
        meaning: "週期性水波的基本關係；波速仍受水深與波長等條件影響。",
      },
    ],
    explanation:
      "海面波浪主要受風驅動，會侵蝕、搬運與堆積海岸物質。潮汐是日地月引潮作用與海盆響應共同造成的海面週期變化。新月、滿月附近常有較大潮差，但各地高潮時間與潮型仍受地形與傳播影響；臺灣海峽潮流也有區域差異。",
    strategy: [
      "先辨認資料是波高、潮位還是水流速度。",
      "由月相判斷大潮、小潮趨勢。",
      "讀地方潮汐表與地形，不用簡單幾何硬猜精確時間。",
    ],
    misconception: "大潮不等於高潮；大潮描述一段時間潮差較大。",
    simulation: "earth-orbit",
    tags: ["EIc-Vc-2", "EIc-Vc-3", "EIc-Vc-4", "跨科波動"],
  },
  {
    id: "earth-climate-change",
    subject: "earth",
    title: "氣候變遷的證據與行動",
    subtitle: "時間尺度、基準期與因果歸因要分清。",
    chapter: "海洋與氣候",
    duration: 14,
    difficulty: "進階",
    concepts: [
      "天氣與氣候",
      "溫室效應",
      "自然與人為因素",
      "海平面",
      "減緩與調適",
      "永續發展",
    ],
    formulas: [
      {
        expression: "距平 = 觀測值 − 基準期平均值",
        meaning: "比較氣候異常時要使用一致基準期，距平不是絕對溫度。",
      },
    ],
    explanation:
      "氣候變化可出現在不同時間尺度，過去自然變化的機制不能直接解釋近代所有變化。多種觀測與物理研究支持人類活動是近幾十年暖化的主要因素。減緩著重降低溫室氣體排放與增加移除；調適則降低已發生或預期衝擊的脆弱度。",
    strategy: [
      "確認時間範圍、區域與基準期。",
      "比較多項獨立證據，避免用單一天氣事件代替趨勢。",
      "評估方案時列出減排、風險、成本與受影響群體。",
    ],
    misconception: "某天寒流或某地降溫，不能單獨推翻全球長期暖化趨勢。",
    simulation: "earth-climate",
    tags: [
      "ENb-Vc-1",
      "ENb-Vc-2",
      "ENb-Vc-3",
      "ENb-Vc-4",
      "ENa-Vc-1",
      "ENa-Vc-2",
      "ENa-Vc-3",
    ],
  },
  {
    id: "earth-hazards",
    subject: "earth",
    title: "颱風、地震與風險判讀",
    subtitle: "危害強度、曝露與脆弱度共同形成風險。",
    chapter: "環境與防災",
    duration: 13,
    difficulty: "基礎",
    concepts: [
      "颱風生成條件",
      "太平洋高壓",
      "地震規模",
      "震度",
      "防災與不確定性",
    ],
    formulas: [
      {
        expression: "P、S 到時差 = tS − tP",
        meaning:
          "一般到時差越大表示測站距震源越遠；實際定位需走時模型及多個測站。",
      },
    ],
    explanation:
      "颱風需要暖海面、水氣與適合的環境，路徑受大尺度引導氣流影響。臺灣的風雨還受颱風相對位置與地形左右。地震規模描述事件大小，震度描述各地搖晃情形；防災應依官方即時資訊，而不是用歷史互動模型預測下一次災害。",
    strategy: [
      "讀颱風路徑時一併檢查時間與預報不確定範圍。",
      "由迎風坡、雨帶與位置推估不同地區影響。",
      "地震題分清規模、震度、震央與震源，再整合測站資料。",
    ],
    misconception: "同一次地震通常有一個事件規模，但不同地點可有不同震度。",
    simulation: "earth-seismic",
    tags: ["EMd-Vc-1", "EMd-Vc-2", "EMd-Vc-3", "EMd-Vc-4", "資料判讀"],
  },
];
