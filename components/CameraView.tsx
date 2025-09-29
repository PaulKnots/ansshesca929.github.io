
import React, { useRef, useEffect, useState } from 'react';
import Loader from './Loader';

interface CameraViewProps {
  onScan: (imageData: string) => void;
  isLoading: boolean;
  error: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onScan, isLoading, error }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access the camera. Please check permissions and ensure your camera is not in use by another application.");
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = dataUrl.split(',')[1];
        onScan(base64Data);
      }
    }
  };

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
      {isLoading && <Loader message="Analyzing Sheet..." />}
      <div className="relative w-full max-w-2xl bg-black rounded-xl shadow-2xl overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full h-full border-4 border-dashed border-white border-opacity-70 rounded-lg" style={{aspectRatio: '152 / 154'}}></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-center text-white">
          <p className="font-semibold">Align the answer sheet within the dashed rectangle</p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 w-full max-w-2xl text-center p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleCapture}
        disabled={isLoading}
        className="mt-6 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-3 transition-transform transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Scan Sheet</span>
      </button>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraView;
