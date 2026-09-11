export default function PublicMobileHeader() {
  return (
    <header className="lg:hidden bg-[#162E55] px-5 h-[86px] flex items-center shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="/logo-white.png"
          alt="OAK Foundation"
          className="h-9 w-auto"
        />
        <span aria-hidden className="h-7 w-px bg-white/30" />
        <p className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-white">
          Partner Convening 2026
        </p>
      </div>
    </header>
  );
}
