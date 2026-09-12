"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive, isRegisterFlow } from "./navItems";

export default function PublicMobileNav() {
  const pathname = usePathname();

  // Registration gate: the register page has no navigation at all (per design).
  if (isRegisterFlow(pathname)) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-3 px-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2.5 text-[12px] font-medium transition-colors",
                active ? "text-[#162E55]" : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              <span className="scale-125">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      {/* safe-area padding for phones with home indicators */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}