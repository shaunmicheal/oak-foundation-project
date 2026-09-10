"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (value: string) => void;
  isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";
  const scannerStarted = useRef(false);
  const [cameraError, setCameraError] = useState(false);

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
        setCameraError(true);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      stopScanner();
    };
  }, [isActive, onScan, stopScanner]);

  const statusText = cameraError
    ? "Camera unavailable — check browser permissions"
    : isActive
      ? "Rear camera ready · Auto-scan in 3 seconds"
      : "Scanner paused";

  return (
    <div className="relative w-full aspect-4/3 max-h-80 bg-[#0E1D3A] rounded-2xl overflow-hidden">
      {/* html5-qrcode mounts the video element here */}
      <div id={containerId} className="w-full h-full" />

      {/* Corner bracket overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-44 h-44">
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

      {/* Frame caption */}
      <p className="pointer-events-none absolute inset-x-0 bottom-12 text-center text-[11px] text-white/60">
        Position QR code within the frame
      </p>

      {/* Camera status bar */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/25 px-4 py-2.5 flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/70 shrink-0"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="text-[11px] text-white/70 truncate">{statusText}</p>
      </div>
    </div>
  );
}
