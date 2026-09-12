"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive, isRegisterFlow } from "./navItems";

export default function PublicSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => isNavItemActive(pathname, href);

  // Per the design: inside the registration flow the sidebar shows only Register
  const items = isRegisterFlow(pathname)
    ? NAV_ITEMS.filter((item) => item.href === "/register")
    : NAV_ITEMS;

  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
      <img src="/logo.svg" alt="OAK Foundation" width={85} height={53} className="w-21.25 object-contain mb-1" />
      <p className="font-display text-[10px] font-semibold tracking-wide text-slate-500 uppercase mb-6">
        Partner Convening 2026
      </p>

      <nav className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={[
              "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
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
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700 leading-tight">Harare, Zimbabwe</p>
          <p className="text-[10px] text-slate-400 mt-0.5">9–11 March 2026</p>
        </div>
      </div>
    </aside>
  );
}