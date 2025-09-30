import React, { useState, useCallback, useRef, useEffect } from 'react';
import { scanAnswerSheet } from '../services/geminiService';
import { StudentAnswers } from '../types';
import { UploadCloudIcon } from './icons/Icons';

interface CameraScannerProps {
    onScanComplete: (answers: StudentAnswers, image: string) => void;
    onScanError: (error: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScanComplete, onScanError, setIsLoading }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cleanup object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            onScanError("Please upload a valid image file (JPEG, PNG, etc.).");
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    
    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const processImage = useCallback(async () => {
        if (!imageFile) return;

        setIsLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const dataUrl = reader.result as string;
                const answers = await scanAnswerSheet(base64String);
                onScanComplete(answers, dataUrl);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during processing.";
                onScanError(errorMessage);
            }
        };
        reader.onerror = () => {
             onScanError("Failed to read the image file.");
             setIsLoading(false);
        };
    }, [imageFile, onScanComplete, onScanError, setIsLoading]);
    
    const clearSelection = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    return (
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Answer Sheet</h2>
        <p className="text-slate-500 mb-6">Upload a cropped image of the student's answer sheet to begin grading.</p>
        
        {!previewUrl ? (
            <form 
                className="relative"
                onDragEnter={handleDrag}
                onSubmit={(e) => e.preventDefault()}
            >
                <div 
                    onClick={onButtonClick}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                    ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
                    <UploadCloudIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PNG, JPG, or WEBP</p>
                </div>
                 {dragActive && <div className="absolute inset-0 w-full h-full" onDragLeave={handleDrag} onDrop={handleDrop}></div>}
            </form>
        ) : (
            <div>
                <div className="mb-6 border border-slate-200 rounded-lg p-2">
                    <img src={previewUrl} alt="Answer sheet preview" className="w-full max-h-[50vh] object-contain rounded-md" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={processImage} className="flex-1 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300">
                        Grade This Sheet
                    </button>
                    <button onClick={clearSelection} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
                        Choose Different Image
                    </button>
                </div>
            </div>
        )}
      </div>
    );
};

export default CameraScanner;