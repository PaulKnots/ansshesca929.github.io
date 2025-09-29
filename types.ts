
// FIX: Removed self-import of `Page` which was causing compilation errors.
export enum Page {
  KEY_ENTRY = 'KEY_ENTRY',
  SCANNING = 'SCANNING',
  RESULTS = 'RESULTS',
  SAVED_LIST = 'SAVED_LIST',
}

export interface Answer {
  value: 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A' | 'MULTIPLE' | '';
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface StudentAnswerDetail {
  value: Answer['value'];
  coordinates: Coordinates | null;
}

export type AnswerKey = Record<string, Answer['value']>;

export type StudentAnswers = Record<string, StudentAnswerDetail>;

export interface ScanResult {
  id: string;
  timestamp: string;
  score: number;
  total: number;
  studentAnswers: StudentAnswers;
}