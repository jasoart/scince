import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Atom,
  BookMarked,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Download,
  ExternalLink,
  FlaskConical,
  Globe2,
  GraduationCap,
  Leaf,
  Lightbulb,
  Menu,
  Orbit,
  Search,
  Sparkles,
  Target,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { lessons, subjects } from "./data/curriculum";
import type { Lesson, SubjectId } from "./data/curriculum";
import { examGuide } from "./data/curriculum-guide";
import { lessonDetails, practiceCount } from "./data/lesson-details";
import { ScienceFormula } from "./render/ScienceRenderer";
import { asset } from "./lib/assets";
import { researchSources } from "./data/research";

const SimulationLab = lazy(() => import("./components/SimulationLab"));
const StudyPath = lazy(() => import("./components/StudyPath"));
const LessonReader = lazy(() => import("./components/LessonReader"));
const RenderingStudio = lazy(() => import("./components/RenderingStudio"));
const AITutor = lazy(() => import("./components/AITutor"));
type Page =
  | "home"
  | "library"
  | "lab"
  | "studio"
  | "path"
  | "notebook"
  | "sources"
  | "ai";
const navItems: { id: Page; label: string; icon: typeof Compass }[] = [
  { id: "home", label: "探索總覽", icon: Compass },
  { id: "library", label: "觀念圖書館", icon: BookOpen },
  { id: "lab", label: "互動實驗室", icon: FlaskConical },
  { id: "studio", label: "公式工作台", icon: BookMarked },
  { id: "path", label: "學習路徑", icon: Target },
  { id: "notebook", label: "我的學習筆記", icon: Bookmark },
];
const subjectIcons = {
  physics: Orbit,
  chemistry: FlaskConical,
  biology: Leaf,
  earth: Globe2,
};
const subjectNames = {
  physics: "物理",
  chemistry: "化學",
  biology: "生物",
  earth: "地科",
  integrated: "跨科／待分類",
};
const previews = [
  {
    id: "physics-motion",
    subject: "物理",
    title: "把拋物線，交給你。",
    desc: "改變發射角度，找出飛得最遠的祕密。",
    tag: "拋體運動",
    art: "projectile",
  },
  {
    id: "biology-genetics",
    subject: "生物",
    title: "生命的答案，藏在組合裡。",
    desc: "親手配對等位基因，觀察遺傳機率。",
    tag: "孟德爾遺傳",
    art: "genetics",
  },
  {
    id: "earth-orbit",
    subject: "地科",
    title: "傾斜 23.4°，於是有了四季。",
    desc: "轉動地球，理解日照與季節的關係。",
    tag: "地球與太空",
    art: "orbit",
  },
];
const quizzes = [
  {
    question:
      "同一地點、不計空氣阻力，以相同初速拋射，哪個仰角的水平射程最遠？",
    options: ["30°", "45°", "60°"],
    answer: 1,
    reason: "落點與起點等高時，R = v₀² sin(2θ) / g；θ = 45° 時 sin(90°) = 1。",
  },
  {
    question: "Aa × Aa 交配，子代基因型為 aa 的機率是多少？",
    options: ["1/4", "1/2", "3/4"],
    answer: 0,
    reason:
      "每位親代傳出 a 的機率都是 1/2；兩者同時傳出 a 的機率為 1/2 × 1/2 = 1/4。",
  },
  {
    question: "固定溫度與氣體莫耳數時，體積加倍，理想氣體的壓力變為？",
    options: ["2 倍", "不變", "1/2 倍"],
    answer: 2,
    reason: "由 PV = nRT，溫度與莫耳數不變，壓力和體積成反比。",
  },
];
function readLocal<T>(key: string, fallback: T): T {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");
    return data ?? fallback;
  } catch {
    return fallback;
  }
}
function validIds(key: string) {
  const value = readLocal<unknown>(key, []);
  return Array.isArray(value)
    ? value.filter(
        (x): x is string =>
          typeof x === "string" && lessons.some((l) => l.id === x),
      )
    : [];
}
function useSavedIds(key: string) {
  const [value, setValue] = useState<string[]>(() => validIds(key));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage may be unavailable. */
    }
  }, [key, value]);
  return [
    value,
    (id: string) =>
      setValue((old) =>
        old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
      ),
  ] as const;
}
function Art({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 320 142"
      aria-hidden="true"
      className={`card-art art-${kind}`}
    >
      {kind === "projectile" ? (
        <>
          <defs>
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".15" />
            </pattern>
          </defs>
          <rect width="320" height="142" fill="url(#dots)" />
          <path
            d="M32 118 Q134 -80 281 118"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 6"
          />
          <path d="M24 118H300M32 125V20" stroke="currentColor" opacity=".3" />
          <circle cx="150" cy="26" r="12" fill="currentColor" />
          <path
            d="m150 26 36 3m-6-5 6 5-7 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text x="36" y="137" fontSize="9" fill="currentColor">
            0
          </text>
          <text x="281" y="137" fontSize="9" fill="currentColor">
            R
          </text>
        </>
      ) : kind === "genetics" ? (
        <>
          <g stroke="currentColor" strokeWidth="2" fill="none" opacity=".5">
            <path d="M75 0C235 48 75 94 235 142M235 0C75 48 235 94 75 142" />
            {[15, 36, 60, 82, 106, 128].map((y, i) => (
              <path
                key={y}
                d={`M${i % 2 ? 108 : 95} ${y}h${i % 2 ? 94 : 120}`}
              />
            ))}
          </g>
          <g fill="currentColor">
            <circle cx="100" cy="15" r="7" />
            <circle cx="215" cy="128" r="7" />
            <circle cx="123" cy="82" r="7" />
          </g>
        </>
      ) : (
        <>
          <ellipse
            cx="160"
            cy="71"
            rx="120"
            ry="39"
            stroke="currentColor"
            fill="none"
            opacity=".35"
            transform="rotate(-15 160 71)"
          />
          <circle cx="160" cy="71" r="25" fill="#e7c069" />
          <circle cx="262" cy="40" r="19" fill="currentColor" />
          <ellipse
            cx="262"
            cy="40"
            rx="7"
            ry="19"
            fill="none"
            stroke="#fff"
            opacity=".7"
            transform="rotate(23.4 262 40)"
          />
          <path
            d="m253 15 19 50"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx="63" cy="104" r="12" fill="currentColor" opacity=".3" />
        </>
      )}
    </svg>
  );
}

