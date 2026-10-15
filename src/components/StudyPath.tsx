import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Compass,
  Layers3,
  RotateCcw,
  Target,
} from "lucide-react";
import { lessons, subjects, type SubjectId } from "../data/curriculum";
import { lessonDetails } from "../data/lesson-details";
import {
  loadPracticeProgress,
  PRACTICE_CHANGE_EVENT,
  summarizePractice,
} from "../lib/practice-progress";
import "./StudyPath.css";

type Filter = "all" | "remaining" | "review";

export default function StudyPath({
  completed,
  onOpen,
}: {
  completed: string[];
  onOpen: (id: string) => void;
}) {
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener(PRACTICE_CHANGE_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PRACTICE_CHANGE_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const practice = useMemo(
    () =>
      Object.fromEntries(
        lessons.map((lesson) => {
          const questions = lessonDetails[lesson.id]?.practice ?? [];
          const stored = loadPracticeProgress(lesson.id, questions);
          return [
            lesson.id,
            {
              ...summarizePractice(questions, stored.answers),
              available: stored.available,
            },
          ];
        }),
      ),
    [revision],
  );
  const done = new Set(completed);
  const completedCount = lessons.filter((lesson) => done.has(lesson.id)).length;
  const attempted = Object.values(practice).reduce(
    (sum, item) => sum + item.attempted,
    0,
  );
  const incorrect = Object.values(practice).reduce(
    (sum, item) => sum + item.incorrect,
    0,
  );
  const totalPractice = Object.values(practice).reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const storageAvailable = Object.values(practice).every(
    (item) => item.available,
  );
  const reviewLessons = lessons
    .filter((lesson) => practice[lesson.id].incorrect > 0)
    .sort(
      (left, right) =>
        practice[right.id].incorrect - practice[left.id].incorrect,
    );
  const selectedLessons = lessons.filter(
    (lesson) => subject === "all" || lesson.subject === subject,
  );
  const nextLesson = selectedLessons.find((lesson) => !done.has(lesson.id));
  const recommendation =
    nextLesson ??
    selectedLessons.find((lesson) => practice[lesson.id].incorrect > 0) ??
    selectedLessons[0];
  const remainingCount = selectedLessons.filter(
    (lesson) => !done.has(lesson.id),
  ).length;
  const reviewCount = selectedLessons.filter(
    (lesson) => practice[lesson.id].incorrect > 0,
  ).length;
  const visible = selectedLessons.filter(
    (lesson) =>
      filter === "all" ||
      (filter === "remaining"
        ? !done.has(lesson.id)
        : practice[lesson.id].incorrect > 0),
  );
  const selectedSubject = subjects.find((item) => item.id === subject);
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "全部", count: selectedLessons.length },
    { id: "remaining", label: "未完成", count: remainingCount },
    { id: "review", label: "待複習", count: reviewCount },
  ];

  return (
    <div className="sp-page">
      <div className="sp-overview" aria-label="學習進度總覽">
        <div>
          <span className="sp-metric-icon">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <span>已掌握單元</span>
            <strong>
              {completedCount}
              <small> / {lessons.length}</small>
            </strong>
          </div>
          <span className="sp-overview-caption">
            {Math.round((completedCount / lessons.length) * 100)}% 完成
          </span>
        </div>
        <div>
          <span className="sp-metric-icon">
            <Target size={19} />
          </span>
          <div>
            <span>自我檢核已作答</span>
            <strong>
              {attempted}
              <small> / {totalPractice}</small>
            </strong>
          </div>
          <span className="sp-overview-caption">隨時能重做</span>
        </div>
        <div>
          <span className="sp-metric-icon sp-metric-review">
            <RotateCcw size={19} />
          </span>
          <div>
            <span>需要再釐清</span>
            <strong>
              {incorrect}
              <small> 題</small>
            </strong>
          </div>
          <span className="sp-overview-caption">
            分布於 {reviewLessons.length} 個單元
          </span>
        </div>
      </div>
      <p className="sp-storage-note">
        {storageAvailable
          ? "進度與練習依這台裝置的紀錄整理；待複習以每題最後一次作答為準，改正後會自動移出。"
          : "瀏覽器暫時無法讀取作答紀錄，仍可閱讀全部單元；請確認是否開放網站儲存空間。"}
      </p>

      <section className="sp-continue" aria-label="接續學習">
        <div>
          <span className="sp-eyebrow">
            {nextLesson ? "YOUR NEXT STEP" : "KEEP EXPLORING"}
          </span>
          <h2>{nextLesson ? "繼續下一站" : "完成之後，再加深一層"}</h2>
          <p>{recommendation?.title}</p>
          <span>{recommendation?.subtitle}</span>
        </div>
        <button
          type="button"
          onClick={() => recommendation && onOpen(recommendation.id)}
        >
          {nextLesson ? "開始學習" : "重新閱讀"}
          <ArrowRight size={16} />
        </button>
        <span className="sp-continue-decoration" aria-hidden="true">
          <Compass size={118} strokeWidth={0.7} />
        </span>
      </section>

      <section
        className="sp-subject-section"
        aria-labelledby="sp-subject-title"
      >
        <div className="sp-heading">
          <div>
            <span className="sp-eyebrow">FOUR WAYS TO UNDERSTAND NATURE</span>
            <h2 id="sp-subject-title">選一條路，按自己的節奏走</h2>
          </div>
          <button
            type="button"
            className={`sp-all-subjects ${subject === "all" ? "sp-selected" : ""}`}
            onClick={() => setSubject("all")}
            aria-pressed={subject === "all"}
          >
            <Layers3 size={14} />
            顯示四科
          </button>
        </div>
        <div className="sp-subject-grid">
          {subjects.map((item, index) => {
            const subjectLessons = lessons.filter(
              (lesson) => lesson.subject === item.id,
            );
            const count = subjectLessons.filter((lesson) =>
              done.has(lesson.id),
            ).length;
            const percentage = Math.round(
              (count / subjectLessons.length) * 100,
            );
            const wrong = subjectLessons.filter(
              (lesson) => practice[lesson.id].incorrect > 0,
            ).length;
            return (
              <button
                type="button"
                className={`sp-subject sp-subject-${item.id} ${subject === item.id ? "sp-subject-active" : ""}`}
                aria-pressed={subject === item.id}
                key={item.id}
                onClick={() => setSubject(item.id)}
              >
                <span className="sp-subject-top">
                  <span>0{index + 1}</span>
                  {subject === item.id ? (
                    <Check size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </span>
                <strong>{item.name}</strong>
                <span className="sp-subject-english">{item.english}</span>
                <span className="sp-subject-progress">
                  <span style={{ width: `${percentage}%` }} />
                </span>
                <span className="sp-subject-bottom">
                  <span>
                    {count} / {subjectLessons.length} 已掌握
                  </span>
                  <span>
                    {wrong > 0 ? `${wrong} 單元待複習` : `${percentage}%`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {reviewLessons.length > 0 && (
        <section className="sp-review-priority" aria-label="優先回看">
          <div>
            <RotateCcw size={17} />
            <strong>把卡住的地方，變成下一次的進步</strong>
            <span>先回看這些有答錯題目的單元。</span>
          </div>
          <div className="sp-review-links">
            {reviewLessons
              .filter(
                (lesson) => subject === "all" || lesson.subject === subject,
              )
              .slice(0, 4)
              .map((lesson) => (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => onOpen(lesson.id)}
                >
                  {lesson.title}
                  <span>{practice[lesson.id].incorrect} 題</span>
                  <ArrowRight size={12} />
                </button>
              ))}
          </div>
          <button
            className="sp-text-button"
            type="button"
            onClick={() => setFilter("review")}
          >
            只看待複習單元
            <ArrowRight size={13} />
          </button>
        </section>
      )}

      <section className="sp-curriculum" aria-labelledby="sp-curriculum-title">
        <div className="sp-heading sp-curriculum-heading">
          <div>
            <span className="sp-eyebrow">THE ROADMAP</span>
            <h2 id="sp-curriculum-title">
              {selectedSubject?.name ?? "四科"}學習路徑
            </h2>
          </div>
          <div className="sp-filters" aria-label="篩選學習狀態">
            {filters.map((item) => (
              <button
                type="button"
                className={filter === item.id ? "sp-filter-active" : ""}
                aria-pressed={filter === item.id}
                key={item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="sp-empty">
            <span>
              {filter === "review" ? (
                <CheckCircle2 size={30} />
              ) : (
                <BookOpen size={30} />
              )}
            </span>
            <h3>
              {filter === "review"
                ? "目前沒有待複習的作答"
                : "這條路上的單元，你都已掌握。"}
            </h3>
            <p>
              {filter === "review"
                ? "讀完單元後試試自我檢核。答錯的觀念會出現在這裡，答對後自動移出。"
                : "換一科繼續探索，或回頭重做自我檢核，確認自己能說清楚觀念。"}
            </p>
            <button type="button" onClick={() => setFilter("all")}>
              瀏覽全部單元
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="sp-subject-paths">
            {subjects
              .filter((item) => subject === "all" || item.id === subject)
              .map((item) => {
                const subjectVisible = visible.filter(
                  (lesson) => lesson.subject === item.id,
                );
                if (!subjectVisible.length) return null;
                const chapters = [
                  ...new Set(
                    lessons
                      .filter((lesson) => lesson.subject === item.id)
                      .map((lesson) => lesson.chapter),
                  ),
                ];
                return (
                  <div
                    className={`sp-subject-path sp-subject-${item.id}`}
                    key={item.id}
                  >
                    <div className="sp-path-label">
                      <span />
                      <strong>{item.name}</strong>
                      <span>{item.english}</span>
                    </div>
                    <div className="sp-chapters">
                      {chapters.map((chapter, index) => {
                        const chapterLessons = subjectVisible.filter(
                          (lesson) => lesson.chapter === chapter,
                        );
                        if (!chapterLessons.length) return null;
                        const allChapterLessons = lessons.filter(
                          (lesson) =>
                            lesson.subject === item.id &&
                            lesson.chapter === chapter,
                        );
                        const chapterCompleted = allChapterLessons.filter(
                          (lesson) => done.has(lesson.id),
                        ).length;
                        return (
                          <details className="sp-chapter" key={chapter} open>
                            <summary>
                              <span className="sp-chapter-number">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <h3>{chapter}</h3>
                              <span className="sp-chapter-count">
                                {chapterCompleted} / {allChapterLessons.length}{" "}
                                完成
                              </span>
                              <ChevronDown size={15} />
                            </summary>
                            <ol>
                              {chapterLessons.map((lesson) => {
                                const progress = practice[lesson.id];
                                const isCompleted = done.has(lesson.id);
                                const isNext = nextLesson?.id === lesson.id;
                                return (
                                  <li key={lesson.id}>
                                    <button
                                      type="button"
                                      className={`sp-lesson ${isCompleted ? "sp-lesson-completed" : ""} ${isNext ? "sp-lesson-next" : ""}`}
                                      onClick={() => onOpen(lesson.id)}
                                    >
                                      <span
                                        className="sp-lesson-status"
                                        aria-label={
                                          isCompleted ? "已掌握" : "未完成"
                                        }
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 size={19} />
                                        ) : (
                                          <Circle size={18} />
                                        )}
                                      </span>
                                      <span className="sp-lesson-body">
                                        <strong>
                                          {lesson.title}
                                          {isNext && (
                                            <span className="sp-next-label">
                                              下一站
                                            </span>
                                          )}
                                        </strong>
                                        <span>{lesson.subtitle}</span>
                                        <span className="sp-lesson-meta">
                                          <span>{lesson.duration} 分鐘</span>
                                          <span>{lesson.difficulty}</span>
                                          <span>
                                            {progress.total} 題自我檢核
                                          </span>
                                        </span>
                                      </span>
                                      <span className="sp-lesson-result">
                                        {progress.incorrect > 0 ? (
                                          <span className="sp-wrong-label">
                                            {progress.incorrect} 題待複習
                                          </span>
                                        ) : progress.attempted > 0 ? (
                                          <span className="sp-correct-label">
                                            答對 {progress.correct} /{" "}
                                            {progress.total}
                                          </span>
                                        ) : isCompleted ? (
                                          <span>已掌握</span>
                                        ) : null}
                                        <ArrowRight size={15} />
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ol>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
      <footer className="sp-footer">
        <Compass size={16} />
        <p>
          掌握進度由你決定。作答結果提供複習方向，單元可隨時回看與重新練習。
        </p>
      </footer>
    </div>
  );
}
