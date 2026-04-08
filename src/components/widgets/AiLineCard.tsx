'use client';

import { Phone, Copy, Zap } from 'lucide-react';
import { AI_LINE, LIVE_DEMO_LINE, telLink } from '@/lib/legal-numbers';
import { toast } from './Toast';

export function AiLineCard() {
  const copyNumber = () => {
    navigator.clipboard.writeText(AI_LINE.numeric);
    toast(`Copied ${AI_LINE.numeric}`);
  };

  return (
    <div className="glass-panel p-4 w-64 glass-panel-hover">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] tracking-widest font-medium" style={{ color: '#34d399' }}>LIVE</span>
        <span className="text-[10px] tracking-wider ml-auto" style={{ color: 'var(--text-muted)' }}>AI LINE</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} style={{ color: 'var(--gold)' }} />
        <span className="font-serif text-lg" style={{ color: 'var(--gold)' }}>{AI_LINE.vanity}</span>
      </div>
      <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>AI answers 24/7</p>
      <div className="flex gap-2">
        <a href={telLink(AI_LINE.numeric)} className="glass-button px-3 py-1.5 text-xs flex items-center gap-1.5 no-underline flex-1 justify-center">
          <Phone size={11} /> Call Now
        </a>
        <button onClick={copyNumber} className="glass-button-outline px-2 py-1.5 text-xs" title="Copy">
          <Copy size={11} />
        </button>
      </div>
      <a href={telLink(LIVE_DEMO_LINE.numeric)} className="block text-center mt-2 text-[10px] no-underline hover:underline"
        style={{ color: 'var(--text-muted)' }}>
        Use Live AI Demo → {LIVE_DEMO_LINE.numeric}
      </a>
    </div>
  );
}
