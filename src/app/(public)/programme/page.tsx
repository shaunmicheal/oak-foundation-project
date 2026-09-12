"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  speaker?: string | null;
  category?: string | null;
};

type DocPost = {
  id: string;
  event_day: string;
  notes: string | null;
  photo_urls: string[] | null;
  created_at: string;
  author_name?: string | null;
  author_organization?: string | null;
};

const EVENT_DAYS = [
  { day: "Day 1", date: "2026-03-09", weekday: "MON", short: "9 Mar" },
  { day: "Day 2", date: "2026-03-10", weekday: "TUE", short: "10 Mar" },
  { day: "Day 3", date: "2026-03-11", weekday: "WED", short: "11 Mar" },
];

const CATEGORIES = ["Plenary", "Breakout", "Workshop", "Social"] as const;

const CATEGORY_STYLES: Record<
  string,
  { dot: string; pill: string; text: string }
> = {
  Plenary: {
    dot: "bg-[#162E55]",
    pill: "bg-[#EEF2FA] border-[#D8E0F0]",
    text: "text-[#162E55]",
  },
  Breakout: {
    dot: "bg-[#F59E0B]",
    pill: "bg-[#FEF6E3] border-[#FBE7B4]",
    text: "text-[#B45309]",
  },
  Workshop: {
    dot: "bg-[#8B5CF6]",
    pill: "bg-[#F3EEFE] border-[#E0D4FB]",
    text: "text-[#6D28D9]",
  },
  Social: {
    dot: "bg-[#F97316]",
    pill: "bg-[#FEF0E6] border-[#FBD6BB]",
    text: "text-[#C2410C]",
  },
};

const CARD_BORDER = "border border-[rgba(28,46,90,0.1)]";
const CARD_SHADOW =
  "shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)]";

function formatTime(t: string) {
  return t.slice(0, 5);
}

function timeRange(start: string, end: string | null) {
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

const PinIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="13"
    height="13"
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
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
function CategoryPill({
  category,
  open,
}: {
  category: string;
  open: boolean;
}) {
  const s = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Plenary;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${s.pill} ${s.text}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {category}
      <ChevronIcon open={open} />
    </span>
  );
}

