import React, { useRef, useEffect, useState, useCallback } from 'react';
import Loader from './Loader';

interface CameraViewProps {
  onScan: (dataUrl: string) => void;
  isLoading: boolean;
  error: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onScan, isLoading, error }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  
  const stopAllStreams = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  }, []);
  
  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isLoading) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onScan(dataUrl);
        stopAllStreams(); // Stop camera after capture to indicate success
      }
    }
  }, [isLoading, onScan, stopAllStreams]);

  useEffect(() => {
    const enableCamera = async () => {
      if (streamRef.current) {
        stopAllStreams();
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access the camera. Please check permissions and ensure it's not in use by another application.");
      }
    };

    enableCamera();

    return () => {
      stopAllStreams();
    };
  }, [stopAllStreams]);

  if (cameraError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Camera Error</h2>
        <p>{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isLoading && <Loader message={"Analyzing Sheet..."} />}
      <div className="relative w-full max-w-4xl bg-black rounded-xl shadow-2xl overflow-hidden aspect-[16/9]">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {/* Static Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[90%] h-[90%] border-4 border-dashed border-white border-opacity-70 rounded-lg relative">
            {/* Corner brackets */}
            <span className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></span>
            <span className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></span>
            <span className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></span>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4 text-center text-white">
          <p className="font-semibold text-lg">Position the sheet inside the frame and capture.</p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 w-full max-w-4xl text-center p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleCapture}
        disabled={isLoading || !isCameraReady}
        className="mt-6 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-3 transition-transform transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{!isCameraReady ? 'Initializing Camera...' : 'Capture Image'}</span>
      </button>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraView;