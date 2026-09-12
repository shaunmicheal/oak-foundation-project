import RegistrationForm from "@/components/registration/RegistrationForm";

const EVENT_DETAILS = {
  title: "Partner Convening 2026",
  location: "Harare",
  dates: "9-11 March 2026",
};

const STATS = [
  { value: "110+", label: "Attendees", icon: <UsersIcon /> },
  { value: "24", label: "Sessions", icon: <CalendarIcon /> },
  { value: "38", label: "Partners", icon: <LayersIcon /> },
];

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-102.5 px-5 pt-5 pb-12 lg:max-w-152 lg:px-0 lg:py-10">
      {/* ── EVENT HERO ── */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1c3560] via-[#162E55] to-[#101f3d] px-7 py-8 text-white shadow-[0_8px_20px_rgba(22,46,85,0.14)]">
        {/* Soft sheen highlights, as per the design */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-[#4b6ea8]/50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -bottom-24 h-40 w-40 rounded-full bg-[#2c4a80]/40 blur-2xl"
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight">
            Partner
            <br />
            Convening 2026
          </h1>
          <p className="mt-2 text-sm font-medium text-white/75">
            {EVENT_DETAILS.location} · {EVENT_DETAILS.dates}
          </p>
        </div>
      </section>

      {/* ── EVENT STATS ── */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[rgba(28,46,90,0.08)] bg-white p-4 shadow-[0_4px_14px_rgba(28,46,90,0.08)]"
          >
            <div className="text-[#162E55]">{stat.icon}</div>
            <p className="mt-2 text-2xl font-bold leading-none text-[#162E55]">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── FORM CARD ── */}
      <div className="mt-4 w-full rounded-3xl border border-[#1C2E5A1A] bg-white p-5 shadow-[0_4px_16px_#1C2E5A12,0_1px_3px_#1C2E5A0D]">
        <h2 className="text-xl font-semibold text-slate-900">
          Registration Form
        </h2>
        <div className="mt-5">
          <RegistrationForm />
        </div>
      </div>

      {/* ── GDPR NOTE (below the card, as per the design) ── */}
      <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
        Your data is secured and handled by OAK Foundation in accordance with
        GDPR.
      </p>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      width="18"
      height="18"
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
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
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
  );
}

function LayersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
