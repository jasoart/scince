import { physicalDetails } from "./details-physical";
import { lifeEarthDetails } from "./details-life-earth";
import type { LessonDetail } from "./lesson-types";

export const completeLessons: LessonDetail[] = [
  ...physicalDetails,
  ...lifeEarthDetails,
];
export const lessonDetails: Record<string, LessonDetail> = Object.fromEntries(
  completeLessons.map((detail) => [detail.lessonId, detail]),
);
export const practiceCount = completeLessons.reduce(
  (sum, detail) => sum + detail.practice.length,
  0,
);
