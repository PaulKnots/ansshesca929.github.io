import React, { useState } from 'react';
import { StudentAnswers, AnswerKey, ScanResult } from '../types';
import { TOTAL_QUESTIONS, QUESTIONS_PER_COLUMN } from '../constants';

interface ResultsDisplayProps {
  studentAnswers: StudentAnswers;
  answerKey: AnswerKey;
  capturedImage: string | null;
  onSave: (result: ScanResult) => void;
  onScanNext: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ studentAnswers, answerKey, capturedImage, onSave, onScanNext }) => {
  const [imageDims, setImageDims] = useState<{ naturalWidth: number, naturalHeight: number, displayWidth: number, displayHeight: number } | null>(null);

  let score = 0;
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const qNum = i.toString();
    if (answerKey[qNum] && studentAnswers[qNum]?.value === answerKey[qNum]) {
      score++;
    }
  }

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
    if (!answerKey[qNum]) return 'bg-gray-200 text-gray-500';
    const studentAnswer = studentAnswers[qNum]?.value;
    const correctAnswer = answerKey[qNum];
    if (studentAnswer === correctAnswer) return 'bg-green-200 text-green-800';
    if (studentAnswer === 'N/A' || studentAnswer === 'MULTIPLE') return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    setImageDims({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.clientWidth,
        displayHeight: img.clientHeight,
    });
  };

  const renderResultsColumn = (start: number) => (
    <div key={`res-col-${start}`} className="space-y-2">
      {Array.from({ length: QUESTIONS_PER_COLUMN }, (_, i) => start + i).map(qNum => (
        <div key={qNum} className={`flex items-center p-2 rounded-md text-sm ${getStatusColor(qNum.toString())}`}>
          <span className="font-bold w-8">{qNum}.</span>
          <div className="flex-grow">
            <span className="font-mono">{studentAnswers[qNum.toString()]?.value || 'ERR'}</span>
          </div>
          <div className="font-bold text-right">
            {studentAnswers[qNum.toString()]?.value !== answerKey[qNum.toString()] && answerKey[qNum.toString()] ? (
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Scanned Image with Detections</h3>
                <div className="relative bg-gray-100 p-2 rounded-lg shadow-inner w-full">
                    {capturedImage ? (
                        <>
                            <img 
                                src={capturedImage} 
                                alt="Captured answer sheet" 
                                className="rounded-md w-full h-auto object-contain"
                                onLoad={handleImageLoad}
                            />
                            {imageDims && Object.values(studentAnswers).map((answer, index) => {
                                if (!answer.coordinates) return null;

                                const scaleX = imageDims.displayWidth / imageDims.naturalWidth;
                                const scaleY = imageDims.displayHeight / imageDims.naturalHeight;
                                const left = answer.coordinates.x * scaleX;
                                const top = answer.coordinates.y * scaleY;
                                
                                const isCorrect = answerKey[(index + 1).toString()] === answer.value;
                                const color = isCorrect ? 'rgba(74, 222, 128, 0.7)' : 'rgba(239, 68, 68, 0.7)';
                                const borderColor = isCorrect ? 'rgba(34, 197, 94, 0.9)' : 'rgba(220, 38, 38, 0.9)';

                                return (
                                    <div
                                        key={index}
                                        className="absolute rounded-full"
                                        style={{
                                            left: `${left}px`,
                                            top: `${top}px`,
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: color,
                                            border: `2px solid ${borderColor}`,
                                            transform: 'translate(-50%, -50%)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                );
                            })}
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-[300px] w-full">
                            <p className="text-gray-500">Image not available.</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="text-center mb-6">
                    <div className="flex justify-center items-baseline space-x-4">
                        <p className="text-5xl font-bold text-blue-600">{score}<span className="text-3xl text-gray-500">/{totalAnswered}</span></p>
                        <p className="text-2xl font-semibold text-gray-600">({percentage}%)</p>
                    </div>
                </div>
                
                <div className="my-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Detailed Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {renderResultsColumn(1)}
                        {renderResultsColumn(16)}
                        {renderResultsColumn(31)}
                        {renderResultsColumn(46)}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-center items-center gap-4">
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