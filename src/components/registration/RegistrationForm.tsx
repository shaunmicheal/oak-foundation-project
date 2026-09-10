"use client";

import { useState, FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

const ROLE_OPTIONS = [
  "Partner",
  "Own Staff",
  "Coordinator Team",
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
        <select
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          className={inputClass(!!errors.role)}
        >
          <option value="">Select your role</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
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
          placeholder="+263 xx xxx xxxx"
          className={inputClass(false)}
        />
      </Field>

      <div className="pt-2">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">
          Requirements
        </p>
        <div className="space-y-3">
          <Field label="Dietary Requirements">
            <input
              type="text"
              value={form.dietaryNeeds}
              onChange={(e) => updateField("dietaryNeeds", e.target.value)}
              placeholder="e.g. Vegetarian, Halal, Gluten-free"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Accessibility Requirements">
            <input
              type="text"
              value={form.accessibilityNeeds}
              onChange={(e) =>
                updateField("accessibilityNeeds", e.target.value)
              }
              placeholder="e.g. Wheelchair access, hearing loop"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Travel & Accommodation">
            <input
              type="text"
              value={form.travelNeeds}
              onChange={(e) => updateField("travelNeeds", e.target.value)}
              placeholder="e.g. Flight from London, hotel needed"
              className={inputClass(false)}
            />
          </Field>
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(e) => updateField("consentGiven", e.target.checked)}
            className="mt-0.5"
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
        className="w-full bg-[#162E55] text-white font-medium rounded-lg py-3 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#0f2140] transition-colors"
      >
        {isSubmitting ? "Registering…" : "Register"}
      </button>

      <p className="text-[11px] text-center text-slate-400 pt-1">
        Your data is secured and handled by OAK Foundation in accordance with
        GDPR.
      </p>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-[#162E55]/30 focus:border-[#162E55]",
    hasError ? "border-red-400" : "border-slate-200",
  ].join(" ");
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
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
