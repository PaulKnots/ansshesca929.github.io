
import React, { useState, useCallback } from 'react';
import { AnswerKey, AppState, StudentAnswers, GradedResult } from './types';
import Header from './components/Header';
import AnswerKeyForm from './components/AnswerKeyForm';
import CameraScanner from './components/CameraScanner';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryView from './components/HistoryView';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('KEY_INPUT');
  const [answerKey, setAnswerKey] = useState<AnswerKey | null>(null);
  const [lastScan, setLastScan] = useState<{ studentAnswers: StudentAnswers; image: string } | null>(null);
  const [history, setHistory] = useLocalStorage<GradedResult[]>('scanHistory', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeySubmit = (key: AnswerKey) => {
    setAnswerKey(key);
    setAppState('SCANNING');
    setError(null);
  };

  const handleScanComplete = (studentAnswers: StudentAnswers, image: string) => {
    setLastScan({ studentAnswers, image });
    setAppState('RESULTS');
    setIsLoading(false);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setAppState('SCANNING');
  };

  const handleSaveResult = useCallback((result: GradedResult) => {
    setHistory(prevHistory => [...prevHistory, result]);
    setAppState('SCANNING');
    setLastScan(null);
  }, [setHistory]);

  const handleScanNew = () => {
    setAppState('SCANNING');
    setLastScan(null);
    setError(null);
  };
  
  const handleEditKey = () => {
      setAppState('KEY_INPUT');
      setAnswerKey(null);
      setLastScan(null);
      setError(null);
  }

  const navigateTo = (state: AppState) => {
      setAppState(state);
      setError(null);
  }


  const renderContent = () => {
    switch (appState) {
      case 'KEY_INPUT':
        return <AnswerKeyForm onSubmit={handleKeySubmit} />;
      case 'SCANNING':
        if (!answerKey) {
            setAppState('KEY_INPUT');
            return <AnswerKeyForm onSubmit={handleKeySubmit} />;
        }
        return (
          <CameraScanner
            onScanComplete={handleScanComplete}
            onScanError={handleScanError}
            setIsLoading={setIsLoading}
          />
        );
      case 'RESULTS':
        if (!lastScan || !answerKey) {
            handleScanNew(); // Should not happen, but as a fallback
            return null;
        }
        return (
          <ResultsDisplay
            studentAnswers={lastScan.studentAnswers}
            answerKey={answerKey}
            scannedImage={lastScan.image}
            onSave={handleSaveResult}
            onScanNew={handleScanNew}
          />
        );
      case 'HISTORY':
        return <HistoryView history={history} setHistory={setHistory} />;
      default:
        return <div>Invalid State</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header appState={appState} navigateTo={navigateTo} hasKey={!!answerKey} onEditKey={handleEditKey} />
      <main className="container mx-auto p-4 md:p-8">
        {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-400"></div>
              <p className="text-white text-xl mt-4">AI is grading the sheet...</p>
            </div>
        )}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
