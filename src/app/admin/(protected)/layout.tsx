import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/middleware-client";
import { createAdminClient } from "@/lib/supabase/server";
import { ADMIN_GATE_COOKIE } from "@/lib/admin-gate";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import PublicMobileHeader from "@/components/public/PublicMobileHeader";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Auth guard — defence in depth on top of middleware.ts. Nobody reaches the
  // admin shell unless all three hold:
  //   1. valid Supabase session,
  //   2. membership of the `admins` table,
  //   3. the short-lived gate cookie (fresh login within the last 30 min).
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminClient();
  const { data: adminRow } = await adminSupabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const gate = (await cookies()).get(ADMIN_GATE_COOKIE)?.value;

  if (!adminRow || !gate) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Mobile top header — blue bar with logo + event name (lg:hidden) */}
      <PublicMobileHeader admin />

      <div className="flex flex-1">
        <AdminSidebar />

        {/* pb leaves room for the fixed mobile bottom nav (lg:hidden) */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
