
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { scanAnswerSheet } from '../services/geminiService';
import { StudentAnswers } from '../types';
import { CameraIcon } from './icons/Icons';

interface CameraScannerProps {
    onScanComplete: (answers: StudentAnswers, image: string) => void;
    onScanError: (error: string) => void;
    setIsLoading: (isLoading: boolean) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScanComplete, onScanError, setIsLoading }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const cleanupCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        const enableCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setCameraError("Could not access camera. Please ensure permissions are granted and try again.");
            }
        };

        enableCamera();
        return cleanupCamera;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsLoading(true);
        cleanupCamera(); // Turn off camera to indicate processing

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            onScanError("Could not get canvas context.");
            setIsLoading(false);
            return;
        };

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64Image = imageDataUrl.split(',')[1];
        
        try {
            const answers = await scanAnswerSheet(base64Image);
            onScanComplete(answers, imageDataUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during scanning.";
            onScanError(errorMessage);
        } finally {
            // Loading is handled in parent component
        }
    };
    
    if (cameraError) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-xl font-bold text-red-600">Camera Error</h2>
                <p className="text-slate-600 mt-4">{cameraError}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full bg-slate-900 rounded-2xl shadow-2xl p-4 relative overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg" />
                <div className="absolute inset-0 border-[20px] sm:border-[30px] border-black/30 rounded-2xl pointer-events-none">
                     <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg"></div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-4">
                    <p className="text-white text-center text-sm bg-black/50 p-2 rounded-lg">Align the answer sheet within the dashed frame and capture.</p>
                </div>
            </div>
            <button
                onClick={captureImage}
                disabled={!stream}
                className="mt-8 flex items-center justify-center w-20 h-20 bg-teal-600 rounded-full text-white shadow-lg
                           hover:bg-teal-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-teal-300
                           disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
            >
                <CameraIcon className="w-10 h-10"/>
            </button>
        </div>
    );
};

export default CameraScanner;
