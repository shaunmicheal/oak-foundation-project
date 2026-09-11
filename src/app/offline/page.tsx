export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-2xl font-semibold text-[#162E55]">
        You are offline
      </p>
      <p className="mt-3 text-sm text-slate-500 max-w-xs">
        Some content may be unavailable. Check your connection and try again -
        pages you have already visited will still load.
      </p>
    </div>
  );
}
