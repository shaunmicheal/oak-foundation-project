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

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Partner Directory</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {partners.length} partners · Partner Convening 2026
        </p>
      </div>

      {/* Search */}
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
          placeholder="Search partners…"
          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55] placeholder:text-slate-400"
        />
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
          Could not load partners. Please refresh.
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-400">
            {search
              ? "No partners match your search."
              : "No partners have been added yet."}
          </p>
        </div>
      )}

      {/* Partner grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {topLevel.map((partner) => {
            const children = subPartners.filter(
              (p) => p.parent_partner_id === partner.id,
            );
            return (
              <div key={partner.id}>
                <PartnerCard partner={partner} />
                {children.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-100 pl-4">
                    {children.map((child) => (
                      <PartnerCard key={child.id} partner={child} isChild />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PartnerCard({
  partner,
  isChild,
}: {
  partner: Partner;
  isChild?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border border-[rgba(28,46,90,0.1)] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(28,46,90,0.04)]",
        isChild ? "py-2.5" : "",
      ].join(" ")}
    >
      {/* Logo or initials */}
      {partner.logo_url ? (
        <img
          src={partner.logo_url}
          alt={partner.name}
          className={`object-contain rounded-lg bg-slate-50 ${isChild ? "w-8 h-8" : "w-10 h-10"}`}
        />
      ) : (
        <div
          className={`rounded-lg bg-[#162E55]/10 text-[#162E55] font-bold flex items-center justify-center shrink-0 ${isChild ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"}`}
        >
          {getInitials(partner.name)}
        </div>
      )}

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-slate-800 truncate ${isChild ? "text-sm" : "text-sm"}`}
        >
          {partner.name}
        </p>
      </div>

      {/* Website link */}
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
