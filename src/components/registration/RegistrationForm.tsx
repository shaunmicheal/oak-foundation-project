"use client";

import {
  useEffect,
  useRef,
  useState,
  FormEvent,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS = [
  "Partner",
  "OAK Staff",
  "Coordination Team",
  "Presenter",
  "Observer",
];

type FormState = {
  firstName: string;
  lastName: string;
  organization: string;
  subPartner: string;
  role: string;
  email: string;
  phone: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  travelNeeds: string;
  consentGiven: boolean;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  organization: "",
  subPartner: "",
  role: "",
  email: "",
  phone: "",
  dietaryNeeds: "",
  accessibilityNeeds: "",
  travelNeeds: "",
  consentGiven: false,
};

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.organization.trim()) next.organization = "Required";
    if (!form.role) next.role = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.consentGiven) next.consentGiven = "You must agree to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          organization: form.organization.trim(),
          role: form.role,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          dietary_needs: form.dietaryNeeds.trim() || undefined,
          accessibility_needs: form.accessibilityNeeds.trim() || undefined,
          travel_needs: form.travelNeeds.trim() || undefined,
          consent_given: form.consentGiven,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }


      router.push(`/pass/${data.qr_token}`);
    } catch {
      setSubmitError(
        "Network error — please check your connection and try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required error={errors.firstName}>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="Maria"
            className={inputClass(!!errors.firstName)}
          />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Schmidt"
            className={inputClass(!!errors.lastName)}
          />
        </Field>
      </div>

      <Field label="Organisation" required error={errors.organization}>
        <input
          type="text"
          value={form.organization}
          onChange={(e) => updateField("organization", e.target.value)}
          placeholder="Your organisation name"
          className={inputClass(!!errors.organization)}
        />
      </Field>

      <Field label="Sub-Partner / Programme Area">
        <input
          type="text"
          value={form.subPartner}
          onChange={(e) => updateField("subPartner", e.target.value)}
          placeholder="Optional"
          className={inputClass(false)}
        />
      </Field>

      <Field label="Role / Capacity" required error={errors.role}>
        <RoleSelect
          value={form.role}
          hasError={!!errors.role}
          onChange={(role) => updateField("role", role)}
        />
      </Field>

      <Field label="Email Address" required error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@organisation.org"
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Phone Number">
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="+41 xx xxx xx xx"
          className={inputClass(false)}
        />
      </Field>

      <div className="rounded-2xl border border-[rgba(28,46,90,0.06)] bg-[#f4f6fb] p-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">
          Requirements
        </p>
        <div className="space-y-3">
          <Field label="Dietary Requirements">
            <input
              type="text"
              value={form.dietaryNeeds}
              onChange={(e) => updateField("dietaryNeeds", e.target.value)}
              placeholder="e.g., Vegetarian, Halal, Gluten-free"
              className={inputClass(false, "white")}
            />
          </Field>
          <Field label="Accessibility Requirements">
            <input
              type="text"
              value={form.accessibilityNeeds}
              onChange={(e) =>
                updateField("accessibilityNeeds", e.target.value)
              }
              placeholder="e.g., Wheelchair access, hearing loop"
              className={inputClass(false, "white")}
            />
          </Field>
          <Field label="Travel & Accommodation">
            <input
              type="text"
              value={form.travelNeeds}
              onChange={(e) => updateField("travelNeeds", e.target.value)}
              placeholder="e.g., Flight from London, hotel needed"
              className={inputClass(false, "white")}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(e) => updateField("consentGiven", e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 rounded-md accent-[#162E55]"
          />
          <span>
            I agree to OAK Foundation&apos;s{" "}
            <a href="/privacy-policy" className="text-[#162E55] underline">
              privacy policy
            </a>{" "}
            and consent to my registration data being used for event
            coordination.
          </span>
        </label>
        {errors.consentGiven && (
          <p className="text-xs text-red-600 mt-1">{errors.consentGiven}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-3xl bg-[#162E55] py-4 font-display text-base font-bold tracking-wide text-white shadow-[0_10px_24px_rgba(22,46,85,0.22)] transition hover:bg-[#1d3a6b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Registering…" : "Register"}
      </button>

    </form>
  );
}

function inputClass(hasError: boolean, variant: "tinted" | "white" = "tinted") {
  return [
    "w-full rounded-xl border px-4 py-3.5 text-base text-slate-900",
    variant === "white" ? "bg-white" : "bg-[#eef2f8]",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#162E55]/25 focus:border-[#162E55] focus:bg-white",
    hasError ? "border-red-400" : "border-transparent",
  ].join(" ");
}

/** Custom dropdown for Role / Capacity — styled to match the text inputs. */
function RoleSelect({
  value,
  hasError,
  onChange,
}: {
  value: string;
  hasError: boolean;
  onChange: (role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setHighlight(Math.max(0, ROLE_OPTIONS.indexOf(value)));
    setOpen(true);
  }

  function commit(index: number) {
    onChange(ROLE_OPTIONS[index]);
    setOpen(false);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, ROLE_OPTIONS.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            commit(highlight);
          }
        }}
        className={[
          "w-full rounded-xl border bg-[#eef2f8] px-4 py-3.5 text-base flex items-center justify-between gap-2 text-left",
          "focus:outline-none focus:ring-2 focus:ring-[#162E55]/25 focus:border-[#162E55]",
          hasError ? "border-red-400" : "border-transparent",
        ].join(" ")}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || "Select your role"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-[0_8px_24px_rgba(28,46,90,0.12)] max-h-56 overflow-auto"
        >
          {ROLE_OPTIONS.map((role, i) => {
            const selected = value === role;
            const active = i === highlight;
            return (
              <li key={role} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => commit(i)}
                  onMouseEnter={() => setHighlight(i)}
                  className={[
                    "w-full flex items-center px-3 py-2 text-sm text-left transition-colors",
                    active
                      ? "bg-[#162E55] text-white"
                      : selected
                        ? "font-semibold text-[#162E55]"
                        : "text-slate-700",
                  ].join(" ")}
                >
                  {role}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
