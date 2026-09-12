import type { ReactNode } from "react";

function RegisterIcon(): ReactNode {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function ProgrammesIcon(): ReactNode {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PartnersIcon(): ReactNode {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Register", href: "/register", icon: <RegisterIcon /> },
  { label: "Programme", href: "/programme", icon: <ProgrammesIcon /> },
  { label: "Partners", href: "/partners", icon: <PartnersIcon /> },
];

/** True while the user is inside the registration gate (register only).
 *  Pass page counts as "already registered" — full navigation is available there. */
export function isRegisterFlow(pathname: string): boolean {
  return pathname.startsWith("/register");
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/register") {
    // /pass/[token] is the final step of the registration flow — per the
    // design the Register item stays highlighted on the success screen.
    return pathname.startsWith("/register") || pathname.startsWith("/pass");
  }
  return pathname.startsWith(href);
}