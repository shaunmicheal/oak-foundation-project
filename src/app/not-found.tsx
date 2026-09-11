import Link from "next/link";
import PublicMobileHeader from "@/components/public/PublicMobileHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicMobileHeader />
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <p className="font-display text-2xl font-semibold text-[#162E55]">
          Page not found
        </p>
        <p className="mt-3 text-sm text-slate-500 max-w-xs">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/register"
          className="mt-6 rounded-xl bg-[#162E55] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0f2140]"
        >
          Back to registration
        </Link>
      </main>
    </div>
  );
}