import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: "var(--midnight)" }}>
      <div className="max-w-lg w-full text-center">
        <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">404 — NOT FOUND</p>
        <h1 className="font-serif text-5xl font-bold mb-4">
          CASE<br /><span className="text-[var(--gold)]">DISMISSED.</span>
        </h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Check the address or return to the command center.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--gold)] text-[var(--midnight)] rounded font-serif font-semibold text-sm tracking-wider hover:bg-[var(--gold-light)] transition-colors no-underline"
          >
            GO HOME
          </Link>
          <Link
            href="/law/cases"
            className="px-6 py-3 border border-[rgba(201,168,76,0.3)] rounded font-serif font-semibold text-sm tracking-wider text-[var(--gold)] hover:bg-[rgba(201,168,76,0.05)] transition-colors no-underline"
          >
            VIEW CASES
          </Link>
        </div>
      </div>
    </div>
  );
}
