
import React, { useState, useEffect, useCallback } from 'react';
import { Page, AnswerKey, StudentAnswers, ScanResult } from './types';
import AnswerKeyForm from './components/AnswerKeyForm';
import CameraView from './components/CameraView';
import ResultsDisplay from './components/ResultsDisplay';
import SavedResultsList from './components/SavedResultsList';
import { gradeSheet } from './services/geminiService';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.KEY_ENTRY);
  const [answerKey, setAnswerKey] = useState<AnswerKey>(() => {
    const savedKey = localStorage.getItem('answerKey');
    return savedKey ? JSON.parse(savedKey) : {};
  });
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers | null>(null);
  const [savedResults, setSavedResults] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('savedResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('answerKey', JSON.stringify(answerKey));
  }, [answerKey]);

  useEffect(() => {
    localStorage.setItem('savedResults', JSON.stringify(savedResults));
  }, [savedResults]);

  const handleKeySave = (key: AnswerKey) => {
    setAnswerKey(key);
    setCurrentPage(Page.SCANNING);
  };

  const handleScan = async (imageData: string) => {
    setIsLoading(true);
    setError(null);
    setStudentAnswers(null);
    try {
      const answers = await gradeSheet(imageData);
      setStudentAnswers(answers);
      setCurrentPage(Page.RESULTS);
    } catch (err) {
      setError('Failed to grade the sheet. The AI could not read the image. Please try again with a clearer picture.');
      setCurrentPage(Page.SCANNING); // Stay on scanning page to retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = (result: ScanResult) => {
    setSavedResults(prev => [...prev, result]);
    alert('Result saved!');
  };
  
  const handleScanNext = () => {
    setStudentAnswers(null);
    setCurrentPage(Page.SCANNING);
  };

  const navigateTo = (page: Page) => {
    setError(null);
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.KEY_ENTRY:
        return <AnswerKeyForm initialKey={answerKey} onSave={handleKeySave} />;
      case Page.SCANNING:
        return <CameraView onScan={handleScan} isLoading={isLoading} error={error} />;
      case Page.RESULTS:
        if (studentAnswers) {
          return (
            <ResultsDisplay 
              studentAnswers={studentAnswers} 
              answerKey={answerKey} 
              onSave={handleSaveResult}
              onScanNext={handleScanNext}
            />
          );
        }
        return null;
      case Page.SAVED_LIST:
        return <SavedResultsList results={savedResults} onClear={() => setSavedResults([])} />;
      default:
        return <AnswerKeyForm initialKey={answerKey} onSave={handleKeySave} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header currentPage={currentPage} navigateTo={navigateTo} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
