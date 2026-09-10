"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("@/components/checkin/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] max-h-72 bg-black rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
    </div>
  ),
});

// ── Types ──────────────────────────────────────────────────────────────────────

type CheckinState =
  | "scanning"
  | "success"
  | "already_checked_in"
  | "not_found"
  | "error";

type CheckedInAttendee = {
  full_name: string;
  organization: string;
  role?: string;
  checkedInAt: Date;
};

type SuccessData = {
  full_name: string;
  organization: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_BADGE_COLORS: Record<string, string> = {
  Partner: "bg-blue-100 text-blue-700",
  "Own Staff": "bg-orange-100 text-orange-700",
  "Coordinator Team": "bg-violet-100 text-violet-700",
  Presenter: "bg-teal-100 text-teal-700",
  Observer: "bg-slate-100 text-slate-600",
};

function roleBadgeClass(role?: string) {
  if (!role) return "bg-slate-100 text-slate-600";
  return ROLE_BADGE_COLORS[role] ?? "bg-slate-100 text-slate-600";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const [scannerActive, setScannerActive] = useState(true);
  const [state, setState] = useState<CheckinState>("scanning");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recentlyCheckedIn, setRecentlyCheckedIn] = useState<
    CheckedInAttendee[]
  >([]);
  const [manualToken, setManualToken] = useState("");
  const [isManualChecking, setIsManualChecking] = useState(false);

  // ── Process a scanned/manual token ─────────────────────────────────────────

  const processToken = useCallback(async (token: string) => {
    setScannerActive(false);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_token: token.trim(), event_day: todayISO() }),
      });

      const data = await res.json();

      if (res.status === 201 && data.success) {
        setSuccessData({
          full_name: data.full_name,
          organization: data.organization,
        });
        setRecentlyCheckedIn((prev) => [
          {
            full_name: data.full_name,
            organization: data.organization,
            checkedInAt: new Date(),
          },
          ...prev.slice(0, 9),
        ]);
        setState("success");
        return;
      }

      if (res.status === 409) {
        setSuccessData({
          full_name: data.full_name,
          organization: data.organization,
        });
        setState("already_checked_in");
        return;
      }

      if (res.status === 404) {
        setState("not_found");
        return;
      }

      if (res.status === 401 || res.status === 403) {
        setErrorMessage("Session expired — please log in again.");
        setState("error");
        return;
      }

      setErrorMessage(data.error ?? "Something went wrong. Please try again.");
      setState("error");
    } catch {
      setErrorMessage("Network error — please check your connection.");
      setState("error");
    }
  }, []);

  // ── QR scanner callback ────────────────────────────────────────────────────

  const handleScan = useCallback(
    (value: string) => {
      if (state !== "scanning") return;
      processToken(value);
    },
    [state, processToken],
  );

  // ── Manual check ──────────────────────────────────────────────────────────

  async function handleManualCheck() {
    if (!manualToken.trim()) return;
    setIsManualChecking(true);
    await processToken(manualToken);
    setIsManualChecking(false);
    setManualToken("");
  }

  // ── Reset back to scanning ─────────────────────────────────────────────────

  function reset() {
    setSuccessData(null);
    setErrorMessage("");
    setState("scanning");
    setScannerActive(true);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* ── SUCCESS STATE ─────────────────────────────────────────────────────── */}
      {state === "success" && successData && (
        <div className="space-y-3">
          {/* Green banner */}
          <div className="rounded-3xl bg-[#1a7a45] text-white px-5 py-4 flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <p className="text-base font-semibold">Checked In Successfully</p>
          </div>

          {/* Attendee card */}
          <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#162E55] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {getInitials(successData.full_name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {successData.full_name}
                </p>
                <p className="text-sm text-slate-500">
                  {successData.organization}
                </p>
              </div>
            </div>
          </div>

          {/* Scan next button */}
          <button
            onClick={reset}
            className="w-full bg-[#162E55] text-white font-medium rounded-2xl py-3 text-sm hover:bg-[#0f2140] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
            </svg>
            Scan Next Attendee
          </button>
        </div>
      )}

      {/* ── ALREADY CHECKED IN ────────────────────────────────────────────────── */}
      {state === "already_checked_in" && successData && (
        <div className="space-y-3">
          <div className="rounded-3xl bg-amber-500 text-white px-5 py-4 flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-semibold">Already Checked In Today</p>
              <p className="text-sm text-white/80">
                {successData.full_name} — {successData.organization}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full bg-[#162E55] text-white font-medium rounded-2xl py-3 text-sm hover:bg-[#0f2140] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── QR NOT RECOGNISED ─────────────────────────────────────────────────── */}
      {state === "not_found" && (
        <div className="space-y-3">
          {/* Red error banner */}
          <div className="rounded-3xl bg-[#c0392b] text-white px-5 py-4 flex items-start gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/70 mb-0.5">
                QR Not Recognised
              </p>
              <p className="text-base font-bold">
                Code is invalid or unregistered
              </p>
            </div>
          </div>

          {/* Possible reasons */}
          <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Possible reasons:
            </p>
            <ul className="space-y-2">
              {[
                "QR code belongs to a different event",
                "Registration was not completed",
                "Code has been altered or corrupted",
                "Attendee registered under a different email",
              ].map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={reset}
            className="w-full bg-[#162E55] text-white font-medium rounded-2xl py-3 text-sm hover:bg-[#0f2140] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4" />
            </svg>
            Try Again
          </button>

          <button
            onClick={reset}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5 py-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Contact Coordination Team
          </button>
        </div>
      )}

      {/* ── GENERIC ERROR ─────────────────────────────────────────────────────── */}
      {state === "error" && (
        <div className="space-y-3">
          <div className="rounded-3xl bg-red-600 text-white px-5 py-4 flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={reset}
            className="w-full bg-[#162E55] text-white font-medium rounded-2xl py-3 text-sm hover:bg-[#0f2140] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── SCANNING STATE ────────────────────────────────────────────────────── */}
      {state === "scanning" && (
        <div className="space-y-4">
          {/* Page header */}
          <div className="mb-1">
            <h1 className="text-xl font-bold text-slate-900">Event Check-In</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Scan an attendee QR code to check them in
            </p>
          </div>

          {/* Camera scanner */}
          <QRScanner onScan={handleScan} isActive={scannerActive} />

          <p className="text-center text-xs text-slate-400">
            Point the QR code at the camera
          </p>

          {/* Recently checked in */}
          {recentlyCheckedIn.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
                Recently Checked In
              </p>
              <div className="rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white divide-y divide-slate-100 overflow-hidden">
                {recentlyCheckedIn.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#162E55] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(a.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {a.full_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {a.organization} · {formatTime(a.checkedInAt)}
                      </p>
                    </div>
                    {a.role && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadgeClass(a.role)}`}
                      >
                        {a.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual entry */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              Manual Code Entry
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualCheck()}
                placeholder="OAK 2026 XXXX-XXXX"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55] placeholder:text-slate-400"
              />
              <button
                onClick={handleManualCheck}
                disabled={isManualChecking || !manualToken.trim()}
                className="bg-[#162E55] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#0f2140] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isManualChecking ? "…" : "Check"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
