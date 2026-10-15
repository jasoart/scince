import type { PracticeQuestion } from "../data/lesson-types";

export type PracticeAnswers = Record<string, number>;
export const PRACTICE_CHANGE_EVENT = "scince:practice-change";

export function questionSignature(questions: PracticeQuestion[]): string {
  const value = JSON.stringify(
    questions.map(({ id, prompt, options, answer }) => ({
      id,
      prompt,
      options,
      answer,
    })),
  );
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}

export function loadPracticeProgress(
  lessonId: string,
  questions: PracticeQuestion[],
): { answers: PracticeAnswers; available: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(`scince.practice.${lessonId}`);
  } catch {
    return { answers: {}, available: false };
  }
  if (!raw) return { answers: {}, available: true };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object")
      return { answers: {}, available: true };
    const record = parsed as Record<string, unknown>;
    if (
      record.version !== 1 ||
      record.signature !== questionSignature(questions) ||
      !record.answers ||
      typeof record.answers !== "object" ||
      Array.isArray(record.answers)
    )
      return { answers: {}, available: true };
    const stored = record.answers as Record<string, unknown>;
    const answers: PracticeAnswers = {};
    for (const question of questions) {
      const selected = stored[question.id];
      if (
        typeof selected === "number" &&
        Number.isInteger(selected) &&
        selected >= 0 &&
        selected < question.options.length
      )
        answers[question.id] = selected;
    }
    return { answers, available: true };
  } catch {
    return { answers: {}, available: true };
  }
}

export function savePracticeProgress(
  lessonId: string,
  signature: string,
  answers: PracticeAnswers,
): boolean {
  try {
    localStorage.setItem(
      `scince.practice.${lessonId}`,
      JSON.stringify({ version: 1, signature, answers }),
    );
    window.dispatchEvent(new Event(PRACTICE_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function summarizePractice(
  questions: PracticeQuestion[],
  answers: PracticeAnswers,
) {
  const attempted = questions.filter((question) =>
    Number.isInteger(answers[question.id]),
  ).length;
  const correct = questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  return {
    total: questions.length,
    attempted,
    correct,
    incorrect: attempted - correct,
  };
}
