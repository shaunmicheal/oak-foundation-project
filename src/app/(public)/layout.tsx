import type { ReactNode } from "react";
import PublicSidebar from "@/components/public/PublicSidebar";
import PublicMobileNav from "@/components/public/PublicMobileNav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <PublicSidebar />

      {/* pb leaves room for the fixed mobile bottom nav (lg:hidden) */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      <PublicMobileNav />
    </div>
  );
}
