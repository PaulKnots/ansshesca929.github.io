import React, { useRef, useEffect, useState, useCallback } from 'react';
import Loader from './Loader';

// Using `any` for the cv object because official types are not readily available for the UMD build.
declare const cv: any;

interface CameraViewProps {
  onScan: (dataUrl: string) => void;
  isLoading: boolean;
  error: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onScan, isLoading, error }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCvReady, setIsCvReady] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing Camera...');

  useEffect(() => {
    const checkCv = () => {
      if (typeof cv !== 'undefined' && cv.Mat) {
        setIsCvReady(true);
      } else {
        setTimeout(checkCv, 100);
      }
    };
    checkCv();
  }, []);

  const stopAllStreams = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  
  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isLoading) {
      stopAllStreams();
      setStatusMessage('Captured! Analyzing...');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onScan(dataUrl);
      }
    }
  }, [isLoading, onScan, stopAllStreams]);


  const processVideo = useCallback(() => {
    if (!videoRef.current || !overlayCanvasRef.current || videoRef.current.paused || videoRef.current.ended || !isCvReady || isLoading) {
      animationFrameRef.current = requestAnimationFrame(processVideo);
      return;
    }

    const video = videoRef.current;
    const overlay = overlayCanvasRef.current;
    const context = overlay.getContext('2d');
    
    if (video.videoWidth === 0) {
        animationFrameRef.current = requestAnimationFrame(processVideo);
        return;
    }

    overlay.width = video.clientWidth;
    overlay.height = video.clientHeight;

    const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    const cap = new cv.VideoCapture(video);
    cap.read(src);

    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    const edged = new cv.Mat();
    cv.Canny(blurred, edged, 75, 200);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let screenCnt: any = null;

    for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        // Relaxed the area check to make the guide appear more readily
        if (area > maxArea) {
            const peri = cv.arcLength(cnt, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
            if (approx.rows === 4) {
                maxArea = area;
                screenCnt = approx;
            }
            approx.delete();
        }
        cnt.delete();
    }

    context.clearRect(0, 0, overlay.width, overlay.height);
    
    // The overlay is now just a visual guide. It does not block capturing.
    if (screenCnt && maxArea > 20000) { // Lowered threshold for guide to appear
      setStatusMessage('Paper detected. Align and press capture.');
      context.strokeStyle = 'rgba(74, 222, 128, 0.9)'; // Green
      context.lineWidth = 4;
      context.beginPath();
      
      const scaleX = overlay.width / video.videoWidth;
      const scaleY = overlay.height / video.videoHeight;

      context.moveTo(screenCnt.data32S[0] * scaleX, screenCnt.data32S[1] * scaleY);
      for(let i = 1; i < screenCnt.rows; i++) {
        context.lineTo(screenCnt.data32S[i*2] * scaleX, screenCnt.data32S[i*2+1] * scaleY);
      }
      context.closePath();
      context.stroke();
    } else {
      setStatusMessage('Point camera at the answer sheet.');
    }

    src.delete(); gray.delete(); blurred.delete(); edged.delete(); contours.delete(); hierarchy.delete();
    if(screenCnt) screenCnt.delete();

    animationFrameRef.current = requestAnimationFrame(processVideo);
  }, [isCvReady, isLoading]);


  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 24 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            animationFrameRef.current = requestAnimationFrame(processVideo);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access the camera. Please check permissions and ensure it's not in use by another application.");
      }
    };

    if (isCvReady) {
      enableCamera();
    }

    return () => {
      stopAllStreams();
    };
  }, [isCvReady, processVideo, stopAllStreams]);

  if (cameraError) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Camera Error</h2>
        <p>{cameraError}</p>
      </div>
    );
  }
  
  const showLoader = isLoading || !isCvReady;

  return (
    <div className="flex flex-col items-center">
      {showLoader && <Loader message={isLoading ? "Analyzing Sheet..." : "Loading Vision Engine..."} />}
      <div className="relative w-full max-w-4xl bg-black rounded-xl shadow-2xl overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
        <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4 text-center text-white">
          <p className="font-semibold text-lg">{statusMessage}</p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 w-full max-w-4xl text-center p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleCapture}
        disabled={isLoading || !isCvReady}
        className="mt-6 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-3 transition-transform transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Capture Image</span>
      </button>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraView;