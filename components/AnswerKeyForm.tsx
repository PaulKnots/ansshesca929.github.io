
import React, { useState } from 'react';
import { AnswerKey } from '../types';
import { TOTAL_QUESTIONS, QUESTIONS_PER_COLUMN, OPTIONS } from '../constants';

interface AnswerKeyFormProps {
  initialKey: AnswerKey;
  onSave: (key: AnswerKey) => void;
}

const AnswerKeyForm: React.FC<AnswerKeyFormProps> = ({ initialKey, onSave }) => {
  const [key, setKey] = useState<AnswerKey>(initialKey);

  const handleOptionChange = (questionNumber: number, option: string) => {
    setKey(prev => ({ ...prev, [questionNumber]: option }));
  };
  
  const isComplete = Object.keys(key).filter(k => key[k]).length === TOTAL_QUESTIONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(key).length < TOTAL_QUESTIONS) {
        if(!confirm('The answer key is incomplete. Do you want to continue?')) {
            return;
        }
    }
    onSave(key);
  };

  const renderQuestionColumn = (start: number) => {
    return (
      <div key={`col-${start}`} className="space-y-4">
        {Array.from({ length: QUESTIONS_PER_COLUMN }, (_, i) => start + i).map(qNum => (
          <div key={qNum} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
            <span className="w-8 text-sm font-semibold text-gray-600">{qNum}.</span>
            <div className="flex items-center space-x-2">
              {OPTIONS.map(opt => (
                <label key={opt} className="flex items-center cursor-pointer text-sm">
                  <input
                    type="radio"
                    name={`q-${qNum}`}
                    value={opt}
                    checked={key[qNum] === opt}
                    onChange={() => handleOptionChange(qNum, opt)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`ml-2 w-5 text-center font-medium ${key[qNum] === opt ? 'text-blue-700' : 'text-gray-500'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Enter Answer Key</h2>
        <p className="text-gray-500 mt-1">Select the correct option for each question.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {renderQuestionColumn(1)}
          {renderQuestionColumn(16)}
          {renderQuestionColumn(31)}
          {renderQuestionColumn(46)}
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="w-full max-w-md px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Save Key & Start Scanning
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerKeyForm;
