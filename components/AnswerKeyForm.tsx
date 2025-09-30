
import React, { useState } from 'react';
import { AnswerKey, AnswerOption } from '../types';

interface AnswerKeyFormProps {
    onSubmit: (key: AnswerKey) => void;
}

const TOTAL_QUESTIONS = 60;
const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

const AnswerKeyForm: React.FC<AnswerKeyFormProps> = ({ onSubmit }) => {
    const [answers, setAnswers] = useState<AnswerKey>({});

    const handleAnswerChange = (question: number, option: AnswerOption) => {
        setAnswers(prev => ({ ...prev, [question]: option }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAnswers: AnswerKey = {};
        for(let i=1; i<=TOTAL_QUESTIONS; i++){
            finalAnswers[i] = answers[i] || null;
        }
        onSubmit(finalAnswers);
    };
    
    const renderQuestionInputs = () => {
        return Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map(qNum => (
            <div key={qNum} className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="font-semibold text-slate-700 w-10">{qNum}.</div>
                <div className="flex space-x-2">
                    {OPTIONS.map(opt => (
                        <label key={opt} className="cursor-pointer">
                            <input
                                type="radio"
                                name={`question-${qNum}`}
                                value={opt}
                                checked={answers[qNum] === opt}
                                onChange={() => handleAnswerChange(qNum, opt)}
                                className="sr-only"
                            />
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors font-medium
                                ${answers[qNum] === opt ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            >
                                {opt}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Set Answer Key</h2>
            <p className="text-slate-500 mb-6">Enter the correct answers for the test. You can proceed to scan once the key is set.</p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 mb-8">
                    {renderQuestionInputs()}
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                    Save Key & Start Scanning
                </button>
            </form>
        </div>
    );
};

export default AnswerKeyForm;
