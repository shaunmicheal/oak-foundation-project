"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type AttendeeData = {
  full_name: string;
  organization: string;
  qr_token: string;
};

type PageState = "loading" | "success" | "not_found" | "error";

export default function PassPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<PageState>("loading");
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);

  useEffect(() => {
    if (!token) {
      setState("not_found");
      return;
    }

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
  }, [token]);

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
      <div className="max-w-2xl mx-auto px-8 py-10">
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
      <div className="max-w-2xl mx-auto px-8 py-10">
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
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-red-600 mb-4">
            Something went wrong loading your pass. Please check your connection
            and try again.
          </p>
          <button
            onClick={() => {
              setState("loading");
              setAttendee(null);
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
    <div className="max-w-2xl mx-auto px-8 py-10">
      {/* Mobile logo */}
      <div className="flex justify-center mb-6 lg:hidden">
        <img
          src="/logo.svg"
          alt="OAK Foundation"
          width={85}
          height={53}
          className="object-contain"
        />
      </div>

      {/* ── SUCCESS BANNER ── */}
      <div className="rounded-3xl bg-[#1a7a45] text-white px-5 py-4 flex items-start gap-4 mb-3 shadow-[0_4px_16px_rgba(22,46,85,0.12)]">
        <div className="shrink-0 mt-0.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="rgba(255,255,255,0.15)"
              stroke="white"
            />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/70 mb-0.5">
            Registration Complete
          </p>
          <p className="text-xl font-bold leading-tight">
            You&apos;re Registered, {firstName}!
          </p>
          <p className="text-sm text-white/70 mt-0.5">
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
              size={200}
              marginSize={1}
              level="M"
              fgColor="#162E55"
            />
          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-slate-400 tracking-wider mb-1">
          {attendee!.qr_token.slice(0, 8).toUpperCase()}…
        </p>
        <p className="text-center text-xs text-slate-400">
          Present this code at the venue for check-in
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
          <DetailRow label="Event Dates" value="9–11 March 2026" />
          <DetailRow label="Location" value="Harare, Zimbabwe" />
        </dl>
      </div>

      {/* ── DOWNLOAD BUTTON ── */}
      <button
        onClick={downloadQR}
        className="w-full flex items-center justify-center gap-2 border border-[#162E55] text-[#162E55] font-medium rounded-2xl py-3 text-sm hover:bg-[#162E55]/5 transition-colors mb-3"
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
          className="hover:text-[#162E55] transition-colors underline underline-offset-2"
        >
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
      <dd className="font-medium text-slate-800 text-right max-w-[60%]">
        {value}
      </dd>
    </div>
  );
}
