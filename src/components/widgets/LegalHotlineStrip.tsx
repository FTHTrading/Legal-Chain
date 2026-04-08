'use client';

import { AI_LINE, telLink, type LegalNumber } from '@/lib/legal-numbers';
import { Phone, Copy } from 'lucide-react';
import { toast } from './Toast';

interface LegalHotlineStripProps {
  numbers: LegalNumber[];
}

export function LegalHotlineStrip({ numbers }: LegalHotlineStripProps) {
  const allNumbers = [AI_LINE, ...numbers.filter(n => n.id !== AI_LINE.id)];

  return (
    <footer className="border-t py-3 px-4" style={{ borderColor: 'rgba(201,168,76,0.1)', background: 'rgba(8,11,22,0.9)' }}>
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-2 justify-center">
        {allNumbers.map(n => (
          <div key={n.id} className="flex items-center gap-1">
            <a href={telLink(n.numeric)}
              className="glass-button-outline px-2.5 py-1 text-[11px] flex items-center gap-1 no-underline">
              <Phone size={9} />
              {n.vanity}
            </a>
            <button onClick={() => { navigator.clipboard.writeText(n.numeric); toast(`Copied ${n.numeric}`); }}
              className="opacity-25 hover:opacity-80 p-0.5" title={n.numeric}>
              <Copy size={9} />
            </button>
          </div>
        ))}
        <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>UNYKORN // LAW</span>
      </div>
    </footer>
  );
}
