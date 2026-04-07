"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "var(--midnight)" }}>
      <div className="max-w-lg w-full text-center">
        <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">SYSTEM ERROR</p>
        <h1 className="font-serif text-5xl font-bold mb-4">
          SOMETHING<br /><span className="text-[var(--gold)]">BROKE.</span>
        </h1>
        <p className="text-[var(--text-muted)] mb-2 leading-relaxed">
          An unexpected error occurred. Your data is safe — nothing was lost.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-[var(--text-muted)] mb-8">
            Error ref: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--gold)] text-[var(--midnight)] rounded font-serif font-semibold text-sm tracking-wider hover:bg-[var(--gold-light)] transition-colors cursor-pointer"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-[rgba(201,168,76,0.3)] rounded font-serif font-semibold text-sm tracking-wider text-[var(--gold)] hover:bg-[rgba(201,168,76,0.05)] transition-colors no-underline"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
