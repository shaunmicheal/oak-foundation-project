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
  { label: "9 Mar", value: "2026-03-09" },
  { label: "10 Mar", value: "2026-03-10" },
  { label: "11 Mar", value: "2026-03-11" },
];

function formatTime(t: string) {
  // HH:MM:SS → HH:MM
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
  const [activeDay, setActiveDay] = useState(EVENT_DAYS[0].value);

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

  const daySession = sessions.filter((s) => s.event_day === activeDay);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Programme</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Partner Convening 2026 · 9–11 March
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
        {EVENT_DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => setActiveDay(day.value)}
            className={[
              "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
              activeDay === day.value
                ? "bg-white text-[#162E55] shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          Could not load programme sessions. Please refresh.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && daySession.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-400">
            No sessions scheduled for this day yet.
          </p>
        </div>
      )}

      {/* Session list */}
      {!loading && !error && daySession.length > 0 && (
        <div className="space-y-3">
          {daySession.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_2px_8px_rgba(28,46,90,0.05)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {session.title}
                  </p>
                  {session.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-[#162E55] whitespace-nowrap">
                    {timeRange(session.start_time, session.end_time)}
                  </p>
                  {session.location && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {session.location}
                    </p>
                  )}
                </div>
              </div>

              {session.location && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400"
                  >
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-[11px] text-slate-400">
                    {session.location}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
