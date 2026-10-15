import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FlaskConical,
  Lightbulb,
  NotebookPen,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import {
  lessons,
  subjects,
  addedLessonIds,
  type Lesson,
} from "../data/curriculum";
import type { LessonDetail, PracticeQuestion } from "../data/lesson-types";
import {
  loadPracticeProgress,
  questionSignature,
  savePracticeProgress,
  summarizePractice,
} from "../lib/practice-progress";
import { ScienceFormula, ScienceText } from "../render/ScienceRenderer";
import "./LessonReader.css";

interface LessonReaderProps {
  lesson: Lesson;
  detail: LessonDetail;
  completed: boolean;
  saved: boolean;
  note: string;
  onToggleComplete: () => void;
  onToggleSave: () => void;
  onNoteChange: (value: string) => void;
  onLab: () => void;
  onAskTutor: () => void;
  onSelectLesson: (id: string) => void;
}

function SelfCheck({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: PracticeQuestion[];
}) {
  const signature = questionSignature(questions);
  const [state, setState] = useState(() =>
    loadPracticeProgress(lessonId, questions),
  );
  const { attempted, correct } = summarizePractice(questions, state.answers);

  useEffect(() => {
    if (!savePracticeProgress(lessonId, signature, state.answers)) {
      setState((previous) =>
        previous.available ? { ...previous, available: false } : previous,
      );
    }
  }, [lessonId, signature, state.answers]);

  const answer = (id: string, selected: number) =>
    setState((previous) => ({
      ...previous,
      answers: { ...previous.answers, [id]: selected },
    }));
  const retry = (id: string) =>
    setState((previous) => {
      const next = { ...previous.answers };
      delete next[id];
      return { ...previous, answers: next };
    });

  return (
    <div className="lr-selfcheck">
      <div className="lr-check-progress" aria-live="polite">
        <div>
          <strong>
            {correct}
            <span> / {questions.length}</span>
          </strong>
          <span>目前答對</span>
        </div>
        <div
          className="lr-check-meter"
          role="progressbar"
          aria-label="自我檢核完成度"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={attempted}
        >
          <span
            style={{
              width: `${questions.length ? (attempted / questions.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span>
          {attempted === questions.length
            ? "全部已作答，可重做加深記憶"
            : `已作答 ${attempted} 題`}
        </span>
      </div>
      <p className="lr-muted lr-practice-disclaimer">
        以下為本站編寫的觀念練習；選擇答案後立即顯示解析。
        {state.available
          ? "作答會儲存在這台裝置。"
          : "瀏覽器暫時無法儲存，作答只保留在本次閱讀。"}
      </p>
      {questions.map((question, index) => {
        const selected = state.answers[question.id];
        const answered = Number.isInteger(selected);
        const isCorrect = selected === question.answer;
        const resultId = `lr-result-${lessonId}-${question.id}`;
        return (
          <fieldset
            className={`lr-question ${answered ? (isCorrect ? "lr-question-correct" : "lr-question-retry") : ""}`}
            key={question.id}
          >
            <legend>
              <span className="lr-question-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <ScienceText text={question.prompt} />
            </legend>
            <div className="lr-options">
              {question.options.map((option, optionIndex) => (
                <label
                  className={`lr-option ${selected === optionIndex ? "lr-option-selected" : ""}`}
                  key={optionIndex}
                >
                  <input
                    type="radio"
                    name={`lr-answer-${lessonId}-${question.id}`}
                    checked={selected === optionIndex}
                    onChange={() => answer(question.id, optionIndex)}
                    aria-describedby={answered ? resultId : undefined}
                  />
                  <span className="lr-option-letter" aria-hidden="true">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="lr-option-text">
                    <ScienceText text={option} />
                  </span>
                  {selected === optionIndex && (
                    <Check size={16} aria-hidden="true" />
                  )}
                </label>
              ))}
            </div>
            {answered && (
              <div
                className={`lr-feedback ${isCorrect ? "lr-feedback-correct" : "lr-feedback-retry"}`}
                id={resultId}
                role="status"
                aria-live="polite"
              >
                <strong>
                  {isCorrect
                    ? "答對了，來核對你的理由。"
                    : `再想一想：正確答案是 ${String.fromCharCode(65 + question.answer)}。`}
                </strong>
                <ScienceText text={question.explanation} />
                <button
                  type="button"
                  className="lr-text-button"
                  onClick={() => retry(question.id)}
                >
                  <RotateCcw size={14} />
                  {isCorrect ? "重做這題" : "再試一次"}
                </button>
              </div>
            )}
          </fieldset>
        );
      })}
      {attempted > 0 && (
        <button
          type="button"
          className="lr-text-button lr-reset-all"
          onClick={() => setState((previous) => ({ ...previous, answers: {} }))}
        >
          <RotateCcw size={14} />
          重新作答本單元
        </button>
      )}
    </div>
  );
}

export default function LessonReader({
  lesson,
  detail,
  completed,
  saved,
  note,
  onToggleComplete,
  onToggleSave,
  onNoteChange,
  onLab,
  onAskTutor,
  onSelectLesson,
}: LessonReaderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const subject = subjects.find((item) => item.id === lesson.subject);
  const subjectLessons = lessons.filter(
    (item) => item.subject === lesson.subject,
  );
  const position = subjectLessons.findIndex((item) => item.id === lesson.id);
  const previous = subjectLessons[position - 1];
  const next = subjectLessons[position + 1];
  const officialTags = lesson.tags.filter(
    (tag) => tag.includes("-Vc-") || tag.startsWith("IQ-"),
  );
  const related = subjectLessons
    .filter(
      (item) =>
        item.id !== lesson.id &&
        (item.tags.some((tag) => officialTags.includes(tag)) ||
          item.chapter === lesson.chapter),
    )
    .sort(
      (a, b) =>
        Number(addedLessonIds.has(b.id)) - Number(addedLessonIds.has(a.id)) ||
        b.tags.filter((tag) => officialTags.includes(tag)).length -
          a.tags.filter((tag) => officialTags.includes(tag)).length,
    )
    .slice(0, 6);
  const allStepsRevealed = revealed >= detail.workedExample.steps.length;
  const navigation = [
    { id: "concepts", label: "觀念講解" },
    ...(lesson.formulas.length
      ? [{ id: "formulas", label: "公式與條件" }]
      : []),
    { id: "example", label: "例題推理" },
    { id: "practice", label: "自我檢核" },
    { id: "notes", label: "理解筆記" },
  ];

  useEffect(() => {
    setRevealed(0);
    setShowAnswer(false);
    rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [lesson.id]);

  const jump = (section: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(
      `[data-lr-section="${section}"]`,
    );
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    target?.focus({ preventScroll: true });
  };

  return (
    <article className={`lr-reader lr-subject-${lesson.subject}`} ref={rootRef}>
      <header className="lr-header">
        <div className="lr-eyebrow">
          <span>
            {subject?.name} / {lesson.chapter}
          </span>
          <span>
            {String(position + 1).padStart(2, "0")} / {subjectLessons.length}
          </span>
        </div>
        <h2>{lesson.title}</h2>
        <p className="lr-subtitle">{lesson.subtitle}</p>
        <div className="lr-header-bottom">
          <div className="lr-meta">
            <span>
              <Clock3 size={14} />約 {lesson.duration} 分鐘
            </span>
            <span>{lesson.difficulty}</span>
            {completed && (
              <span className="lr-completion-badge">
                <CheckCircle2 size={14} />
                已掌握
              </span>
            )}
          </div>
          <button
            type="button"
            className={`lr-save ${saved ? "lr-is-saved" : ""}`}
            aria-pressed={saved}
            onClick={onToggleSave}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            {saved ? "已收藏" : "收藏單元"}
          </button>
        </div>
      </header>

      <nav className="lr-nav" aria-label="本單元目錄">
        {navigation.map((item, index) => (
          <button type="button" key={item.id} onClick={() => jump(item.id)}>
            <span>{index + 1}</span>
            {item.label}
            <ChevronDown size={12} />
          </button>
        ))}
      </nav>

      <div className="lr-content">
        <div className="lr-preparation">
          <section className="lr-objectives">
            <h3>
              <Target size={17} />
              學完你能做到
            </h3>
            <ul>
              {detail.objectives.map((objective, index) => (
                <li key={index}>
                  <Check size={15} />
                  <ScienceText text={objective} />
                </li>
              ))}
            </ul>
          </section>
          <section className="lr-prerequisites">
            <h3>開始前，先想起</h3>
            <p>如果有點生疏，閱讀時先停下來回想：</p>
            <ul>
              {detail.prerequisites.map((prerequisite, index) => (
                <li key={index}>
                  <ScienceText text={prerequisite} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          className="lr-section"
          data-lr-section="concepts"
          tabIndex={-1}
        >
          <div className="lr-section-heading">
            <span className="lr-section-number">01</span>
            <div>
              <span className="lr-section-kicker">UNDERSTAND</span>
              <h3>把觀念連成一條線</h3>
            </div>
          </div>
          <div className="lr-core-intuition">
            <span>核心直覺</span>
            <ScienceText text={lesson.explanation} />
          </div>
          <div className="lr-concept-tags" aria-label="本單元觀念">
            {lesson.concepts.map((concept) => (
              <span key={concept}>{concept}</span>
            ))}
          </div>
          <div className="lr-lesson-sections">
            {detail.sections.map((section, index) => (
              <section className="lr-explanation" key={index}>
                <h4>
                  <span>{index + 1}.</span>
                  {section.heading}
                </h4>
                <ScienceText text={section.body} />
                {section.formula && (
                  <div className="lr-context-formula">
                    <ScienceFormula
                      source={section.formula}
                      kind={section.kind ?? "math"}
                      display
                    />
                  </div>
                )}
              </section>
            ))}
          </div>
          <aside className="lr-misconception">
            <Lightbulb size={21} />
            <div>
              <strong>容易混淆的地方</strong>
              <ScienceText text={lesson.misconception} />
            </div>
          </aside>
        </section>

        {lesson.formulas.length > 0 && (
          <section
            className="lr-section"
            data-lr-section="formulas"
            tabIndex={-1}
          >
            <div className="lr-section-heading">
              <span className="lr-section-number">02</span>
              <div>
                <span className="lr-section-kicker">CONNECT</span>
                <h3>公式，連同使用條件一起記</h3>
              </div>
            </div>
            <div className="lr-formulas">
              {lesson.formulas.map((formula, index) => (
                <div className="lr-formula-row" key={index}>
                  <div className="lr-formula-expression">
                    <ScienceFormula
                      source={formula.expression}
                      kind="auto"
                      display
                    />
                  </div>
                  <div>
                    <span className="lr-formula-label">意義與適用條件</span>
                    <ScienceText text={formula.meaning} />
                  </div>
                </div>
              ))}
            </div>
            <p className="lr-formula-tip">
              代入前先檢查：研究對象、單位、正負方向，以及題目是否符合公式的假設。
            </p>
          </section>
        )}

        <section className="lr-section" data-lr-section="example" tabIndex={-1}>
          <div className="lr-section-heading">
            <span className="lr-section-number">
              {lesson.formulas.length ? "03" : "02"}
            </span>
            <div>
              <span className="lr-section-kicker">REASON</span>
              <h3>跟著例題，一步一步推理</h3>
            </div>
          </div>
          <div className="lr-worked-example">
            <span className="lr-original-label">原創教學例題</span>
            <div className="lr-example-question">
              <ScienceText text={detail.workedExample.question} />
            </div>
            <p className="lr-muted lr-example-instruction">
              先自己想一個步驟，再揭示提示；用推理取代只記答案。
            </p>
            {revealed > 0 && (
              <ol className="lr-worked-steps">
                {detail.workedExample.steps
                  .slice(0, revealed)
                  .map((step, index) => (
                    <li key={index}>
                      <span>{index + 1}</span>
                      <ScienceText text={step} />
                    </li>
                  ))}
              </ol>
            )}
            <div className="lr-example-controls">
              {!allStepsRevealed && (
                <button
                  type="button"
                  className="lr-button lr-button-dark"
                  onClick={() =>
                    setRevealed((value) =>
                      Math.min(value + 1, detail.workedExample.steps.length),
                    )
                  }
                >
                  {revealed === 0 ? "揭示第一步" : "揭示下一步"}
                  <ArrowRight size={15} />
                </button>
              )}
              {allStepsRevealed && !showAnswer && (
                <button
                  type="button"
                  className="lr-button lr-button-dark"
                  onClick={() => setShowAnswer(true)}
                >
                  核對完整結論
                  <Check size={16} />
                </button>
              )}
              {revealed < detail.workedExample.steps.length && (
                <button
                  type="button"
                  className="lr-text-button"
                  onClick={() => {
                    setRevealed(detail.workedExample.steps.length);
                    setShowAnswer(true);
                  }}
                >
                  看完整推導
                </button>
              )}
              <span className="lr-muted">
                已揭示 {revealed} / {detail.workedExample.steps.length} 步
              </span>
            </div>
            {showAnswer && (
              <div className="lr-example-answer" role="status">
                <strong>
                  <CheckCircle2 size={16} />
                  推理結論
                </strong>
                <ScienceText text={detail.workedExample.answer} />
              </div>
            )}
            {(revealed > 0 || showAnswer) && (
              <button
                type="button"
                className="lr-text-button lr-example-reset"
                onClick={() => {
                  setRevealed(0);
                  setShowAnswer(false);
                }}
              >
                <RotateCcw size={14} />
                收起答案，自己再推一次
              </button>
            )}
          </div>
          <div className="lr-strategy">
            <h4>遇到同類問題的解題順序</h4>
            <ol>
              {lesson.strategy.map((step, index) => (
                <li key={index}>
                  <ScienceText text={step} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="lr-section"
          data-lr-section="practice"
          tabIndex={-1}
        >
          <div className="lr-section-heading">
            <span className="lr-section-number">
              {lesson.formulas.length ? "04" : "03"}
            </span>
            <div>
              <span className="lr-section-kicker">CHECK</span>
              <h3>不用看筆記，你也會嗎？</h3>
            </div>
          </div>
          <SelfCheck
            key={`${lesson.id}-${questionSignature(detail.practice)}`}
            lessonId={lesson.id}
            questions={detail.practice}
          />
        </section>

        <section className="lr-application">
          <span className="lr-section-kicker">SCIENCE IN LIFE</span>
          <h3>把觀念帶回真實世界</h3>
          <ScienceText text={detail.application} />
          <button type="button" className="lr-text-button" onClick={onLab}>
            <FlaskConical size={16} />
            到互動實驗室改變參數
            <ArrowRight size={14} />
          </button>
        </section>

        {related.length > 0 && (
          <section className="lr-related" aria-label="相關與深入單元">
            <span className="lr-section-kicker">KEEP CONNECTING</span>
            <h3>相關與深入單元</h3>
            <p>沿著共同課綱與主題，繼續補上觀念的細節。</p>
            <div className="lr-related-grid">
              {related.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectLesson(item.id)}
                >
                  <span>
                    {addedLessonIds.has(item.id) && <small>新增詳解</small>}
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="lr-section" data-lr-section="notes" tabIndex={-1}>
          <div className="lr-section-heading">
            <span className="lr-section-number">
              {lesson.formulas.length ? "05" : "04"}
            </span>
            <div>
              <span className="lr-section-kicker">REMEMBER</span>
              <h3>留下你自己的理解</h3>
            </div>
          </div>
          <div className="lr-summary">
            <h4>帶走這幾件事</h4>
            <ul>
              {detail.summary.map((point, index) => (
                <li key={index}>
                  <CheckCircle2 size={16} />
                  <ScienceText text={point} />
                </li>
              ))}
            </ul>
          </div>
          <label className="lr-note-label">
            <span>
              <NotebookPen size={17} />
              我的理解筆記
            </span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="試著用自己的話解釋：這個觀念在說什麼？公式什麼時候能用？哪一步我還不確定？"
              rows={5}
              maxLength={20000}
            />
            <span className="lr-note-help">
              筆記儲存在這台裝置 · {note.length.toLocaleString()} / 20,000 字
            </span>
          </label>
        </section>

        <footer className="lr-footer">
          <div className="lr-finish-message">
            <span className="lr-finish-icon">
              <CheckCircle2 size={24} />
            </span>
            <div>
              <strong>
                {completed
                  ? "這個觀念，已成為你的工具。"
                  : "會解釋，也會運用，才算真的理解。"}
              </strong>
              <p>能用自己的話說明後，將單元標記為已掌握。</p>
            </div>
          </div>
          <div className="lr-actions">
            <button
              type="button"
              className={`lr-button ${completed ? "lr-button-completed" : "lr-button-dark"}`}
              onClick={onToggleComplete}
              aria-pressed={completed}
            >
              <CheckCircle2 size={17} />
              {completed ? "已掌握 · 點擊取消" : "標記為已掌握"}
            </button>
            <button
              type="button"
              className="lr-button lr-button-outline"
              onClick={onLab}
            >
              <FlaskConical size={17} />
              互動實驗
            </button>
            <button
              type="button"
              className="lr-button lr-button-outline"
              onClick={onAskTutor}
            >
              <Sparkles size={17} />
              帶著問題問助教
            </button>
          </div>
        </footer>
        <nav className="lr-lesson-navigation" aria-label="前後單元">
          {previous ? (
            <button type="button" onClick={() => onSelectLesson(previous.id)}>
              <ArrowLeft size={17} />
              <span>
                <small>上一單元</small>
                <strong>{previous.title}</strong>
              </span>
            </button>
          ) : (
            <div className="lr-navigation-boundary">
              這是{subject?.name}的第一個單元
            </div>
          )}
          {next ? (
            <button type="button" onClick={() => onSelectLesson(next.id)}>
              <span>
                <small>下一單元</small>
                <strong>{next.title}</strong>
              </span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <div className="lr-navigation-boundary">
              你已來到{subject?.name}的最後一個單元
            </div>
          )}
        </nav>
      </div>
    </article>
  );
}
