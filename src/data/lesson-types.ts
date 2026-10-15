export interface PracticeQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface LessonDetail {
  lessonId: string;
  objectives: string[];
  prerequisites: string[];
  sections: {
    heading: string;
    body: string;
    formula?: string;
    kind?: "math" | "chemistry";
  }[];
  workedExample: { question: string; steps: string[]; answer: string };
  practice: PracticeQuestion[];
  application: string;
  summary: string[];
}
