'use client';

import { Phone, Copy } from 'lucide-react';
import { telLink, type LegalNumber } from '@/lib/legal-numbers';
import { toast } from './Toast';

interface ClickToCallButtonProps {
  number: LegalNumber;
  compact?: boolean;
}

export function ClickToCallButton({ number, compact = false }: ClickToCallButtonProps) {
  const copyNumber = () => {
    navigator.clipboard.writeText(number.numeric);
    toast(`Copied ${number.numeric}`);
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <a href={telLink(number.numeric)} className="glass-button-outline px-2.5 py-1 text-xs flex items-center gap-1.5 no-underline">
          <Phone size={10} />
          {number.vanity}
        </a>
        <button onClick={copyNumber} className="opacity-40 hover:opacity-100 p-1" title="Copy number">
          <Copy size={10} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href={telLink(number.numeric)} className="glass-button px-4 py-2 text-sm flex items-center gap-2 no-underline">
        <Phone size={14} />
        {number.vanity}
      </a>
      <button onClick={copyNumber} className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5" title="Copy">
        <Copy size={12} />
        {number.numeric}
      </button>
    </div>
  );
}
