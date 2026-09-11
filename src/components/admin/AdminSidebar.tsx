"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  {
    label: "Check In",
    href: "/admin/checkin",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h1v1h-1z M17 14h1v1h-1z M20 14h1v1h-1z M14 17h1v1h-1z M17 17h1v1h-1z M20 17h1v1h-1z M14 20h1v1h-1z M17 20h1v1h-1z M20 20h1v1h-1z" />
      </svg>
    ),
  },
  {
    label: "Programme",
    href: "/admin/programme",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Partners",
    href: "/admin/partners",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/admin/dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    // Clear the short-lived gate, then the Supabase session itself
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-40 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
      <img
        src="/logo.svg"
        alt="OAK Foundation"
        width={85}
        height={53}
        className="w-[85px] object-contain mb-1"
      />
      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase mb-6">
        Partner Convening 2026
      </p>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 rounded-lg text-sm font-medium px-3 py-2 transition-colors",
                isActive
                  ? "bg-[#162E55] text-white"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-700">Harare, Zimbabwe</p>
          <p>9–11 March 2026</p>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-3 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
