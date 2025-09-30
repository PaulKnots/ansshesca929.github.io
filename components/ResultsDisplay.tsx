import React, { useState, useMemo } from 'react';
import { AnswerKey, StudentAnswers, GradedResult, AnswerOption } from '../types';
import { SaveIcon, RefreshCwIcon } from './icons/Icons';
import Modal from './Modal';

interface ResultsDisplayProps {
    studentAnswers: StudentAnswers;
    answerKey: AnswerKey;
    scannedImage: string;
    onSave: (result: GradedResult) => void;
    onScanNew: () => void;
}

const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];
const TOTAL_QUESTIONS = 60;

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ studentAnswers, answerKey, scannedImage, onSave, onScanNew }) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [studentName, setStudentName] = useState('');

    const { score, totalCorrect, totalQuestions } = useMemo(() => {
        let correct = 0;
        const questions = Object.keys(answerKey).filter(q => answerKey[parseInt(q)] !== null);
        questions.forEach(qNumStr => {
            const qNum = parseInt(qNumStr, 10);
            if (answerKey[qNum] && studentAnswers[qNum] === answerKey[qNum]) {
                correct++;
            }
        });
        const totalDefinedQuestions = questions.length;
        return {
            score: totalDefinedQuestions > 0 ? Math.round((correct / totalDefinedQuestions) * 100) : 0,
            totalCorrect: correct,
            totalQuestions: totalDefinedQuestions,
        };
    }, [studentAnswers, answerKey]);

    const handleSave = () => {
        const result: GradedResult = {
            id: new Date().toISOString(),
            studentName: studentName.trim() || 'Unnamed',
            score: score,
            total: totalQuestions,
            date: new Date().toLocaleDateString(),
            studentAnswers,
            answerKey
        };
        onSave(result);
        setIsSaveModalOpen(false);
    };

    const getCellClass = (qNum: number, option: AnswerOption) => {
        const isCorrectAnswer = answerKey[qNum] === option;
        const isStudentAnswer = studentAnswers[qNum] === option;
        
        if (isCorrectAnswer && isStudentAnswer) {
            return 'bg-green-500 text-white'; // Correctly chosen
        }
        if (isCorrectAnswer) {
            return 'bg-green-200 text-green-800 border-2 border-green-500'; // The correct answer, not chosen
        }
        if (isStudentAnswer) {
            return 'bg-red-500 text-white'; // Incorrectly chosen
        }
        return 'bg-slate-200 text-slate-600'; // Not chosen
    };
    
    const questionBlocks = [
        Array.from({ length: 15 }, (_, i) => i + 1),  // 1-15
        Array.from({ length: 15 }, (_, i) => i + 16), // 16-30
        Array.from({ length: 15 }, (_, i) => i + 31), // 31-45
        Array.from({ length: 15 }, (_, i) => i + 46)  // 46-60
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center self-start sticky top-28">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Grading Complete</h2>
                    <img src={scannedImage} alt="Scanned answer sheet" className="rounded-lg mb-4 w-full shadow-md" />

                    <div className="text-center my-4">
                        <p className="text-slate-500">Score</p>
                        <p className="text-6xl font-bold text-teal-600">{score}%</p>
                        <p className="text-lg text-slate-600 font-medium">{totalCorrect} / {totalQuestions} Correct</p>
                    </div>

                    <div className="w-full flex flex-col space-y-3 mt-4">
                        <button
                            onClick={() => setIsSaveModalOpen(true)}
                            className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                        >
                            <SaveIcon className="mr-2" />
                            Save Result
                        </button>
                        <button
                            onClick={onScanNew}
                            className="w-full flex items-center justify-center bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-transform transform hover:scale-105"
                        >
                            <RefreshCwIcon className="mr-2" />
                            Scan Next Sheet
                        </button>
                    </div>
                </div>

                <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Detailed Results</h3>
                     <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>Correct</div>
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>Incorrect</div>
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-200 border-2 border-green-500 mr-2"></div>Correct Answer</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                         {questionBlocks.map((block, blockIndex) => (
                            <div key={blockIndex} className="flex flex-col">
                                {block.map(qNum => (
                                    <div key={qNum} className="flex items-center justify-between py-2 border-b border-slate-200">
                                        <div className="font-semibold text-slate-700 w-8 text-sm">{qNum}.</div>
                                        <div className="flex space-x-1">
                                            {OPTIONS.map(opt => (
                                                <span
                                                    key={opt}
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors font-medium text-xs ${getCellClass(qNum, opt)}`}
                                                >
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Save Result</h3>
                <p className="text-slate-500 mb-4">Enter a name or ID for this student to save the result.</p>
                <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Student Name / ID"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </Modal>
        </div>
    );
};

export default ResultsDisplay;