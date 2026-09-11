"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type AttendeeData = {
  full_name: string;
  organization: string;
  qr_token: string;
  // Returned by /api/attendees/[token] when the backend includes them.
  // Rendered with a fallback until the endpoint exposes role + email.
  role?: string;
  email?: string;
};

type PageState = "loading" | "success" | "not_found" | "error";

export default function PassPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<PageState>(token ? "loading" : "not_found");
  const [retryCount, setRetryCount] = useState(0);
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/attendees/${token}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState("not_found");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = await res.json();
        setAttendee(data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [token, retryCount]);

  function downloadQR() {
    const canvas = document.getElementById(
      "qr-download-canvas",
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `oak-pass-${token.slice(0, 8)}.png`;
    link.href = url;
    link.click();
  }

  const firstName = attendee?.full_name?.split(" ")[0] ?? "";

  /* ── LOADING ── */
  if (state === "loading") {
    return (
      <div className="mx-auto w-full max-w-102.5 px-5 pt-5 pb-12 lg:max-w-152 lg:px-0 lg:py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#162E55] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading your pass…</p>
        </div>
      </div>
    );
  }

  /* ── NOT FOUND ── */
  if (state === "not_found") {
    return (
      <div className="mx-auto w-full max-w-102.5 px-5 pt-5 pb-12 lg:max-w-152 lg:px-0 lg:py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <div className="flex justify-center mb-4 text-slate-400">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Pass Not Found
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            This QR token is not recognised. It may have expired or the link is
            incorrect.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="inline-flex items-center gap-2 bg-[#162E55] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#0f2140] transition-colors"
          >
            Register as an attendee
          </button>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (state === "error") {
    return (
      <div className="mx-auto w-full max-w-102.5 px-5 pt-5 pb-12 lg:max-w-152 lg:px-0 lg:py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-red-600 mb-4">
            Something went wrong loading your pass. Please check your connection
            and try again.
          </p>
          <button
            onClick={() => {
              setState("loading");
              setAttendee(null);
              setRetryCount((c) => c + 1);
            }}
            className="text-sm text-[#162E55] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ── SUCCESS ── */
  return (
    <div className="mx-auto w-full max-w-102.5 px-5 pt-5 pb-12 lg:max-w-152 lg:px-0 lg:py-10">
      {/* ── SUCCESS BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1c3560] via-[#162E55] to-[#101f3d] text-white px-6 py-6 mb-4 shadow-[0_12px_32px_rgba(22,46,85,0.28)]">
        {/* Soft sheen highlights, as per the design */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-[#4b6ea8]/50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-24 h-40 w-40 rounded-full bg-[#2c4a80]/40 blur-2xl"
        />
        <div className="relative flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8.4 12.3 2.5 2.5 4.7-5.3" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/60">
              Registration Complete
            </p>
            <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold leading-[1.15] tracking-tight">
              You&apos;re Registered,
              <br />
              {firstName}!
            </p>
            <p className="mt-2 text-[13px] text-white/70">
              {attendee!.organization}
            </p>
          </div>
        </div>
      </div>

      {/* ── QR PASS CARD ── */}
      <div className="rounded-3xl border border-[#1C2E5A1A] bg-white p-6 mb-4 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D]">
        <p className="text-center text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
          Your Entry Pass
        </p>

        {/* Visible QR (canvas, reused for the PNG download) */}
        <div className="mt-5 flex justify-center">
          <div className="rounded-[20px] bg-slate-100 p-6">
            <QRCodeCanvas
              id="qr-download-canvas"
              value={attendee!.qr_token}
              size={176}
              marginSize={1}
              level="M"
              fgColor="#162E55"
            />
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-xs text-slate-400 tracking-[0.18em]">
          OAK-2026-
          {attendee!.qr_token.replace(/-/g, "").slice(0, 4).toUpperCase() ||
            "••••"}
          -
          {attendee!.qr_token.replace(/-/g, "").slice(4, 8).toUpperCase() ||
            "••••"}
        </p>
        <p className="mt-1.5 text-center text-[13px] text-slate-400">
          Present at event entrance for check-in
        </p>
      </div>

      {/* ── REGISTRATION DETAILS ── */}
      <div className="rounded-3xl border border-[#1C2E5A1A] bg-white p-6 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D]">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
          Registration Details
        </p>
        <dl className="mt-1 divide-y divide-slate-100">
          <DetailRow label="Name" value={attendee!.full_name} />
          <DetailRow label="Organisation" value={attendee!.organization} />
          <DetailRow label="Role" value={attendee!.role ?? "—"} />
          <DetailRow label="Email" value={attendee!.email ?? "—"} />
          <DetailRow label="Event Dates" value="9–11 March 2026" />
          <DetailRow label="Location" value="Harare, Zimbabwe" />
        </dl>
      </div>

      {/* ── DOWNLOAD BUTTON ── */}
      <button
        onClick={downloadQR}
        className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-2xl bg-linear-to-br from-[#1c3560] via-[#162E55] to-[#101f3d] py-4 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(22,46,85,0.3)] transition-opacity hover:opacity-95"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download QR Code
      </button>

      {/* ── REGISTER ANOTHER ── */}
      <p className="mt-5 text-center text-sm text-slate-500">
        <a
          href="/register"
          className="inline-flex items-center gap-2 hover:text-[#162E55] transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Register another attendee
        </a>
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 text-right max-w-[60%]">
        {value}
      </dd>
    </div>
  );
}
