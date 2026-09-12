"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  parent_partner_id: string | null;
  sort_order: number;
  // Detail columns (migration 004 — may be absent until applied)
  category?: string | null;
  partner_since?: number | null;
  description?: string | null;
  focus_areas?: string[] | null;
  contact_name?: string | null;
  contact_email?: string | null;
};

const REGIONS = [
  "All Regions",
  "Global",
  "Sub-Saharan Africa",
  "Northern Europe",
  "Middle East & North Africa",
  "Western Europe",
  "Europe",
];

const REGION_BY_PARTNER: Record<string, string> = {
  "Open Society Foundations": "Global",
  "Africa Climate Alliance": "Sub-Saharan Africa",
  "Nordic Evaluation Centre": "Northern Europe",
  "MENA Rights Group": "Middle East & North Africa",
  "Digital Frontiers Institute": "Global / East Africa",
  "Global Advocacy Lab": "Global",
  "Sciences Po Paris": "Western Europe",
  "Environmental Funders Group": "Europe",
};

const TAG_TONES = [
  "bg-[#eef2f8] text-[#74819e]",
  "bg-[#e9faf3] text-[#276c58]",
  "bg-[#fff6e8] text-[#7a5b2b]",
  "bg-[#f7effd] text-[#67467d]",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [selected, setSelected] = useState<Partner | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) {
          setError(true);
        } else {
          setPartners(data);
        }
        setLoading(false);
      });
  }, []);

  const filtered = partners.filter((partner) => {
    const searchText = [
      partner.name,
      partner.category,
      ...(partner.focus_areas ?? []),
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !search.trim() || searchText.includes(search.trim().toLowerCase());
    const partnerRegion = REGION_BY_PARTNER[partner.name] ?? "Global";
    const matchesRegion =
      region === "All Regions" || partnerRegion.includes(region);
    return matchesSearch && matchesRegion;
  });

  const topLevel = filtered.filter((p) => !p.parent_partner_id);
  const subPartners = filtered.filter((p) => !!p.parent_partner_id);

  // ── Detail view (per the design) ──
  if (selected) {
    return <PartnerDetail partner={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="mx-auto w-full max-w-[704px] px-[18px] pb-28 pt-7 lg:max-w-[920px] lg:px-0 lg:py-10">
      <h1 className="mb-6 font-display text-[25px] font-bold leading-tight tracking-tight text-[#101b31] lg:text-[32px]">Partner Directory</h1>

      <div className="mb-5 overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_4px_16px_rgba(28,46,90,0.08)] lg:p-5">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#74819e]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organisations, focus areas…" className="h-14 w-full rounded-[16px] bg-[#edf1f7] pl-12 pr-4 text-[16px] text-[#101b31] outline-none placeholder:text-[#8793ad] focus:ring-2 focus:ring-[#193562]/20" />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {REGIONS.map((item) => <button key={item} type="button" onClick={() => setRegion(item)} className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition ${region === item ? "bg-[#193562] text-white" : "bg-[#edf1f7] text-[#74819e] hover:bg-[#e2e8f1]"}`}>{item}</button>)}
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#162E55] border-t-transparent" /></div>}
      {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">Could not load partners. Please refresh.</div>}
      {!loading && !error && filtered.length === 0 && <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center"><p className="text-sm text-slate-400">{search ? "No partners match your search." : "No partners have been added yet."}</p></div>}

      {!loading && !error && topLevel.length > 0 && <div className="mb-7"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">Sub-partners</p><div className="grid grid-cols-3 gap-3">{topLevel.slice(0, 3).map((partner) => <button key={partner.id} type="button" onClick={() => setSelected(partner)} className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[rgba(28,46,90,0.06)] bg-white px-2 py-4 text-center shadow-[0_3px_12px_rgba(28,46,90,0.08)]"><div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#193562] text-xs font-bold text-white">{getInitials(partner.name)}</div><p className="text-[13px] font-medium leading-snug text-[#101b31]">{getInitials(partner.name)}</p><p className="text-[11px] text-[#8793ad]">{REGION_BY_PARTNER[partner.name] ?? "Global"}</p></button>)}</div></div>}

      {!loading && !error && topLevel.length > 0 && <div><p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74819e]">All Partners</p><div className="space-y-4">{topLevel.map((partner) => <PartnerRow key={partner.id} partner={partner} onOpen={() => setSelected(partner)} />)}</div></div>}
    </div>
  );
}

function PartnerRow({
  partner,
  onOpen,
}: {
  partner: Partner;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[24px] border border-[rgba(28,46,90,0.06)] bg-white px-4 py-4 text-left shadow-[0_3px_12px_rgba(28,46,90,0.08)] transition hover:border-[#193562]/30"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#193562] text-xs font-bold text-white">
          {getInitials(partner.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="truncate text-[15px] font-semibold text-[#101b31]">{partner.name}</p>
              <p className="mt-1 text-[13px] text-[#8793ad]">{REGION_BY_PARTNER[partner.name] ?? "Global"}</p>
            </div>
            <svg aria-hidden className="mt-1 shrink-0 text-[#74819e]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[partner.category ?? "Partner", ...(partner.focus_areas ?? [])].slice(0, 3).map((tag, index) => <span key={tag} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${TAG_TONES[index % TAG_TONES.length]}`}>{tag}</span>)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#e4e8ef] pt-3 text-[12px] text-[#8793ad]">
        <span>Partner since {partner.partner_since ?? "2020"}</span>
        {partner.website_url && <span className="max-w-[55%] truncate font-semibold text-[#193562]">{partner.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}&nbsp; ↗</span>}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   Partner detail view — hero, about, contact, actions
   ══════════════════════════════════════════════════════════════ */

function PartnerDetail({
  partner,
  onBack,
}: {
  partner: Partner;
  onBack: () => void;
}) {
  const category = partner.category ?? "Partner";
  const tags = partner.focus_areas ?? [];

  return (
    <div className="mx-auto w-full max-w-152 px-5 py-8 lg:px-0 lg:py-10">
      {/* ── Back heading ── */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex cursor-pointer items-center gap-2 text-left"
      >
        <svg
          aria-hidden
          className="text-[#162E55]"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-[#162E55] tracking-tight">
          Partner Directory
        </h1>
      </button>

      {/* ── Hero card ── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#162E55] p-6 text-white shadow-[0_12px_32px_rgba(22,46,85,0.28)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-24 h-56 w-56 rounded-full bg-white/5"
        />
        <div className="relative flex items-center gap-5">
          {partner.logo_url ? (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-lg font-bold tracking-wide">
              {getInitials(partner.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {category}
              {partner.partner_since
                ? ` · Partner since ${partner.partner_since}`
                : ""}
            </p>
            <h2 className="font-display mt-1 text-2xl lg:text-[28px] font-bold leading-tight">
              {partner.name}
            </h2>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── About ── */}
      {partner.description && (
        <section className="mt-4 rounded-3xl border border-[#1C2E5A1A] bg-white p-6 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            About
          </p>
          <p className="mt-3 leading-relaxed text-slate-600">
            {partner.description}
          </p>
        </section>
      )}

      {/* ── Contact ── */}
      {partner.contact_name && (
        <section className="mt-4 rounded-3xl border border-[#1C2E5A1A] bg-white p-6 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Contact at Convening
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#162E55] text-sm font-bold text-white">
              {getInitials(partner.contact_name)}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                {partner.contact_name}
              </p>
              {partner.contact_email && (
                <a
                  href={`mailto:${partner.contact_email}`}
                  className="text-sm text-slate-500 hover:text-[#162E55]"
                >
                  {partner.contact_email}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Visit Website ── */}
      {partner.website_url && (
        <a
          href={partner.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-between rounded-3xl bg-[#162E55] px-6 py-4.5 text-white shadow-[0_10px_24px_rgba(22,46,85,0.22)] transition hover:bg-[#1d3a6b]"
        >
          <span className="flex items-center gap-3">
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="font-display text-base font-semibold">
              Visit Website
            </span>
          </span>
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}

      {/* ── Send Message ── */}
      <a
        href={
          partner.contact_email ? `mailto:${partner.contact_email}` : undefined
        }
        aria-disabled={!partner.contact_email}
        className={`mt-3 flex w-full items-center justify-between rounded-3xl border border-[#1C2E5A1A] bg-white px-6 py-4.5 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D] transition ${
          partner.contact_email
            ? "hover:border-[#162E55]/30"
            : "pointer-events-none opacity-50"
        }`}
      >
        <span className="flex items-center gap-3">
          <svg
            aria-hidden
            className="text-[#162E55]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="font-display text-base font-semibold text-slate-900">
            Send Message
          </span>
        </span>
        <svg
          aria-hidden
          className="text-slate-400"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </div>
  );
}