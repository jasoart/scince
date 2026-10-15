import { lessons } from "./curriculum";
import { officialScope } from "./official-scope";
import { physicsCoverageNotes } from "./extra-physics";
import { chemistryCoverageNotes } from "./extra-chemistry";
import { biologyCoverageNotes } from "./extra-biology";
import { earthCoverageNotes } from "./extra-earth";

const notes = [
  ...physicsCoverageNotes,
  ...chemistryCoverageNotes,
  ...biologyCoverageNotes,
  ...earthCoverageNotes,
];
export const coverage = officialScope.map((item) => {
  const note = notes.find((note) => note.code === item.code);
  const ids = new Set([
    ...lessons
      .filter((lesson) => lesson.tags.includes(item.code))
      .map((lesson) => lesson.id),
    ...(note?.lessonIds ?? []),
  ]);
  return {
    ...item,
    lessons: lessons.filter((lesson) => ids.has(lesson.id)),
    rationale: note?.rationale ?? "",
  };
});
export const unlinkedScope = coverage.filter(
  (item) => item.lessons.length === 0,
);
