"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <section className="py-32 px-8 text-center">
      <div className="max-w-[600px] mx-auto">
        <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl font-bold mb-4">Welcome to UNYKORN // LAW</h1>
        <p className="font-serif text-lg text-[var(--text-muted)] mb-2">
          Your subscription is active. All 350 AI agents are now at your service.
        </p>
        <p className="font-mono text-xs text-[var(--text-muted)] mb-8">
          {sessionId ? `Session: ${sessionId.slice(0, 20)}...` : "Payment confirmed"}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ops" className="font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] transition-colors no-underline">
            Go to Operations
          </Link>
          <Link href="/intake" className="font-serif text-sm font-semibold tracking-wider px-6 py-3 rounded-sm border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-colors no-underline">
            Submit a Case
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[72px]">
        <Suspense fallback={
          <section className="py-32 px-8 text-center">
            <p className="font-serif text-lg text-[var(--text-muted)]">Loading...</p>
          </section>
        }>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
