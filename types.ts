
export enum Page {
  KEY_ENTRY = 'KEY_ENTRY',
  SCANNING = 'SCANNING',
  RESULTS = 'RESULTS',
  SAVED_LIST = 'SAVED_LIST',
}

export interface Answer {
  value: 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A' | 'MULTIPLE' | '';
}

export type AnswerKey = Record<string, Answer['value']>;

export type StudentAnswers = Record<string, Answer['value']>;

export interface ScanResult {
  id: string;
  timestamp: string;
  score: number;
  total: number;
  studentAnswers: StudentAnswers;
}
