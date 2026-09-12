export default function PublicMobileHeader() {
  return (
    <header className="flex h-[70px] shrink-0 items-center bg-[#193562] px-[15px] lg:h-[114px] lg:px-[22px]">
      <div className="mx-auto flex w-full max-w-[704px] items-center gap-3 lg:gap-4">
        <img
          src="/logo-white.png"
          alt="OAK Foundation"
          className="h-7 w-auto lg:h-9"
        />
        <span aria-hidden className="h-6 w-px bg-white/30 lg:h-8" />
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.1em] text-white/75 lg:text-[16px] lg:tracking-[0.12em]">
          Partner Convening 2026
        </p>
      </div>
    </header>
  );
}
