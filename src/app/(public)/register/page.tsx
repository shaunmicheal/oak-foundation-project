import RegistrationForm from '@/components/registration/RegistrationForm'

const EVENT_DETAILS = {
  title: 'Partner Convening 2026',
  location: 'Geneva',
  dates: '9–11 March 2026',
}

const STATS = [
  { value: '110+', label: 'Attendees', icon: <UsersIcon /> },
  { value: '24', label: 'Sessions', icon: <CalendarIcon /> },
  { value: '38', label: 'Partners', icon: <PartnersIcon /> },
]

const CARD_SHADOW =
  'shadow-[0_4px_16px_rgba(28,46,90,0.07),0_1px_3px_rgba(28,46,90,0.05)]'
const CARD_BORDER = 'border border-[rgba(28,46,90,0.1)]'

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="flex justify-center mb-6 lg:hidden">
        <img
          src="/logo.svg"
          alt="OAK Foundation"
          width={85}
          height={53}
          className="w-21.25 h-13.25 object-contain"
        />
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl bg-[#162E55] text-white h-41.75 px-6 pt-6 ${CARD_SHADOW}`}
      >
        <h1 className="text-2xl font-bold">{EVENT_DETAILS.title}</h1>
        <p className="text-sm text-white/80 mt-1">
          {EVENT_DETAILS.location} · {EVENT_DETAILS.dates}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-3xl ${CARD_BORDER} bg-white p-4 flex flex-col items-center gap-1.5 text-center`}
          >
            <div className="text-[#162E55]">{stat.icon}</div>
            <p className="text-lg font-bold text-[#162E55]">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`mt-4 rounded-3xl ${CARD_BORDER} bg-white p-5 ${CARD_SHADOW}`}>
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Registration Form
        </h2>
        <RegistrationForm />
      </div>
    </div>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PartnersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}