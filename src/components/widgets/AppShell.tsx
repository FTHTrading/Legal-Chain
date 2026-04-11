'use client';

import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { LegalHotlineStrip } from './LegalHotlineStrip';
import { AiLineCard } from './AiLineCard';
import { UrgentHelpFAB } from './UrgentHelpFAB';
import type { LegalNumber } from '@/lib/legal-numbers';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  escalationNumbers?: LegalNumber[];
}

export function AppShell({ title, subtitle, children, escalationNumbers = [] }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--midnight)' }}>
      <TopBar />
      <div className="absolute top-16 right-4 z-30 hidden md:block">
        <AiLineCard />
      </div>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-20 pb-8 widget-enter">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight" style={{ color: 'var(--gold)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
        <div className="md:hidden mb-6">
          <AiLineCard />
        </div>
        {children}
      </main>
      <LegalHotlineStrip numbers={escalationNumbers} />
      <UrgentHelpFAB />
    </div>
  );
}
