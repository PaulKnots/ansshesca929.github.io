import React from 'react';
import { StudentAnswers, AnswerKey, ScanResult } from '../types';
import { TOTAL_QUESTIONS, QUESTIONS_PER_COLUMN } from '../constants';

interface ResultsDisplayProps {
  studentAnswers: StudentAnswers;
  answerKey: AnswerKey;
  onSave: (result: ScanResult) => void;
  onScanNext: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ studentAnswers, answerKey, onSave, onScanNext }) => {
  let score = 0;
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const qNum = i.toString();
    if (answerKey[qNum] && studentAnswers[qNum] === answerKey[qNum]) {
      score++;
    }
  }

  // FIX: Moved `totalAnswered` before `percentage` to fix a 'used before declaration' error.
  const totalAnswered = Object.keys(answerKey).filter(k => answerKey[k]).length;
  const percentage = totalAnswered > 0 ? ((score / totalAnswered) * 100).toFixed(1) : 0;
  

  const handleSave = () => {
    const result: ScanResult = {
      id: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
      score,
      total: totalAnswered,
      studentAnswers,
    };
    onSave(result);
  };
  
  const getStatusColor = (qNum: string) => {
    if (!answerKey[qNum]) return 'bg-gray-200 text-gray-500'; // Not in key
    const studentAnswer = studentAnswers[qNum];
    const correctAnswer = answerKey[qNum];
    if (studentAnswer === correctAnswer) return 'bg-green-200 text-green-800';
    if (studentAnswer === 'N/A' || studentAnswer === 'MULTIPLE') return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const renderResultsColumn = (start: number) => (
    <div key={`res-col-${start}`} className="space-y-2">
      {Array.from({ length: QUESTIONS_PER_COLUMN }, (_, i) => start + i).map(qNum => (
        <div key={qNum} className={`flex items-center p-2 rounded-md text-sm ${getStatusColor(qNum.toString())}`}>
          <span className="font-bold w-8">{qNum}.</span>
          <div className="flex-grow">
            <span className="font-mono">{studentAnswers[qNum.toString()] || 'ERR'}</span>
          </div>
          <div className="font-bold text-right">
            {studentAnswers[qNum.toString()] !== answerKey[qNum.toString()] && answerKey[qNum.toString()] ? (
              <span className="font-mono text-green-700">{answerKey[qNum.toString()]}</span>
            ) : <span className="text-green-600">✓</span>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center mb-6 border-b pb-4">
            <h2 className="text-3xl font-bold text-gray-800">Scan Results</h2>
            <div className="mt-4 flex justify-center items-baseline space-x-4">
                <p className="text-5xl font-bold text-blue-600">{score}<span className="text-3xl text-gray-500">/{totalAnswered}</span></p>
                <p className="text-2xl font-semibold text-gray-600">({percentage}%)</p>
            </div>
        </div>
        
        <div className="my-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Detailed Breakdown</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {renderResultsColumn(1)}
                {renderResultsColumn(16)}
                {renderResultsColumn(31)}
                {renderResultsColumn(46)}
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                Save Result
            </button>
            <button onClick={onScanNext} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                Scan Next Sheet
            </button>
        </div>
    </div>
  );
};

export default ResultsDisplay;