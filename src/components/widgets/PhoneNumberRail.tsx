'use client';

import { Phone, Copy } from 'lucide-react';
import { telLink, type LegalNumber } from '@/lib/legal-numbers';
import { toast } from './Toast';

interface PhoneNumberRailProps {
  numbers: LegalNumber[];
  primaryId?: string;
}

export function PhoneNumberRail({ numbers, primaryId }: PhoneNumberRailProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {numbers.map(n => {
        const isPrimary = n.id === primaryId;
        return (
          <div key={n.id} className="flex items-center gap-1">
            <a href={telLink(n.numeric)}
              className={`${isPrimary ? 'glass-button' : 'glass-button-outline'} px-3 py-1.5 text-xs flex items-center gap-1.5 no-underline`}>
              <Phone size={10} />
              <span>{n.vanity}</span>
            </a>
            <button onClick={() => { navigator.clipboard.writeText(n.numeric); toast(`Copied ${n.numeric}`); }}
              className="opacity-30 hover:opacity-80 p-1" title={`Copy ${n.numeric}`}>
              <Copy size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
