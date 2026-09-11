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

const CARD_SHADOW =
  "shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)]";
const CARD_BORDER = "border border-[rgba(28,46,90,0.1)]";

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

  const filtered = search.trim()
    ? partners.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : partners;

  const topLevel = filtered.filter((p) => !p.parent_partner_id);
  const subPartners = filtered.filter((p) => !!p.parent_partner_id);

  // ── Detail view (per the design) ──
  if (selected) {
    return <PartnerDetail partner={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="mx-auto w-full max-w-152 px-5 py-8 lg:px-0 lg:py-10">
      {/* ── Heading ── */}
      <div className="mb-5">
        <h1 className="font-display text-3xl lg:text-[32px] font-bold text-[#162E55] tracking-tight">
          Partner Directory
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {partners.length} partners · Partner Convening 2026
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
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
          placeholder="Search organisations, focus areas…"
          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55] placeholder:text-slate-400"
        />
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
          Could not load partners. Please refresh.
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm text-slate-400">
            {search
              ? "No partners match your search."
              : "No partners have been added yet."}
          </p>
        </div>
      )}

      {/* ── Top partners (logo grid) ── */}
      {!loading && !error && topLevel.length > 0 && (() => {
        const topPartners = topLevel.slice(0, 3);
        return (
          <div className="mb-8 grid grid-cols-3 gap-2.5">
            {topPartners.map((partner) => (
              <div
                key={partner.id}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-[rgba(28,46,90,0.08)] bg-white p-3 text-center shadow-[0_2px_8px_rgba(28,46,90,0.04)] transition hover:border-[#162E55]/30 hover:shadow-[0_6px_18px_rgba(28,46,90,0.1)]"
                onClick={() => setSelected(partner)}
              >
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-10 h-10 object-contain rounded-lg bg-slate-50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#162E55] text-white font-bold flex items-center justify-center text-xs">
                    {getInitials(partner.name)}
                  </div>
                )}
                <p className="text-xs font-medium text-slate-700 leading-snug">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── All partners ── */}
      {!loading && !error && topLevel.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
            All Partners
          </p>
          <div className="space-y-3">
            {topLevel.map((partner) => {
              const children = subPartners.filter(
                (p) => p.parent_partner_id === partner.id,
              );
              return (
                <div key={partner.id}>
                  <PartnerRow
                    partner={partner}
                    onOpen={() => setSelected(partner)}
                  />
                  {children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-100 pl-4">
                      {children.map((child) => (
                        <PartnerRow
                          key={child.id}
                          partner={child}
                          isChild
                          onOpen={() => setSelected(child)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PartnerRow({
  partner,
  isChild,
  onOpen,
}: {
  partner: Partner;
  isChild?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl ${CARD_BORDER} bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(28,46,90,0.04)] transition hover:border-[#162E55]/30 hover:shadow-[0_6px_18px_rgba(28,46,90,0.1)] ${
        isChild ? "py-2.5" : ""
      }`}
    >
      {partner.logo_url ? (
        <img
          src={partner.logo_url}
          alt={partner.name}
          className={`object-contain rounded-lg bg-slate-50 shrink-0 ${
            isChild ? "w-8 h-8" : "w-10 h-10"
          }`}
        />
      ) : (
        <div
          className={`rounded-lg bg-[#162E55] text-white font-bold flex items-center justify-center shrink-0 ${
            isChild ? "w-8 h-8 text-[10px]" : "w-10 h-10 text-xs"
          }`}
        >
          {getInitials(partner.name)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {partner.name}
        </p>
      </div>

      <svg
        aria-hidden
        className="shrink-0 text-slate-300"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
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