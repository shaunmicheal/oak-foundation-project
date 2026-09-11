/**
 * Shared constants for the admin "gate" — the short-lived proof that an admin
 * logged in recently. Pages under /admin (except /admin/login) require BOTH a
 * valid Supabase session for a member of the `admins` table AND this cookie,
 * so a stale session from days ago cannot simply type /admin/dashboard.
 */
export const ADMIN_GATE_COOKIE = "oak_admin_gate";

/** 30 minutes of admin inactivity → back to the login screen. */
export const ADMIN_GATE_MAX_AGE = 60 * 30;
