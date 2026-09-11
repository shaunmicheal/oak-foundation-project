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
  speaker?: string | null;
  category?: string | null;
};

type DocPost = {
  id: string;
  event_day: string;
  notes: string | null;
  photo_urls: string[] | null;
  created_at: string;
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${s.pill} ${s.text}`}
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
    <div className={`rounded-2xl ${CARD_BORDER} bg-white p-5 ${CARD_SHADOW}`}>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className="flex w-full items-start gap-4 text-left"
      >
        <div className="w-[52px] shrink-0 text-left">
          <p className="text-sm font-bold text-slate-900 whitespace-nowrap leading-5">
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
            <p className="text-[15px] font-bold text-slate-900 leading-snug">
              {session.title}
            </p>
            {session.category && (
              <div className="shrink-0">
                <CategoryPill category={session.category} open={open} />
              </div>
            )}
          </div>
          {session.speaker && (
            <p className="text-sm text-slate-500 mt-1.5">{session.speaker}</p>
          )}
          {session.location && (
            <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
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
    <div className="flex items-center gap-4 py-1.5">
      <span className="w-[52px] shrink-0 text-sm font-medium text-slate-500">
        {formatTime(session.start_time)}
      </span>
      <span aria-hidden className="h-px flex-1 bg-slate-200" />
      <span className="text-sm text-slate-500 text-center px-2">
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
    <div className="max-w-[608px] mx-auto w-full lg:px-0 px-5 py-8 lg:py-10">
      {/* ── Heading ── */}
      <div className="mb-5">
        <h1 className="font-display text-3xl lg:text-[32px] font-bold text-[#162E55] tracking-tight">
          Programme
        </h1>
        <p className="text-[15px] text-slate-500 mt-1">
          OAK Partner Convening 2026
        </p>
      </div>

      {/* ── Schedule / Docs toggle ── */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
        {(["schedule", "docs"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl capitalize transition-all ${
              view === v
                ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(28,46,90,0.12)]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "docs" ? (
        /* ── Docs view ── */
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
          {docs.map((d) => (
            <div
              key={d.id}
              className={`rounded-2xl ${CARD_BORDER} bg-white p-5 ${CARD_SHADOW}`}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
                {EVENT_DAYS.find((e) => e.date === d.event_day)?.day ??
                  d.event_day}
              </p>
              {d.notes && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {d.notes}
                </p>
              )}
              {d.photo_urls && d.photo_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
          ))}
        </div>
      ) : (
        <>

          {/* ── Day tabs ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {EVENT_DAYS.map((d) => {
              const isActive = activeDay === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => setActiveDay(d.date)}
                  className={`rounded-2xl px-4 py-3.5 text-left transition-all ${
                    isActive
                      ? `bg-[#162E55] text-white ${CARD_SHADOW}`
                      : `${CARD_BORDER} bg-white text-slate-900 hover:bg-slate-50`
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold tracking-widest uppercase ${
                      isActive ? "text-white/60" : "text-slate-400"
                    }`}
                  >
                    {d.weekday}
                  </p>
                  <p className="font-display text-xl font-bold mt-0.5">
                    {d.day}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
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
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c3560] via-[#162E55] to-[#101f3d] text-white p-6 mb-4 ${CARD_SHADOW}`}
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
                  <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/70">
                    Featured
                  </p>
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-white/40"
                  />
                  <p className="text-[11px] font-medium text-white/60">
                    {timeRange(featured.start_time, featured.end_time)}
                  </p>
                </div>
                <p className="font-display text-2xl lg:text-[28px] font-bold leading-tight">
                  {featured.title}
                </p>
                {featured.speaker && (
                  <p className="flex items-center gap-2.5 mt-4">
                    <span className="h-8 w-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {featured.speaker.charAt(0)}
                    </span>
                    <span className="text-[15px] text-white/85">
                      {featured.speaker}
                    </span>
                  </p>
                )}
                {featured.location && (
                  <p className="flex items-center gap-1.5 text-sm text-white/60 mt-2">
                    <PinIcon className="opacity-70" />
                    {featured.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Category legend ── */}
          {!loading && !error && daySessions.some((s) => s.category) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 px-1">
              {CATEGORIES.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[c].dot}`}
                  />
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* ── Timeline ── */}
          {!loading && !error && (
            <div className="space-y-3">
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