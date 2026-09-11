"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const QRScanner = dynamic(() => import("@/components/checkin/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-4/3 max-h-72 bg-black rounded-2xl flex items-center justify-center">
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

type SuccessData = {
  full_name: string;
  organization: string;
  role?: string | null;
  at?: string;
};

type AttendeeRow = {
  id: string;
  full_name: string;
  organization: string;
  role: string | null;
  qr_token: string;
};

type NextSession = {
  title: string;
  start_time: string;
  location: string | null;
};

type Headcount = {
  checked_in: number;
  total_registered: number;
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

// Display a masked code in the design's "OAK 2026-XXXX-XXXX" style
function maskedToken(token: string) {
  const clean = token.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${clean || "••••"}-XXXX-XXXX`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "12:41 · 9 March 2026" — as shown on the design's success banner
function checkinTimestamp() {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  return `${hhmm} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

const ROLE_DOT_COLORS: Record<string, string> = {
  Partner: "bg-emerald-500",
  "Own Staff": "bg-orange-500",
  "Coordinator Team": "bg-violet-500",
  Presenter: "bg-teal-500",
  Observer: "bg-slate-400",
};

function roleDotClass(role?: string | null) {
  if (!role) return "bg-slate-400";
  return ROLE_DOT_COLORS[role] ?? "bg-slate-400";
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const [scannerActive, setScannerActive] = useState(true);
  const [state, setState] = useState<CheckinState>("scanning");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [manualToken, setManualToken] = useState("");
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [lastToken, setLastToken] = useState("");
  const [simAttendees, setSimAttendees] = useState<AttendeeRow[]>([]);
  const [nextSession, setNextSession] = useState<NextSession | null>(null);
  const [headcount, setHeadcount] = useState<Headcount | null>(null);

  // ── Process a scanned/manual token ─────────────────────────────────────────

  const processToken = useCallback(async (token: string) => {
    setScannerActive(false);
    setLastToken(token.trim());

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
          role: data.role ?? null,
          at: checkinTimestamp(),
        });
        setState("success");
        return;
      }

      if (res.status === 409) {
        setSuccessData({
          full_name: data.full_name,
          organization: data.organization,
          role: data.role ?? null,
          at: checkinTimestamp(),
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

  // ── Load "Simulate or Scan" rows + success-screen context (per design) ──────
  useEffect(() => {
    fetch("/api/admin/attendees")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setSimAttendees((data.attendees ?? []).slice(0, 4));
      })
      .catch(() => {});

    const today = todayISO();

    // Next session today, for the success screen tiles + live status
    const supabase = createClient();
    supabase
      .from("programme_sessions")
      .select("title, start_time, location")
      .eq("event_day", today)
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const now = new Date().toTimeString().slice(0, 5);
        const upcoming = data.find(
          (s: { start_time: string }) => s.start_time.slice(0, 5) >= now,
        );
        setNextSession(upcoming ?? data[0]);
      });

    fetch(`/api/headcount?day=${today}`)
      .then(async (res) => {
        if (!res.ok) return;
        setHeadcount(await res.json());
      })
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* ── SUCCESS STATE ─────────────────────────────────────────────────────── */}
      {state === "success" && successData && (
        <div className="space-y-3">
          {/* Green banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-400 text-white px-5 py-5 flex items-center gap-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-12 w-36 h-36 rounded-full bg-white/15 blur-2xl"
            />
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center relative">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="8 12.5 11 15.5 16 9.5" />
              </svg>
            </div>
            <div className="relative min-w-0">
              <p className="text-2xl font-bold leading-tight font-display">
                Checked In Successfully
              </p>
              <p className="text-sm text-white/85 mt-1 flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {successData.at}
              </p>
            </div>
          </div>

          {/* Attendee card — header, role badge, then session/venue tiles */}
          <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#162E55] text-white flex items-center justify-center text-base font-bold shrink-0">
                {getInitials(successData.full_name)}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900 leading-tight">
                  {successData.full_name}
                </p>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {successData.organization}
                </p>
                {successData.role && (
                  <span className="inline-flex items-center gap-1.5 mt-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${roleDotClass(successData.role)}`}
                    />
                    {successData.role}
                  </span>
                )}
              </div>
            </div>

            {nextSession && (
              <>
                <div className="border-t border-slate-100 my-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3.5">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-1.5">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Next Session
                    </p>
                    <p className="text-base font-bold text-slate-900 leading-snug">
                      {nextSession.title}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3.5">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-1.5">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Venue
                    </p>
                    <p className="text-base font-bold text-slate-900 leading-snug">
                      {nextSession.location ?? "—"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Live event status */}
          {nextSession && headcount && (
            <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Live Event Status
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-base font-bold text-slate-900">
                  {nextSession.title} starting at{" "}
                  {nextSession.start_time.slice(0, 5)}
                </p>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#162E55] transition-all duration-500"
                  style={{
                    width: `${
                      headcount.total_registered > 0
                        ? Math.round(
                            (headcount.checked_in /
                              headcount.total_registered) *
                              100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {headcount.checked_in} of {headcount.total_registered}{" "}
                attendees checked in
                {nextSession.location ? ` · ${nextSession.location}` : ""}
              </p>
            </div>
          )}

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
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="12" x2="17" y2="12" />
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
          <div className="relative overflow-hidden rounded-3xl bg-[#d64541] text-white px-5 py-4 flex items-start gap-3">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-12 w-36 h-36 rounded-full bg-white/15 blur-2xl"
            />
            <div className="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/70 mb-0.5">
                Check-In Failed
              </p>
              <p className="text-base font-bold">QR Not Recognised</p>
              <p className="text-xs text-white/80 mt-0.5">
                Code is invalid or unregistered
              </p>
            </div>
          </div>

          {/* Possible reasons */}
          <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
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
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-slate-800">
                Possible reasons
              </p>
            </div>
            <ul className="space-y-2.5">
              {[
                "QR code belongs to a different event",
                "Registration was not completed",
                "Code has been altered or corrupted",
                "Attendee registered under a different email",
              ].map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <span className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-red-400 bg-white shrink-0" />
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
            className="w-full text-sm font-medium text-slate-600 border border-slate-200 rounded-2xl py-3 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
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
            <h1 className="text-xl font-bold text-slate-900">Event Check-in</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Scan an attendee QR code to check them in
            </p>
          </div>

          {/* Camera scanner */}
          <QRScanner onScan={handleScan} isActive={scannerActive} />

          {/* Simulate or scan (per design) */}
          {simAttendees.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
                Simulate or Scan
              </p>
              <div className="rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white divide-y divide-slate-100 overflow-hidden">
                {simAttendees.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => processToken(a.qr_token)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#162E55] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(a.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {a.full_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        OAK {maskedToken(a.qr_token)}
                      </p>
                    </div>
                    {a.role && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadgeClass(a.role)}`}
                      >
                        {a.role}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual entry */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
              Manual Code Entry
            </p>
            <div className="flex gap-2 rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white p-2.5 shadow-[0_2px_8px_rgba(28,46,90,0.04)]">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualCheck()}
                placeholder="OAK-2026-XXXX-XXXX"
                className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55] placeholder:text-slate-400"
              />
              <button
                onClick={handleManualCheck}
                disabled={isManualChecking || !manualToken.trim()}
                className="bg-[#162E55] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#0f2140] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
