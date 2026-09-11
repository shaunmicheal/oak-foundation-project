"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Mint the short-lived admin gate. The server verifies this account is
    // actually in the `admins` table — anyone else is signed straight back out.
    const session = await fetch("/api/admin/session", { method: "POST" });

    if (!session.ok) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    // Return to the admin page the user originally asked for, if any
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(
      next && next.startsWith("/admin/") ? next : "/admin/dashboard",
    );
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.svg"
            alt="OAK Foundation"
            width={80}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_24px_rgba(28,46,90,0.08)] p-7">
          <h1 className="text-lg font-bold text-slate-900 mb-0.5">
            Admin Sign In
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Partner Convening 2026 — coordination team only
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oak.foundation"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#162E55] text-white font-medium rounded-lg py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#0f2140] transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Attendee?{" "}
          <a href="/register" className="text-[#162E55] hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
