"use client";

import { useEffect, useState } from "react";

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
  const [activeDay] = useState(EVENT_DAYS[0].value);
  // Headcount is cached per day; "loading" is derived from whether the
  // selected day has finished loading (keeps setState out of effect bodies).
  const [headcountByDay, setHeadcountByDay] = useState<
    Record<string, Headcount>
  >({});
  const [headcountFailedDays, setHeadcountFailedDays] = useState<
    Record<string, true>
  >({});
  const headcount = headcountByDay[activeDay] ?? null;
  const headcountLoading =
    !(activeDay in headcountByDay) && !(activeDay in headcountFailedDays);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesError, setAttendeesError] = useState(false);
  const [attendeesLoadedKey, setAttendeesLoadedKey] = useState<string | null>(
    null,
  );
  const [attendeesRetry, setAttendeesRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const attendeesLoading = attendeesLoadedKey !== debouncedSearch;

  // Fetch headcount when day changes
  useEffect(() => {
    fetch(`/api/headcount?day=${activeDay}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setHeadcountByDay((prev) => ({ ...prev, [activeDay]: data }));
      })
      .catch(() =>
        setHeadcountFailedDays((prev) => ({ ...prev, [activeDay]: true })),
      );
  }, [activeDay]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch attendees whenever the debounced search changes (or on retry)
  useEffect(() => {
    const qs = debouncedSearch
      ? `?search=${encodeURIComponent(debouncedSearch)}`
      : "";
    fetch(`/api/admin/attendees${qs}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAttendees(data.attendees ?? []);
        setAttendeesError(false);
        setAttendeesLoadedKey(debouncedSearch);
      })
      .catch(() => {
        setAttendeesError(true);
        setAttendeesLoadedKey(debouncedSearch);
      });
  }, [debouncedSearch, attendeesRetry]);

  return (
    <div className="mx-auto w-full max-w-[704px] space-y-8 px-8 pb-28 pt-12 lg:max-w-[608px] lg:space-y-3 lg:px-0 lg:py-9">
      <div>
        <h1 className="font-display text-[32px] font-bold leading-none text-[#101b31] lg:text-[20px]">Attendance</h1>
        <p className="mt-3 text-[18px] text-[#74819e] lg:mt-1 lg:text-[12px]">
          Check-in tracking · 9–11 March 2026
        </p>
      </div>

      {/* ── Empty state (no check-ins yet) ── */}
      {!headcountLoading && headcount && headcount.checked_in === 0 && (
        <div className="rounded-[26px] border border-[rgba(28,46,90,0.08)] bg-white px-5 py-12 text-center shadow-[0_5px_18px_rgba(28,46,90,0.09)] lg:min-h-[270px] lg:rounded-[22px] lg:px-8 lg:py-8">
          <div className="flex justify-center mb-3">
            <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[42px] bg-[#edf1f7] text-[#9eb7d1] lg:h-16 lg:w-16 lg:rounded-[20px]">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p className="mt-7 font-display text-[22px] font-bold text-[#101b31] lg:mt-4 lg:text-[16px]">
            No check-ins yet
          </p>
          <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-relaxed text-[#74819e] lg:mt-1 lg:text-[12px]">
            Attendees will appear here once they have been scanned at the event
            entrance.
          </p>
          <a
            href="/admin/checkin"
            className="mt-7 inline-flex items-center gap-3 rounded-[22px] bg-[#193562] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(25,53,98,0.22)] transition-colors hover:bg-[#10284e] lg:mt-4 lg:rounded-[14px] lg:px-5 lg:py-2.5 lg:text-[12px]"
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
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Go to Check-in Scanner
          </a>
        </div>
      )}

      {/* ── Event overview ── */}
      <div className="rounded-[26px] border border-[rgba(28,46,90,0.08)] bg-white p-5 shadow-[0_5px_18px_rgba(28,46,90,0.08)] lg:min-h-[116px] lg:rounded-[22px] lg:p-4">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74819e] lg:mb-2 lg:text-[8px]">
          Event Overview
        </p>
        {headcountLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
          </div>
        ) : headcount ? (
          <div className="grid grid-cols-3 gap-2.5 lg:gap-3">
            <div className="rounded-[18px] bg-[#edf1f7] px-2 py-4 text-center lg:rounded-[14px] lg:p-2">
              <p className="text-[24px] font-bold text-[#101b31] lg:text-[20px]">
                {headcount.total_registered}
              </p>
              <p className="mt-1 text-[12px] text-[#74819e] lg:text-[9px]">Expected</p>
            </div>
            <div className="rounded-[18px] bg-[#edf1f7] px-2 py-4 text-center lg:rounded-[14px] lg:p-2">
              <p className="text-[24px] font-bold text-[#193562] lg:text-[20px]">
                {headcount.checked_in}
              </p>
              <p className="mt-1 text-[12px] text-[#74819e] lg:text-[9px]">Checked In</p>
            </div>
            <div className="rounded-[18px] bg-[#edf1f7] px-2 py-4 text-center lg:rounded-[14px] lg:p-2">
              <p className="text-[24px] font-bold text-[#74819e] lg:text-[20px]">
                {Math.max(headcount.total_registered - headcount.checked_in, 0)}
              </p>
              <p className="mt-1 text-[12px] text-[#74819e] lg:text-[9px]">Pending</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-2">Headcount unavailable.</p>
        )}
      </div>

      {/* ── Attendee list ── */}
      {(attendees.length > 0 || attendeesError || debouncedSearch) && <div>
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
              onClick={() => {
                setAttendeesLoadedKey(null);
                setAttendeesRetry((c) => c + 1);
              }}
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
      </div>}
    </div>
  );
}
