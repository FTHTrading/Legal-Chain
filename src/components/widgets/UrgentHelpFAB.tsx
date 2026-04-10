'use client';

import { Phone, X, MessageCircle, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AI_LINE, telLink } from '@/lib/legal-numbers';

export function UrgentHelpFAB() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded Actions */}
      {expanded && (
        <div className="glass-panel p-3 space-y-2 mb-1 widget-enter" style={{ minWidth: '200px' }}>
          <a
            href={telLink(AI_LINE.numeric)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}
          >
            <Phone size={16} />
            Call AI Line — 24/7
          </a>
          <a
            href={`sms:${AI_LINE.numeric}`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
          >
            <MessageCircle size={16} />
            Text for Help
          </a>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 text-sm font-medium"
        style={{
          background: expanded
            ? 'rgba(30,30,45,0.95)'
            : 'linear-gradient(135deg, #c44, #e55)',
          color: '#fff',
          border: expanded ? '1px solid rgba(248,113,113,0.3)' : 'none',
          backdropFilter: 'blur(12px)',
        }}
      >
        {expanded ? (
          <>
            <X size={16} /> Close
          </>
        ) : (
          <>
            <Phone size={16} className="animate-pulse" /> Need urgent help?
          </>
        )}
      </button>
    </div>
  );
}
