"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

export default function PublicSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => isNavItemActive(pathname, href);

  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-slate-200 bg-white px-5 py-6">
      <img src="/logo.svg" alt="OAK Foundation" width={85} height={53} className="w-21.25 object-contain mb-1" />
      <p className="font-display text-[10px] font-semibold tracking-wide text-slate-500 uppercase mb-6">
        Partner Convening 2026
      </p>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={[
              "flex items-center gap-2.5 rounded-xl text-sm font-medium px-3.5 py-3 transition-colors",
              isActive(item.href)
                ? "bg-[#162E55] text-white"
                : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700 leading-tight">Harare, Zimbabwe</p>
          <p className="text-[10px] text-slate-400 mt-0.5">© March 2026</p>
        </div>
      </div>
    </aside>
  );
}
