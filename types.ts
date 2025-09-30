
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E';

export type AnswerKey = {
  [key: number]: AnswerOption | null;
};

export type StudentAnswers = {
  [key: number]: AnswerOption | null;
};

export type AppState = 'KEY_INPUT' | 'SCANNING' | 'RESULTS' | 'HISTORY';

export interface GradedResult {
  id: string;
  studentName: string;
  score: number;
  total: number;
  date: string;
  studentAnswers: StudentAnswers;
  answerKey: AnswerKey;
}
