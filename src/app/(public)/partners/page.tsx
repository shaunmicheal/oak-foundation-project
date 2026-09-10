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

  // Separate top-level partners from sub-partners
  const topLevel = filtered.filter((p) => !p.parent_partner_id);
  const subPartners = filtered.filter((p) => !!p.parent_partner_id);
  const topPartners = topLevel.slice(0, 3);

  return (
    <div className="max-w-[480px] mx-auto px-6 py-10">
      {/* ── Heading ── */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Partner Directory</h1>
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

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className={`rounded-3xl ${CARD_BORDER} bg-white p-8 text-center`}>
          <p className="text-sm text-slate-400">
            {search
              ? "No partners match your search."
              : "No partners have been added yet."}
          </p>
        </div>
      )}

      {/* ── Top partners ── */}
      {!loading && !error && !search && topPartners.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
            Top Partners
          </p>
          <div className="grid grid-cols-3 gap-3">
            {topPartners.map((partner) => (
              <div
                key={partner.id}
                className={`rounded-2xl ${CARD_BORDER} bg-white p-4 flex flex-col items-center gap-2 text-center ${CARD_SHADOW}`}
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
        </div>
      )}

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
                  <PartnerRow partner={partner} />
                  {children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-100 pl-4">
                      {children.map((child) => (
                        <PartnerRow key={child.id} partner={child} isChild />
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
}: {
  partner: Partner;
  isChild?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl ${CARD_BORDER} bg-white px-4 py-3 shadow-[0_2px_8px_rgba(28,46,90,0.04)] ${
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

      {partner.website_url && (
        <a
          href={partner.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-slate-400 hover:text-[#162E55] transition-colors"
          aria-label={`Visit ${partner.name} website`}
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
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  );
}