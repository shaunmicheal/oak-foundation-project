import RegistrationForm from '@/components/registration/RegistrationForm'

const EVENT_DETAILS = {
  title: 'Partner Convening 2026',
  location: 'Geneva',
  dates: '9-11 March 2026',
  stats: [
    { value: '110+', label: 'Attendees' },
    { value: '24', label: 'Sessions' },
    { value: '38', label: 'Partners' },
  ],
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <span className="text-sm font-semibold tracking-widest text-[#162E55]">
            OAK
          </span>
        </div>

        <div className="rounded-t-2xl bg-[#162E55] text-white px-6 py-6">
          <h1 className="text-2xl font-bold">{EVENT_DETAILS.title}</h1>
          <p className="text-sm text-white/80 mt-1">
            {EVENT_DETAILS.location} · {EVENT_DETAILS.dates}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white rounded-b-2xl shadow-sm px-4 py-4 -mt-1 border border-slate-100">
          {EVENT_DETAILS.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-[#162E55]">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Registration Form
          </h2>
          <RegistrationForm />
        </div>
      </div>
    </main>
  )
}