"use client";

import { useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (value: string) => void;
  isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";
  const scannerStarted = useRef(false);

  const stopScanner = useCallback(async () => {
    if (qrRef.current && scannerStarted.current) {
      try {
        await qrRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      scannerStarted.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopScanner();
      return;
    }

    // Slight delay to ensure the DOM element is mounted
    const timeout = setTimeout(async () => {
      try {
        const instance = new Html5Qrcode(containerId);
        qrRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {
            // Ignore per-frame errors — these fire constantly during scanning
          },
        );

        scannerStarted.current = true;
      } catch (err) {
        console.error("QR scanner failed to start:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      stopScanner();
    };
  }, [isActive, onScan, stopScanner]);

  return (
    <div className="relative w-full aspect-4/3 max-h-72 bg-black rounded-2xl overflow-hidden">
      {/* html5-qrcode mounts the video element here */}
      <div id={containerId} className="w-full h-full" />

      {/* Corner bracket overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Top-left */}
          <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white rounded-tl-sm" />
          {/* Top-right */}
          <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white rounded-tr-sm" />
          {/* Bottom-left */}
          <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white rounded-bl-sm" />
          {/* Bottom-right */}
          <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white rounded-br-sm" />
        </div>
      </div>
    </div>
  );
}
