export default function PublicMobileHeader({ admin = false }: { admin?: boolean }) {
  return (
    <header className={`flex shrink-0 items-center bg-[#193562] px-[15px] lg:hidden ${admin ? "h-[156px] px-8" : "h-[70px]"}`}>
      <div className={`mx-auto flex w-full items-center gap-3 lg:gap-4 ${admin ? "max-w-[540px]" : "max-w-[704px]"}`}>
        <img
          src="/logo-white.png"
          alt="OAK Foundation"
          className={`w-auto ${admin ? "h-8" : "h-7"}`}
        />
        <span aria-hidden className={`w-px bg-white/30 ${admin ? "h-7" : "h-6"}`} />
        <p className={`font-display font-semibold uppercase text-white/75 ${admin ? "text-[14px] tracking-[0.11em]" : "text-[12px] tracking-[0.1em]"}`}>
          Partner Convening 2026
        </p>
      </div>
    </header>
  );
}