function readRoute(): { page: Page; lesson: Lesson | null } {
  const [slug, id] = location.hash.replace(/^#\/?/, "").split("/");
  const known: Page[] = [
    "home",
    "library",
    "lab",
    "studio",
    "path",
    "notebook",
    "sources",
    "ai",
  ];
  const page: Page = known.includes(slug as Page) ? (slug as Page) : "home";
  return { page, lesson: lessons.find((l) => l.id === id) ?? null };
}

export default function App() {
  const initialRoute = useRef(readRoute());
  const [page, setPage] = useState<Page>(initialRoute.current.page);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [selected, setSelectedRaw] = useState<Lesson | null>(
    initialRoute.current.lesson,
  );
  const [tutorContext, setTutorContext] = useState("");
  const [labId, setLabId] = useState("physics-motion");
  const [menu, setMenu] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [done, toggleDone] = useSavedIds("scince-completed");
  const [saved, toggleSaved] = useSavedIds("scince-saved");
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const n = readLocal<unknown>("scince-notes", {});
    return n && typeof n === "object" && !Array.isArray(n)
      ? (n as Record<string, string>)
      : {};
  });
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [formulasOnly, setFormulasOnly] = useState(false);
  const [installEvent, setInstallEvent] = useState<
    | (Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      })
    | null
  >(null);
  const mainRef = useRef<HTMLElement>(null);
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn("Offline registration failed", error);
    },
  });
  function setSelected(lesson: Lesson | null) {
    setSelectedRaw(lesson);
    history.pushState(null, "", `#/${page}${lesson ? `/${lesson.id}` : ""}`);
  }
  useEffect(() => {
    const restore = () => {
      const route = readRoute();
      setPage(route.page);
      setSelectedRaw(route.lesson);
      setMenu(false);
    };
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);
  function go(next: Page) {
    setPage(next);
    setSelectedRaw(null);
    history.pushState(null, "", `#/${next}`);
    setMenu(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus();
  }
  function message(text: string) {
    setToast(text);
  }
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    const before = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as typeof installEvent);
    };
    window.addEventListener("beforeinstallprompt", before);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
      window.removeEventListener("beforeinstallprompt", before);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("scince-notes", JSON.stringify(notes));
    } catch {
      message("瀏覽器儲存空間不足，筆記暫時只保留在本次頁面。");
    }
  }, [notes]);
  useEffect(() => {
    if (!selected && !installOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setInstallOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [selected, installOpen]);
  const querySubject = subjects.find(
    (s) =>
      query.trim().startsWith(s.name) && query.trim().length > s.name.length,
  );
  const searchTerm = (
    querySubject ? query.trim().slice(querySubject.name.length) : query.trim()
  ).toLowerCase();
  const filtered = lessons.filter(
    (l) =>
      (subject === "all" || l.subject === subject) &&
      (!querySubject || l.subject === querySubject.id) &&
      `${subjectNames[l.subject]} ${l.title} ${l.subtitle} ${l.explanation} ${l.concepts.join(" ")} ${l.formulas.map((f) => `${f.expression} ${f.meaning}`).join(" ")} ${l.tags.join(" ")}`
        .toLowerCase()
        .includes(searchTerm),
  );
  const totalDone = lessons.filter((l) => done.includes(l.id)).length;
  const quiz = quizzes[quizIndex];
  const currentTitle =
    navItems.find((x) => x.id === page)?.label ??
    (page === "ai" ? "AI 學習夥伴" : "來源與研究");
  function openLab(id: string) {
    setLabId(id);
    setSelected(null);
    go("lab");
  }
  function exportNotes() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, completed: done, saved, notes }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scince-learning-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        跳至主要內容
      </a>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="關閉選單"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="SCINCE 首頁"
        >
          <span className="brand-icon">
            <Atom size={27} />
          </span>
          <span>
            scince<span className="brand-dot">.</span>
            <small>自然探索室</small>
          </span>
        </button>
        <div className="workspace-label">
          你的自然學習空間 <span>108 課綱</span>
        </div>
        <nav aria-label="主要導覽">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`nav-item ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {id === "lab" && <span className="nav-count">12</span>}
              {page === id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <button
          className={`nav-item ${page === "ai" ? "active" : ""}`}
          onClick={() => go("ai")}
        >
          <Sparkles size={19} />
          AI 學習夥伴<span className="tiny-badge">LOCAL</span>
        </button>
        <button
          className={`nav-item ${page === "sources" ? "active" : ""}`}
          onClick={() => go("sources")}
        >
          <GraduationCap size={19} />
          來源與研究
        </button>
        <div className="sidebar-bottom">
          <div className="offline-card">
            <span className="offline-symbol">
              <Download size={20} />
            </span>
            <strong>把探索，帶著走。</strong>
            <p>
              加入主畫面，隨時回到你的
              <br />
              自然學習空間。
            </p>
            <button onClick={() => setInstallOpen(true)}>
              安裝學習 App <ArrowRight size={14} />
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="status-dot" />
            為好奇心而生 <span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(true)}
              aria-label="開啟選單"
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">我的學習空間</span>
            <ChevronRight size={13} />
            <strong>{currentTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className={`connection ${!online ? "offline" : ""}`}>
              {online ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{online ? "線上探索中" : "離線模式"}</span>
            </span>
            <button
              className="icon-button"
              aria-label="安裝與離線說明"
              onClick={() => setInstallOpen(true)}
            >
              <CircleHelp size={19} />
            </button>
            <button
              className="avatar"
              aria-label="開啟我的學習筆記"
              onClick={() => go("notebook")}
            >
              <span>探</span>
            </button>
          </div>
        </header>
        <main id="main" ref={mainRef} tabIndex={-1}>
          {needRefresh && (
            <div className="notice">
              有新版本可以使用。
              <button onClick={() => updateServiceWorker(true)}>
                更新學習內容
              </button>
            </div>
          )}
          {offlineReady && (
            <div className="offline-ready">
              <Check size={13} /> 課程、原創練習與互動模擬已可離線使用。
            </div>
          )}
          {page === "home" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">STAY CURIOUS. KEEP EXPLORING.</div>
                  <h1>
                    每一次好奇，
                    <span className="heading-serif">都離理解更近一步。</span>
                  </h1>
                  <p>從一個「為什麼」開始，把自然變成看得見的知識。</p>
                </div>
                <span className="edition-label">
                  <span /> 學測自然・自主探索
                </span>
              </div>
              <section className="hero">
                <img
                  src={asset("science-hero.webp")}
                  alt="玻璃質感的星球、軌道與分子，交織成自然探索意象"
                />
                <div className="hero-content">
                  <div className="hero-kicker">
                    <span /> SEE IT. PLAY IT. GET IT.
                  </div>
                  <h2>
                    讓觀念，
                    <br />
                    真正發生。
                  </h2>
                  <p>
                    不只記住公式，更看懂背後的世界。
                    <br />
                    用互動實驗，把抽象變成直覺。
                  </p>
                  <div className="hero-action-group">
                    <button className="button lime" onClick={() => go("path")}>
                      開始今天的學習 <ArrowRight size={17} />
                    </button>
                    <button
                      className="button hero-secondary"
                      onClick={() => openLab("physics-motion")}
                    >
                      開始探索實驗室 <FlaskConical size={16} />
                    </button>
                  </div>
                </div>
                <span className="hero-caption">
                  THE BEAUTY OF UNDERSTANDING <span>01 / NATURE</span>
                </span>
              </section>
              <div className="stat-row">
                <div>
                  <span className="stat-icon mint">
                    <BookOpen size={20} />
                  </span>
                  <span>
                    <strong>
                      {lessons.length}
                      <small> 個</small>
                    </strong>
                    <label>完整學習單元</label>
                  </span>
                </div>
                <div>
                  <span className="stat-icon peach">
                    <FlaskConical size={20} />
                  </span>
                  <span>
                    <strong>
                      12<small> 種</small>
                    </strong>
                    <label>可操作互動實驗</label>
                  </span>
                </div>
                <div>
                  <span className="stat-icon blue">
                    <BookMarked size={20} />
                  </span>
                  <span>
                    <strong>
                      {practiceCount}
                      <small> 題</small>
                    </strong>
                    <label>原創單元自我檢核</label>
                  </span>
                </div>
                <div>
                  <span className="stat-icon yellow">
                    <Target size={20} />
                  </span>
                  <span>
                    <strong>
                      {totalDone}
                      <small> / {lessons.length}</small>
                    </strong>
                    <label>已掌握的觀念</label>
                  </span>
                </div>
              </div>
              <section className="subject-section">
                <SectionHeading
                  eyebrow="FOUR WAYS TO SEE THE WORLD"
                  title="從你感興趣的學科出發"
                  action="瀏覽全部觀念"
                  onClick={() => {
                    setSubject("all");
                    go("library");
                  }}
                />
                <div className="subject-grid">
                  {subjects.map((s) => {
                    const Icon = subjectIcons[s.id as SubjectId];
                    const count = lessons.filter(
                      (l) => l.subject === s.id,
                    ).length;
                    return (
                      <button
                        className={`subject-card subject-${s.id}`}
                        key={s.id}
                        onClick={() => {
                          setSubject(s.id as SubjectId);
                          go("library");
                        }}
                      >
                        <span className="subject-card-top">
                          <Icon size={26} />
                          <ArrowRight size={16} />
                        </span>
                        <strong>
                          {s.name}
                          <span>{s.english}</span>
                        </strong>
                        <p>{s.description}</p>
                        <span className="subject-count">
                          {count} 個觀念單元 <ChevronRight size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
              <div className="dashboard-bottom">
                <section className="featured-section">
                  <SectionHeading
                    eyebrow="LESS THEORY. MORE DISCOVERY."
                    title="動手試，觀念就懂了"
                    action="全部實驗"
                    onClick={() => go("lab")}
                  />
                  <div className="experiment-grid">
                    {previews.map((p) => (
                      <button
                        className={`experiment-card ${p.art}`}
                        key={p.id}
                        onClick={() => openLab(p.id)}
                      >
                        <div className="experiment-image">
                          <span className="experiment-tag">
                            {p.subject} / {p.tag}
                          </span>
                          <Art kind={p.art} />
                          <span className="play-circle">
                            <ArrowRight size={17} />
                          </span>
                        </div>
                        <div className="experiment-body">
                          <h3>{p.title}</h3>
                          <p>{p.desc}</p>
                          <span>
                            <Activity size={12} /> 互動模擬{" "}
                            <i>調整參數，即時探索</i>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
                <aside className="challenge">
                  <div className="challenge-top">
                    <span>
                      <Lightbulb size={18} /> 腦袋熱身一下
                    </span>
                    <span>0{quizIndex + 1} / 03</span>
                  </div>
                  <span className="tiny-eyebrow">
                    A LITTLE QUESTION, A BIG IDEA.
                  </span>
                  <h3>{quiz.question}</h3>
                  <div className="quiz-options">
                    {quiz.options.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => setQuizAnswer(i)}
                        className={
                          quizAnswer === null
                            ? ""
                            : i === quiz.answer
                              ? "correct"
                              : i === quizAnswer
                                ? "incorrect"
                                : ""
                        }
                      >
                        {String.fromCharCode(65 + i)}
                        <strong>{o}</strong>
                        {quizAnswer !== null && i === quiz.answer && (
                          <Check size={15} />
                        )}
                      </button>
                    ))}
                  </div>
                  {quizAnswer !== null ? (
                    <div className="quiz-result">
                      <strong>
                        {quizAnswer === quiz.answer
                          ? "答對了，繼續保持好奇！"
                          : "再想一步，就接近答案。"}
                      </strong>
                      <p>{quiz.reason}</p>
                      <button
                        onClick={() => {
                          setQuizIndex((quizIndex + 1) % quizzes.length);
                          setQuizAnswer(null);
                        }}
                      >
                        換一題 <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="quiz-foot">選一個答案，看看你的直覺。</p>
                  )}
                </aside>
              </div>
              <section className="exam-banner">
                <div className="exam-banner-icon">
                  <BookMarked size={26} />
                </div>
                <div>
                  <span>從符號，走進真正理解。</span>
                  <h3>專用數學與化學公式工作台</h3>
                  <p>親手編輯分式、反應式與離子，清楚看見每個符號的意義。</p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => go("studio")}
                >
                  打開公式工作台 <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
          {page === "library" && (
            <>
              <PageHeading
                eyebrow="THE CONCEPT LIBRARY"
                title="理解，比記住更有力量。"
                description="從學習目標、分段教學到原創例題與自我檢核，完整走過每個單元。公式附條件，理解後再到實驗室驗證。"
              />
              <div className="filter-bar">
                <div className="tabs" aria-label="學科篩選">
                  <button
                    className={subject === "all" ? "selected" : ""}
                    onClick={() => setSubject("all")}
                  >
                    全部學科
                  </button>
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      className={subject === s.id ? "selected" : ""}
                      onClick={() => setSubject(s.id as SubjectId)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={17} />
                  <input
                    placeholder="搜尋觀念、公式或關鍵字…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      onClick={() => setQuery("")}
                      aria-label="清除搜尋"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
              </div>
              <div className="results-label">
                <span>找到 {filtered.length} 個觀念單元</span>
                <label>
                  <input
                    type="checkbox"
                    checked={formulasOnly}
                    onChange={(e) => setFormulasOnly(e.target.checked)}
                  />{" "}
                  公式速覽
                </label>
              </div>
              <div className="lesson-grid">
                {filtered.map((l, i) => (
                  <article
                    key={l.id}
                    className={`lesson-card subject-${l.subject}`}
                  >
                    <div className="lesson-meta">
                      <span>
                        {subjectNames[l.subject]} / {l.chapter}
                      </span>
                      <button
                        className={`icon-button ${saved.includes(l.id) ? "is-saved" : ""}`}
                        onClick={() => toggleSaved(l.id)}
                        aria-label={`${saved.includes(l.id) ? "取消收藏" : "收藏"}${l.title}`}
                      >
                        <Bookmark
                          size={17}
                          fill={saved.includes(l.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <button
                      className="lesson-open"
                      onClick={() => setSelected(l)}
                    >
                      <span className="lesson-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3>{l.title}</h3>
                      <p>{l.subtitle}</p>
                      {formulasOnly && (
                        <div className="formula-preview">
                          {l.formulas.length ? (
                            l.formulas.map((f) => (
                              <div key={f.expression}>
                                <ScienceFormula source={f.expression} display />
                                <small>{f.meaning}</small>
                              </div>
                            ))
                          ) : (
                            <small>本單元以概念推論為主</small>
                          )}
                        </div>
                      )}
                      <span className="lesson-footer">
                        <span>
                          {l.duration} 分鐘導讀 · {l.difficulty}
                        </span>
                        {done.includes(l.id) ? (
                          <span className="done-label">
                            <Check size={13} /> 已掌握
                          </span>
                        ) : (
                          <ArrowRight size={16} />
                        )}
                      </span>
                    </button>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <EmptyState text="沒有符合的觀念，試試不同的關鍵字。" />
              )}
              <p className="source-note">
                以你提供的 111
                學年度起適用考試說明為範圍依據，導讀為本站原創；單元數不等於官方課綱條目數，延伸公式會標註條件。
                <button onClick={() => go("sources")}>
                  查看依據 <ArrowRight size={12} />
                </button>
              </p>
            </>
          )}
          {page === "lab" && (
            <>
              <PageHeading
                eyebrow="THE INTERACTIVE LAB"
                title="如果改變一點，會發生什麼？"
                description="拖動參數、觀察結果，再用科學模型解釋你看見的變化。每一次操作，都是一次小小的探究。"
              />
              <Suspense fallback={<Loading />}>
                <SimulationLab initialId={labId} onModuleChange={setLabId} />
              </Suspense>
              <section className="lab-related">
                <h3>把實驗連回觀念</h3>
                <div className="related-links">
                  {lessons
                    .filter((l) => l.simulation === labId)
                    .slice(0, 5)
                    .map((l) => (
                      <button key={l.id} onClick={() => setSelected(l)}>
                        {l.title}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                </div>
              </section>
            </>
          )}
          {page === "studio" && (
            <>
              <PageHeading
                eyebrow="THE SCIENCE TYPESETTING STUDIO"
                title="把每個符號，說清楚。"
                description="編輯數學與化學表示式，即時檢視語意排版。專用解析器支援分式、根式、矩陣與化學反應守恆檢核。"
              />
              <Suspense fallback={<Loading />}>
                <RenderingStudio />
              </Suspense>
            </>
          )}
          {page === "path" && (
            <>
              <PageHeading
                eyebrow="BUILD YOUR SCIENCE PATH"
                title="一步一步，把理解連起來。"
                description="依主題循序探索四科，從未完成的單元繼續；把自我檢核中想錯的地方，變成下一次理解的起點。"
              />
              <Suspense fallback={<Loading />}>
                <StudyPath
                  completed={done}
                  onOpen={(id) =>
                    setSelected(lessons.find((l) => l.id === id) ?? null)
                  }
                />
              </Suspense>
            </>
          )}
          {page === "notebook" && (
            <>
              <PageHeading
                eyebrow="YOUR PERSONAL FIELDNOTES"
                title="留住，理解發生的瞬間。"
                description="收藏觀念、記下自己的解釋。資料儲存在目前瀏覽器，換裝置前可以匯出備份。"
              />
              <div className="notebook-toolbar">
                <span>
                  <strong>
                    {
                      saved.filter((id) => lessons.some((l) => l.id === id))
                        .length
                    }
                  </strong>{" "}
                  個收藏觀念　·　<strong>{totalDone}</strong> 個已掌握
                </span>
                <button className="button secondary" onClick={exportNotes}>
                  <Download size={15} />
                  匯出學習紀錄
                </button>
              </div>
              {lessons.filter(
                (l) =>
                  saved.includes(l.id) || done.includes(l.id) || notes[l.id],
              ).length === 0 ? (
                <EmptyState
                  text="還沒有筆記。到觀念圖書館收藏一個單元，開始建立自己的知識地圖。"
                  action="去探索觀念"
                  onClick={() => go("library")}
                />
              ) : (
                <div className="notebook-list">
                  {lessons
                    .filter(
                      (l) =>
                        saved.includes(l.id) ||
                        done.includes(l.id) ||
                        notes[l.id],
                    )
                    .map((l) => (
                      <article className="note-card" key={l.id}>
                        <div>
                          <span className="eyebrow">
                            {subjectNames[l.subject]}
                          </span>
                          <button
                            className="note-title"
                            onClick={() => setSelected(l)}
                          >
                            {l.title}
                            <ArrowRight size={16} />
                          </button>
                          <button
                            className={`completion-button ${done.includes(l.id) ? "completed" : ""}`}
                            onClick={() => toggleDone(l.id)}
                          >
                            <Check size={14} />
                            {done.includes(l.id) ? "已掌握" : "標記為已掌握"}
                          </button>
                        </div>
                        <label className="note-input-label">
                          用自己的話說一次
                          <textarea
                            placeholder="例如：這個公式什麼時候適用？我曾經在哪裡想錯？"
                            value={
                              typeof notes[l.id] === "string" ? notes[l.id] : ""
                            }
                            onChange={(e) =>
                              setNotes((n) => ({
                                ...n,
                                [l.id]: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <small>自動儲存在此瀏覽器</small>
                      </article>
                    ))}
                </div>
              )}
            </>
          )}
          {page === "ai" && (
            <>
              <PageHeading
                eyebrow="THINK WITH A LITTLE HELP"
                title="有個夥伴，陪你多想一步。"
                description="先用離線觀念檢索找到依據；裝置支援時，再按需啟用 Qwen 1.5B 本機推論。"
              />
              <Suspense fallback={<Loading />}>
                <AITutor context={tutorContext} />
              </Suspense>
            </>
          )}
          {page === "sources" && (
            <>
              <PageHeading
                eyebrow="SCIENCE NEEDS SOURCES"
                title="每一個理解，都有來處。"
                description="官方範圍、技術研究與原創導讀分別標示。參考文獻提供設計依據，不代表本站已重現論文實驗。"
              />
              <section className="guide-panel">
                <span className="stat-icon mint">
                  <GraduationCap size={25} />
                </span>
                <div>
                  <h2>{examGuide.title}</h2>
                  {examGuide.summary.map((s) => (
                    <p key={s}>{s}</p>
                  ))}
                  <a
                    href="https://www.ceec.edu.tw/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    前往大考中心官方網站 <ExternalLink size={14} />
                  </a>
                </div>
              </section>
              <div className="competency-grid">
                {examGuide.competencies.map((s, i) => (
                  <div key={s}>
                    <span>0{i + 1}</span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
              <div className="notice">
                本站的觀念與解題策略為原創摘要；尚未完成「各科師範畢業、全國知名名師」的學歷及本人帳號雙重查核，因此不以名師名義推薦或代言。最新課綱修訂仍以官方公告為準。
              </div>
              <h2 className="section-title research-title">
                研究與技術閱讀清單
              </h2>
              <div className="research-list">
                {researchSources.map((r) => (
                  <article key={r.id}>
                    <div className="research-meta">
                      <span>
                        {
                          {
                            official: "官方文件",
                            teacher: "公開教學",
                            paper: "研究論文",
                            technology: "技術文件",
                          }[r.type]
                        }
                      </span>
                      <small>{r.year}</small>
                    </div>
                    <h3>
                      <a href={r.url} target="_blank" rel="noreferrer">
                        {r.title}
                        <ExternalLink size={14} />
                      </a>
                    </h3>
                    <small className="research-author">{r.author}</small>
                    <p>{r.summary}</p>
                    <div className="research-application">
                      <Lightbulb size={15} />
                      <span>{r.application}</span>
                    </div>
                    <small className="verification">{r.verified}</small>
                  </article>
                ))}
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>
              <Atom size={15} /> scince. <span>讓好奇心，帶你理解世界。</span>
            </span>
            <button onClick={() => go("sources")}>
              內容來源與使用說明 <ArrowRight size={12} />
            </button>
          </footer>
        </main>
      </div>
      {selected && lessonDetails[selected.id] && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <Suspense fallback={<Loading />}>
            <LessonReader
              key={selected.id}
              lesson={selected}
              detail={lessonDetails[selected.id]}
              completed={done.includes(selected.id)}
              saved={saved.includes(selected.id)}
              note={
                typeof notes[selected.id] === "string" ? notes[selected.id] : ""
              }
              onToggleComplete={() => toggleDone(selected.id)}
              onToggleSave={() => toggleSaved(selected.id)}
              onNoteChange={(value) =>
                setNotes((n) => ({ ...n, [selected.id]: value }))
              }
              onLab={() => openLab(selected.simulation)}
              onAskTutor={() => {
                setTutorContext(`${selected.title}：${selected.explanation}`);
                setSelected(null);
                go("ai");
              }}
              onSelectLesson={(id) =>
                setSelected(lessons.find((l) => l.id === id) ?? null)
              }
            />
          </Suspense>
        </Modal>
      )}
      {installOpen && (
        <Modal title="把探索帶著走" onClose={() => setInstallOpen(false)}>
          <div className="install-content">
            <span className="install-logo">
              <Atom size={38} />
            </span>
            <h2>你的口袋自然探索室。</h2>
            <p>
              完整單元、原創練習、公式與互動模擬，在首次完整載入後即可離線使用。
            </p>
            {installEvent ? (
              <button
                className="button primary"
                onClick={async () => {
                  await installEvent.prompt();
                  const choice = await installEvent.userChoice;
                  if (choice.outcome === "accepted") setInstallOpen(false);
                  setInstallEvent(null);
                }}
              >
                <Download size={16} />
                安裝 SCINCE
              </button>
            ) : (
              <div className="install-instructions">
                <strong>iPhone / iPad</strong>
                <p>
                  使用 Safari 開啟網站 → 點「分享」→「加入主畫面」→「加入」。
                </p>
                <strong>Android / 電腦</strong>
                <p>
                  使用支援的瀏覽器，在選單選擇「安裝應用程式」或「加入主畫面」。需
                  HTTPS 或本機開發環境。
                </p>
              </div>
            )}
            <small>
              AI 權重與瀏覽器快取可能因儲存空間而被清除；Qwen
              不會在背景自動下載。筆記僅存本機，請定期匯出。
            </small>
          </div>
        </Modal>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={16} />
          {toast}
          <button aria-label="關閉通知" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading inner-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function SectionHeading({
  eyebrow,
  title,
  action,
  onClick,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <button onClick={onClick}>
        {action}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
function EmptyState({
  text,
  action,
  onClick,
}: {
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty-state">
      <BookOpen size={30} />
      <p>{text}</p>
      {action && (
        <button className="button primary" onClick={onClick}>
          {action}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
function Loading() {
  return (
    <div className="loading" role="status">
      <span className="loading-dot" />
      正在準備探索空間…
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = ref.current?.querySelectorAll<HTMLElement>(
        'button,a,input,textarea,select,[tabindex="0"]',
      );
      if (!nodes?.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <button
          className="modal-close icon-button"
          onClick={onClose}
          aria-label="關閉視窗"
        >
          <X size={21} />
        </button>
        {children}
      </div>
    </div>
  );
}
