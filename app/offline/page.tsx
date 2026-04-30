import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
        <h1 className="text-2xl font-extrabold mb-3">You&apos;re offline</h1>
        <p className="text-sm text-slate-300 mb-5">
          Hayyanium couldn&apos;t reach the network. You can still use cached pages and try again once your connection returns.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-400 transition-colors"
          >
            Go Home
          </Link>
          <a
            href="/offline"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Retry
          </a>
        </div>
      </section>
    </main>
  );
}
