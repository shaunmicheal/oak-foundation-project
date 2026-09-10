"use client";

import { useEffect, useState, useCallback } from "react";

type Headcount = {
  day: string;
  checked_in: number;
  total_registered: number;
};

type Attendee = {
  id: string;
  full_name: string;
  organization: string;
  role: string | null;
  email: string;
  created_at: string;
};

const EVENT_DAYS = [
  { label: "9 Mar", value: "2026-03-09" },
  { label: "10 Mar", value: "2026-03-10" },
  { label: "11 Mar", value: "2026-03-11" },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  Partner: "bg-blue-100 text-blue-700",
  "Own Staff": "bg-orange-100 text-orange-700",
  "Coordinator Team": "bg-violet-100 text-violet-700",
  Presenter: "bg-teal-100 text-teal-700",
  Observer: "bg-slate-100 text-slate-600",
};

function roleBadge(role: string | null) {
  if (!role) return "bg-slate-100 text-slate-500";
  return ROLE_BADGE_COLORS[role] ?? "bg-slate-100 text-slate-500";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function AttendanceDashboard() {
  const [activeDay, setActiveDay] = useState(EVENT_DAYS[0].value);
  const [headcount, setHeadcount] = useState<Headcount | null>(null);
  const [headcountLoading, setHeadcountLoading] = useState(true);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(true);
  const [attendeesError, setAttendeesError] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch headcount when day changes
  useEffect(() => {
    setHeadcountLoading(true);
    fetch(`/api/headcount?day=${activeDay}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setHeadcount(data);
      })
      .finally(() => setHeadcountLoading(false));
  }, [activeDay]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch attendees
  const fetchAttendees = useCallback(() => {
    setAttendeesLoading(true);
    setAttendeesError(false);
    const qs = debouncedSearch
      ? `?search=${encodeURIComponent(debouncedSearch)}`
      : "";
    fetch(`/api/admin/attendees${qs}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAttendees(data.attendees ?? []);
      })
      .catch(() => setAttendeesError(true))
      .finally(() => setAttendeesLoading(false));
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const pct =
    headcount && headcount.total_registered > 0
      ? Math.round((headcount.checked_in / headcount.total_registered) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Check-in headcount and registered attendees
        </p>
      </div>

      {/* ── Day tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
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

      {/* ── Headcount card ── */}
      <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07)] p-5">
        {headcountLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
          </div>
        ) : headcount ? (
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
              Check-In Headcount
            </p>
            <div className="flex items-end gap-3 mb-3">
              <p className="text-4xl font-bold text-[#162E55]">
                {headcount.checked_in}
              </p>
              <p className="text-base text-slate-400 mb-1">
                / {headcount.total_registered} registered
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#162E55] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {pct}% checked in for this day
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-2">Headcount unavailable.</p>
        )}
      </div>

      {/* ── Attendee list ── */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, org, or email…"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55] placeholder:text-slate-400"
            />
          </div>

          {/* CSV export */}
          <a
            href="/api/admin/attendees/export"
            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-[#162E55] border border-[#162E55] rounded-xl px-3 py-2.5 hover:bg-[#162E55]/5 transition-colors"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </a>
        </div>

        {/* Loading */}
        {attendeesLoading && (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {attendeesError && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
            <span>Could not load attendees.</span>
            <button
              onClick={fetchAttendees}
              className="text-red-600 underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!attendeesLoading && !attendeesError && attendees.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-400">
              {debouncedSearch
                ? "No attendees match your search."
                : "No attendees registered yet."}
            </p>
          </div>
        )}

        {/* Table */}
        {!attendeesLoading && !attendeesError && attendees.length > 0 && (
          <div className="rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_2px_8px_rgba(28,46,90,0.04)] overflow-hidden">
            <div className="divide-y divide-slate-100">
              {attendees.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#162E55]/10 text-[#162E55] flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(a.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {a.full_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {a.organization} · {a.email}
                    </p>
                  </div>
                  {a.role && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadge(a.role)}`}
                    >
                      {a.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}{" "}
                shown
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
