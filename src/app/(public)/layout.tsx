import type { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden lg:flex lg:flex-col w-40 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
        <img
          src="/logo.svg"
          alt="OAK Foundation"
          width={85}
          height={53}
          className="w-21.25 h-13.25 object-contain mb-1"
        />
        <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase mb-6">
          Partner Convening 2026
        </p>

        <nav className="space-y-2">
          <a
            href="/register"
            className="flex items-center gap-2 rounded-lg bg-[#162E55] text-white text-sm font-medium px-3 py-2"
          >
            Register
          </a>
        </nav>

        <div className="mt-auto text-xs text-slate-500 pt-6">
          <p className="font-medium text-slate-700">Harare, Zimbabwe</p>
          <p>9-11 March 2026</p>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}