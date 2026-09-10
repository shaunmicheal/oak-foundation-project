import type { ReactNode } from 'react'
import PublicSidebar from '@/components/public/PublicSidebar'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <PublicSidebar />

      <main className="flex-1">{children}</main>
    </div>
  )
}