"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  event_day: string;
  start_time: string;
  end_time: string | null;
  title: string;
  location: string | null;
  description: string | null;
  sort_order: number;
};

const EVENT_DAYS = [
  { day: "Day 1", date: "2026-03-09", weekday: "MON", short: "Mar 9" },
  { day: "Day 2", date: "2026-03-10", weekday: "TUE", short: "Mar 10" },
  { day: "Day 3", date: "2026-03-11", weekday: "WED", short: "Mar 11" },
];

const CARD_SHADOW =
  "shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)]";
const CARD_BORDER = "border border-[rgba(28,46,90,0.1)]";

function formatTime(t: string) {
  return t.slice(0, 5);
}

function timeRange(start: string, end: string | null) {
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function ProgrammePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDay, setActiveDay] = useState(EVENT_DAYS[0].date);
  const [view, setView] = useState<"schedule" | "details">("schedule");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("programme_sessions")
      .select("*")
      .order("event_day", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) {
          setError(true);
        } else {
          setSessions(data);
        }
        setLoading(false);
      });
  }, []);

  const daySessions = sessions.filter((s) => s.event_day === activeDay);
  const featured = daySessions[0];
  const rest = daySessions.slice(1);

  return (
    <div className="max-w-[480px] mx-auto px-6 py-10">
      {/* ── Heading ── */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Programme</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          OAK Partner Convening 2026
        </p>
      </div>

      {/* ── Schedule / Details toggle ── */}
      <div className="flex justify-end mb-3">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {(["schedule", "details"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                view === v
                  ? "bg-white text-[#162E55] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day tabs ── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {EVENT_DAYS.map((d) => {
          const isActive = activeDay === d.date;
          return (
            <button
              key={d.date}
              onClick={() => setActiveDay(d.date)}
              className={`rounded-2xl py-3 text-center transition-colors ${
                isActive
                  ? `bg-[#162E55] text-white ${CARD_SHADOW}`
                  : `${CARD_BORDER} bg-white text-slate-600 hover:bg-slate-50`
              }`}
            >
              <span
                className={`block text-[10px] font-semibold tracking-widest uppercase ${
                  isActive ? "text-white/60" : "text-slate-400"
                }`}
              >
                {d.weekday}
              </span>
              <span className="block text-sm font-bold mt-0.5">{d.day}</span>
              <span
                className={`block text-[11px] mt-0.5 ${
                  isActive ? "text-white/70" : "text-slate-400"
                }`}
              >
                {d.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          Could not load programme sessions. Please refresh.
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && daySessions.length === 0 && (
        <div className={`rounded-3xl ${CARD_BORDER} bg-white p-8 text-center`}>
          <p className="text-sm text-slate-400">
            No sessions scheduled for this day yet.
          </p>
        </div>
      )}

      {/* ── Featured session ── */}
      {!loading && !error && view === "schedule" && featured && (
        <div
          className={`relative overflow-hidden rounded-3xl bg-[#162E55] text-white p-5 mb-4 ${CARD_SHADOW}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-12 w-36 h-36 rounded-full bg-[#5b7cae]/60 blur-2xl"
          />
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-1.5">
              Featured · {timeRange(featured.start_time, featured.end_time)}
            </p>
            <p className="text-lg font-bold leading-snug">{featured.title}</p>
            {featured.location && (
              <p className="flex items-center gap-1.5 text-xs text-white/70 mt-2">
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
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {featured.location}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Session list ── */}
      {!loading && !error && (
        <div className="space-y-3">
          {(view === "schedule" ? rest : daySessions).map((session) => (
            <div
              key={session.id}
              className={`rounded-2xl ${CARD_BORDER} bg-white p-4 shadow-[0_2px_8px_rgba(28,46,90,0.05)]`}
            >
              <div className="flex items-start gap-3">
                <div className="text-right shrink-0 w-14">
                  <p className="text-xs font-bold text-slate-800 whitespace-nowrap">
                    {formatTime(session.start_time)}
                  </p>
                  {session.end_time && (
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTime(session.end_time)}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {session.title}
                  </p>
                  {session.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                  {session.location && (
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
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
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {session.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}