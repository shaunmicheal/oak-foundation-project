"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function RegisterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function ProgrammesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PartnersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

const REGISTER_ITEM = {
  label: "Register",
  href: "/register",
  icon: <RegisterIcon />,
};

const PROGRAMMES_ITEM = {
  label: "Programmes",
  href: "/programme",
  icon: <ProgrammesIcon />,
};

const PARTNERS_ITEM = {
  label: "Partners",
  href: "/partners",
  icon: <PartnersIcon />,
};

export default function PublicSidebar() {
  const pathname = usePathname();

  // Programmes & Partners only appear once this browser has a completed
  // registration — the flag is written by the registration form on success
  // (and by the pass page when loading a valid pass link).
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        setIsRegistered(!!localStorage.getItem("oak_registered"));
      } catch {
        setIsRegistered(false);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("oak:registered", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("oak:registered", sync);
    };
  }, []);

  function isActive(href: string) {
    if (href === "/register") {
      // The pass page is the final step of the registration flow
      return pathname.startsWith("/register") || pathname.startsWith("/pass");
    }
    return pathname.startsWith(href);
  }

  const NAV_ITEMS = [
    REGISTER_ITEM,
    ...(isRegistered ? [PROGRAMMES_ITEM, PARTNERS_ITEM] : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-slate-200 bg-white px-5 py-6">
      <img src="/logo.svg" alt="OAK Foundation" width={85} height={53} className="w-[85px] object-contain mb-1" />
      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase mb-6">
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