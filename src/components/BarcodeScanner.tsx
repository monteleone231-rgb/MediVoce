/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../types';
import { getRandomBarcode, playAlarmTone, BarcodeResult } from '../utils';

interface BarcodeScannerProps {
  lang: LanguageCode;
  onScanSuccess: (item: BarcodeResult) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ lang, onScanSuccess, onClose }: BarcodeScannerProps) {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraPermission, setCameraPermission] = useState<'pending' | 'allowed' | 'denied'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [successItem, setSuccessItem] = useState<BarcodeResult | null>(null);

  // Initialize camera feed
  const startCamera = async () => {
    setErrorMessage('');
    setSuccessItem(null);
    try {
      // Clean up previous stream if any
      stopCamera();

      const constraints = {
        video: {
          facingMode: 'environment', // prefer back phone camera for barcodes
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission('allowed');
      setIsScanning(true);

      // Trigger standard automatic scanning simulation after 2.8 seconds
      setTimeout(() => {
        simulateBarcodeDetection();
      }, 2800);

    } catch (err: any) {
      console.error("Camera access failed", err);
      setCameraPermission('denied');
      setErrorMessage(t.cameraDenied);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Simulate scanning code
  const simulateBarcodeDetection = () => {
    if (!isScanning) return;
    
    // Play sound notification
    playAlarmTone('standard');
    
    // Select a random pharmaceutical product
    const mockItem = getRandomBarcode(lang);
    setSuccessItem(mockItem);
    setIsScanning(false);
    
    // Auto populate after short delay so the user sees the green success frame
    setTimeout(() => {
      onScanSuccess(mockItem);
    }, 1800);
  };

  // Re-enable camera scanning
  const resetScanner = () => {
    setSuccessItem(null);
    startCamera();
  };

  return (
    <div id="barcode-scanner-modal" className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border-2 border-[#E4DDD0] flex flex-col">
        
        {/* Header toolbar */}
        <div className="p-4 bg-white border-b border-[#E4DDD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#2C2115] text-base">{t.barcodeScanBtn}</span>
          </div>
          <button 
            id="close-scanner-btn"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 font-extrabold text-xl p-1"
          >
            ✕
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
          
          {cameraPermission === 'pending' && (
            <div className="text-gray-400 flex flex-col items-center gap-4 text-center px-6">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
              <p className="text-sm font-medium">{t.cameraRequesting}</p>
            </div>
          )}

          {cameraPermission === 'denied' && (
            <div className="text-center px-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
                <CameraOff className="w-8 h-8" />
              </div>
              <p className="text-sm text-red-200 leading-relaxed font-semibold">{errorMessage}</p>
              
              {/* Quick developer trigger button mock */}
              <button
                id="manual-mock-scan-btn"
                onClick={() => {
                  setCameraPermission('allowed');
                  setIsScanning(true);
                  simulateBarcodeDetection();
                }}
                className="py-2.5 px-5 bg-teal-600 text-white rounded-xl font-bold w-full text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.cameraSimulateBtn}</span>
              </button>
            </div>
          )}

          {cameraPermission === 'allowed' && (
            <div className="relative w-full h-full">
              {/* Actual HTML5 Live Video Element */}
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />

              {isScanning && (
                <>
                  {/* Neon laser line animation */}
                  <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-[bounce_2s_infinite]" />

                  {/* Corner Targets overlay */}
                  <div className="absolute inset-8 border-[3px] border-teal-400/30 rounded-2xl pointer-events-none flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400" />
                    
                    <span className="text-xs text-teal-300 font-bold tracking-widest uppercase bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                      {t.scanningInProgress}
                    </span>
                  </div>
                </>
              )}

              {successItem && (
                <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transform scale-110 duration-500 mb-3 animate-[pulse_1.5s_infinite]">
                    ✓
                  </div>
                  <h3 className="text-xl font-black text-white drop-shadow-md">
                    {t.barcodeSuccess}
                  </h3>
                  <p className="bg-white/95 text-gray-800 font-extrabold px-4 py-2 rounded-xl mt-3 shadow-md border border-emerald-400 text-base">
                    {successItem.name} ({successItem.dosage})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-amber-50/50 text-center space-y-3">
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {successItem ? t.barcodeMatching : t.barcodeScanPrompt}
          </p>

          {successItem && (
            <button
              id="rescan-btn"
              onClick={resetScanner}
              className="py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl transition-all border border-teal-200 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.barcodeScanAgain}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