function SessionCard({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const hasDetails = Boolean(session.description);

  return (
    <div className={`rounded-[30px] ${CARD_BORDER} bg-white p-5 ${CARD_SHADOW} lg:rounded-[14px] lg:p-3`}>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className="flex w-full items-start gap-4 text-left"
      >
        <div className="w-[52px] shrink-0 text-left">
          <p className="whitespace-nowrap text-[16px] font-bold leading-5 text-[#101b31] lg:text-[8px] lg:leading-3">
            {formatTime(session.start_time)}
          </p>
          {session.end_time && (
            <p className="text-xs text-slate-400 whitespace-nowrap leading-4 mt-0.5">
              –{formatTime(session.end_time)}
            </p>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[18px] font-bold leading-snug text-[#101b31] lg:text-[9px]">
              {session.title}
            </p>
            {session.category && (
              <div className="shrink-0">
                <CategoryPill category={session.category} open={open} />
              </div>
            )}
          </div>
          {session.speaker && (
            <p className="mt-2 text-[16px] text-[#8793ad] lg:mt-1 lg:text-[7px]">{session.speaker}</p>
          )}
          {session.location && (
            <p className="mt-2 flex items-center gap-1.5 text-[16px] text-[#8793ad] lg:mt-1 lg:text-[7px]">
              <PinIcon />
              {session.location}
            </p>
          )}
        </div>
      </button>
      {hasDetails && open && (
        <p className="text-sm text-slate-600 leading-relaxed mt-3 pl-[68px] pr-2">
          {session.description}
        </p>
      )}
    </div>
  );
}

function BreakRow({ session }: { session: Session }) {
  return (
    <div className="flex items-center gap-4 py-2 lg:gap-2 lg:py-1">
      <span className="w-[52px] shrink-0 text-[16px] font-medium text-[#8793ad] lg:w-[28px] lg:text-[7px]">
        {formatTime(session.start_time)}
      </span>
      <span aria-hidden className="h-px flex-1 bg-slate-200" />
      <span className="px-2 text-center text-[16px] text-[#8793ad] lg:px-1 lg:text-[7px]">
        {session.title}
      </span>
      <span aria-hidden className="h-px flex-1 bg-slate-200" />
      <span className="w-[52px] shrink-0" />
    </div>
  );
}



export default function ProgrammePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [docs, setDocs] = useState<DocPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDay, setActiveDay] = useState(EVENT_DAYS[0].date);
  const [view, setView] = useState<"schedule" | "docs">("schedule");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("programme_sessions")
        .select("*")
        .order("event_day", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("documentation_posts")
        .select("*")
        .order("created_at", { ascending: false }),
    ]).then(([sRes, dRes]) => {
      if (sRes.error || !sRes.data) setError(true);
      else setSessions(sRes.data);
      if (!dRes.error && dRes.data) setDocs(dRes.data);
      setLoading(false);
    });
  }, []);

  const daySessions = sessions.filter((s) => s.event_day === activeDay);
  const isBreak = (s: Session) => !s.category && !s.speaker;
  const featured = daySessions.find((s) => !isBreak(s));
  const rest = daySessions.filter((s) => s !== featured);

  return (
    <div className="mx-auto w-full max-w-[704px] px-[15px] pb-28 pt-[28px] lg:max-w-[396px] lg:px-0 lg:py-8">
      {/* ── Heading ── */}
      <div className="mb-5">
        <h1 className="font-display text-[24px] font-bold leading-none tracking-tight text-[#101b31] lg:text-[16px]">
            Programme
        </h1>
        <p className="mt-2 text-[14px] text-[#8793ad] lg:mt-1 lg:text-[10px]">
            OAK Partner Convening 2026
        </p>
      </div>

      {/* ── Schedule / Docs toggle ── */}
      <div className="mb-5 flex h-[38px] rounded-[9px] bg-[#e5e9f1] p-1 lg:mb-5 lg:h-[28px]">
        {(["schedule", "docs"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-[12px] py-1 text-[12px] font-semibold capitalize transition-all lg:rounded-[7px] lg:py-1 lg:text-[9px] ${
              view === v
                ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(28,46,90,0.12)]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {v === "schedule" ? "Schedule" : "Docs"}
          </button>
        ))}
      </div>

      {view === "docs" ? (
        /* ── Docs view ── */
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-[16px] font-bold text-[#101b31] lg:text-xl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#193562]"><path d="M15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /><path d="M9 3h6v4H9z" /><path d="M8 12h8M8 16h5" /></svg>
              Session Notes
            </h2>
            <Link href="/admin/notes" className="rounded-[11px] bg-[#193562] px-3 py-2 text-[10px] font-semibold text-white shadow-[0_5px_12px_rgba(25,53,98,0.22)] transition hover:bg-[#10284e] lg:px-4 lg:text-xs">
              + Add Note
            </Link>
          </div>
          <div className="space-y-3">
          {docs.length === 0 && !loading && (
            <div
              className={`rounded-3xl ${CARD_BORDER} bg-white p-10 text-center ${CARD_SHADOW}`}
            >
              <p className="text-sm font-semibold text-slate-900">
                Documentation coming soon
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Session notes and photos will be shared here during the event.
              </p>
            </div>
          )}
          {docs.map((d) => {
            const author = d.author_name ?? "OAK Foundation";
            const organization = d.author_organization ?? "Partner Convening 2026";
            const day = EVENT_DAYS.find((eventDay) => eventDay.date === d.event_day)?.day ?? d.event_day;
            return (
            <div
              key={d.id}
              className={`rounded-[24px] ${CARD_BORDER} bg-white p-4 ${CARD_SHADOW} lg:p-5`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#193562] text-[9px] font-bold text-white">{initials(author)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[#101b31]">{author}</p>
                    <p className="truncate text-[9px] text-[#8793ad]">{organization}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#edf1f7] px-2 py-1 text-[9px] text-[#8793ad]">{day} · {noteTime(d.created_at)}</span>
              </div>
              {d.notes && (
                <p className="whitespace-pre-line text-[12px] leading-[1.55] text-[#26344d] lg:text-sm">
                  {d.notes}
                </p>
              )}
              {d.photo_urls && d.photo_urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.photo_urls.map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={u}
                      src={u}
                      alt="Session documentation"
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
            );
          })}
          </div>
        </div>
      ) : (
        <>

          {/* ── Day tabs ── */}
          <div className="mb-7 grid grid-cols-3 gap-2.5 lg:mb-5 lg:gap-2">
            {EVENT_DAYS.map((d) => {
              const isActive = activeDay === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => setActiveDay(d.date)}
                    className={`h-[80px] rounded-[25px] px-3.5 py-3 text-left transition-all lg:h-[60px] lg:rounded-[16px] lg:px-3 lg:py-2 ${
                    isActive
                      ? `bg-[#162E55] text-white ${CARD_SHADOW}`
                      : `${CARD_BORDER} bg-white text-slate-900 hover:bg-slate-50`
                  }`}
                >
                  <p
                    className={`text-[9px] font-semibold tracking-widest uppercase lg:text-[7px] ${
                      isActive ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {d.weekday}
                  </p>
                  <p className="mt-0.5 font-display text-[18px] font-bold leading-none lg:text-[13px]">
                    {d.day}
                  </p>
                  <p
                    className={`mt-1 text-[11px] lg:text-[8px] ${
                      isActive ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {d.short}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div
              className={`rounded-3xl ${CARD_BORDER} bg-white p-10 text-center ${CARD_SHADOW}`}
            >
              <p className="text-sm font-semibold text-slate-900">
                Couldn&apos;t load the programme
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Please refresh the page to try again.
              </p>
            </div>
          )}

          {/* ── Featured session ── */}
          {!loading && !error && featured && (
            <div
              className={`relative mb-4 min-h-[179px] overflow-hidden rounded-[25px] bg-gradient-to-br from-[#13203a] via-[#162e55] to-[#203b6b] p-5 text-white ${CARD_SHADOW} lg:mb-4 lg:min-h-[106px] lg:rounded-[16px] lg:p-3`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-14 w-44 h-44 rounded-full bg-white/10 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white/70 shrink-0"
                  >
                    <path d="M12 2l2.9 6.26 6.6.56-5 4.36 1.5 6.45L12 16.9 5.99 19.63l1.5-6.45-5-4.36 6.6-.56L12 2z" />
                  </svg>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/65 lg:text-[7px]">
                    Featured
                  </p>
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-white/40"
                  />
                  <p className="text-[9px] font-medium text-white/60 lg:text-[7px]">
                    {timeRange(featured.start_time, featured.end_time)}
                  </p>
                </div>
                <p className="mt-5 font-display text-[20px] font-bold leading-[1.3] lg:mt-4 lg:text-[14px] lg:leading-[1.2]">
                  {featured.title}
                </p>
                {featured.speaker && (
                  <p className="flex items-center gap-2.5 mt-4">
                    <span className="h-8 w-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {featured.speaker.charAt(0)}
                    </span>
                    <span className="text-[12px] text-white/65 lg:text-[8px]">
                      {featured.speaker}
                    </span>
                  </p>
                )}
                {featured.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60 lg:mt-2 lg:text-[8px]">
                    <PinIcon className="opacity-70" />
                    {featured.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Category legend ── */}
          {!loading && !error && daySessions.some((s) => s.category) && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-1 lg:mb-4 lg:gap-x-2">
              {CATEGORIES.map((c) => (
                <span
                  key={c}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-[#8793ad] lg:gap-1 lg:text-[7px]"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[c].dot} lg:h-1.5 lg:w-1.5`}
                  />
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* ── Timeline ── */}
          {!loading && !error && (
            <div className="space-y-4">
              {rest.map((session) =>
                isBreak(session) ? (
                  <BreakRow key={session.id} session={session} />
                ) : (
                  <SessionCard key={session.id} session={session} />
                )
              )}
              {rest.length === 0 && featured && (
                <p className="text-sm text-slate-400 text-center py-6">
                  No more sessions scheduled for this day yet.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function noteTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}