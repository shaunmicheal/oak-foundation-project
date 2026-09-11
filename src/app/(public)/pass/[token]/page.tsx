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
      <div className="max-w-120 mx-auto px-6 py-10">
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
      <div className="max-w-120 mx-auto px-6 py-10">
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
      <div className="max-w-120 mx-auto px-6 py-10">
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
    <div className="max-w-120 mx-auto px-6 py-10">
      {/* ── SUCCESS BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#162E55] text-white px-5 py-4 flex items-start gap-4 mb-3 shadow-[0_4px_16px_rgba(22,46,85,0.18)]">
        {/* Soft radial highlight, as per the design */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-12 w-36 h-36 rounded-full bg-[#5b7cae]/60 blur-2xl"
        />
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="7 12.5 10.5 16 17 8.5" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-1">
            Registration Complete
          </p>
          <p className="text-2xl font-bold leading-tight font-display">
            You&apos;re Registered,
            <br />
            {firstName}!
          </p>
          <p className="text-xs text-white/70 mt-1">
            {attendee!.organization}
          </p>
        </div>
      </div>

      {/* ── QR PASS CARD ── */}
      <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)] p-5 mb-3">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-4 text-center">
          Your Entry Pass
        </p>

        {/* Visible QR (SVG-style canvas for crisp display) */}
        <div className="flex justify-center mb-3">
          <div className="rounded-2xl border border-[rgba(28,46,90,0.1)] p-3 bg-white">
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

        <p className="text-center font-mono text-[11px] text-slate-400 tracking-[0.18em] mb-1">
          OAK-2026-
          {attendee!.qr_token.replace(/-/g, "").slice(0, 4).toUpperCase() ||
            "••••"}
          -
          {attendee!.qr_token.replace(/-/g, "").slice(4, 8).toUpperCase() ||
            "••••"}
        </p>
        <p className="text-center text-xs text-slate-400">
          Present at event entrance for check-in
        </p>
      </div>

      {/* ── REGISTRATION DETAILS ── */}
      <div className="rounded-3xl border border-[rgba(28,46,90,0.1)] bg-white shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)] p-5 mb-4">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-3">
          Registration Details
        </p>
        <dl className="divide-y divide-slate-100">
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
        className="w-full flex items-center justify-center gap-2 bg-[#162E55] text-white font-medium rounded-2xl py-3 text-sm shadow-[0_6px_16px_rgba(22,46,85,0.25)] hover:bg-[#0f2140] transition-colors mb-3"
      >
        <svg
          width="16"
          height="16"
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
      <p className="text-center text-xs text-slate-400">
        <a
          href="/register"
          className="inline-flex items-center gap-1.5 hover:text-[#162E55] transition-colors"
        >
          <svg
            width="12"
            height="12"
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
    <div className="flex justify-between py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-800 text-right max-w-[60%]">
        {value}
      </dd>
    </div>
  );
}
