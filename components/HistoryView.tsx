
import React from 'react';
import { GradedResult } from '../types';
import { Trash2Icon } from './icons/Icons';

interface HistoryViewProps {
    history: GradedResult[];
    setHistory: React.Dispatch<React.SetStateAction<GradedResult[]>>;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, setHistory }) => {

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear all saved results? This action cannot be undone.")) {
            setHistory([]);
        }
    };
    
    if (history.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-slate-800">No Saved Results</h2>
                <p className="text-slate-500 mt-2">Scan an answer sheet and save the result to see it here.</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Scan History</h2>
                <button
                    onClick={clearHistory}
                    className="flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                    <Trash2Icon className="mr-2" />
                    Clear History
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600">Student Name/ID</th>
                            <th className="p-3 font-semibold text-slate-600">Date</th>
                            <th className="p-3 font-semibold text-slate-600">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.sort((a,b) => new Date(b.id).getTime() - new Date(a.id).getTime()).map(result => (
                            <tr key={result.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-3 text-slate-800 font-medium">{result.studentName}</td>
                                <td className="p-3 text-slate-500">{result.date}</td>
                                <td className="p-3 text-slate-800 font-medium">
                                    <span className={`px-2 py-1 rounded-full text-sm ${result.score >= 80 ? 'bg-green-100 text-green-800' : result.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {result.score}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryView;
