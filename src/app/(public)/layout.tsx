import type { ReactNode } from "react";
import PublicSidebar from "@/components/public/PublicSidebar";
import PublicMobileHeader from "@/components/public/PublicMobileHeader";
import PublicMobileNav from "@/components/public/PublicMobileNav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Mobile top header - blue bar with logo + event name (lg:hidden) */}
      <PublicMobileHeader />

      <div className="flex flex-1">
        <PublicSidebar />

        {/* pb leaves room for the fixed mobile bottom nav (lg:hidden) */}
        <main className="min-w-0 flex-1 overflow-x-hidden pb-16 lg:pb-0">{children}</main>
      </div>

      <PublicMobileNav />
    </div>
  );
}