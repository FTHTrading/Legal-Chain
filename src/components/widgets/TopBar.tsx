'use client';

import Link from 'next/link';
import { Scale } from 'lucide-react';

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-t-0 border-l-0 border-r-0 rounded-none"
      style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/widgets" className="flex items-center gap-2 no-underline">
          <Scale size={18} style={{ color: 'var(--gold)' }} />
          <span className="font-serif text-sm tracking-widest" style={{ color: 'var(--gold)' }}>
            UNYKORN // LAW
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link href="/widgets" className="hover:text-[var(--gold)] transition-colors">Widgets</Link>
          <Link href="/" className="hover:text-[var(--gold)] transition-colors">Main Site</Link>
        </nav>
      </div>
    </header>
  );
}
