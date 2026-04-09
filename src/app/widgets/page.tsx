'use client';

import Link from 'next/link';
import { Scale, FileCheck, FileText, Shield, Calendar, BarChart3, Phone, Zap, ExternalLink } from 'lucide-react';
import { AI_LINE, LEGAL_NUMBERS, telLink } from '@/lib/legal-numbers';
import { ToastProvider, toast } from '@/components/widgets';
import { Copy } from 'lucide-react';

const WIDGETS = [
  {
    title: 'Rapid Case Intake',
    description: 'False accusation · Urgent legal review',
    href: '/rapid-intake',
    icon: FileCheck,
    accent: '#34d399',
    numberId: 'law-888',
  },
  {
    title: 'Demand Letter Generator',
    description: 'Unpaid invoice · Breach / payment dispute',
    href: '/demand-letter',
    icon: FileText,
    accent: '#60a5fa',
    numberId: 'law-888-763',
  },
  {
    title: 'Crypto Recovery Intake',
    description: 'Stolen crypto · Wallet tracing',
    href: '/crypto-recovery',
    icon: Shield,
    accent: '#a78bfa',
    numberId: 'law-888-974',
  },
  {
    title: 'Evidence Timeline',
    description: 'Upload evidence · Organize timeline',
    href: '/evidence-timeline',
    icon: Calendar,
    accent: '#fbbf24',
    numberId: 'law-888-649',
  },
  {
    title: 'Client Status Portal',
    description: 'Matter status · Next steps',
    href: '/client-status',
    icon: BarChart3,
    accent: '#f472b6',
    numberId: 'law-833',
  },
];

export default function WidgetsLauncherPage() {
  const copyAiLine = () => {
    navigator.clipboard.writeText(AI_LINE.numeric);
    toast(`Copied ${AI_LINE.numeric}`);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--midnight)' }}>
        {/* Header */}
        <div className="text-center pt-16 pb-8 px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Scale size={28} style={{ color: 'var(--gold)' }} />
            <h1 className="font-serif text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--gold)' }}>
              UNYKORN // LAW
            </h1>
          </div>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            5 legal tools. Each solves one thing. Fast, clean, AI-powered.
          </p>
          <p className="text-[10px] mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
            Every tool has a dedicated AI phone line — call or use online
          </p>
        </div>

        {/* AI Line */}
        <div className="max-w-3xl mx-auto w-full px-4 mb-8">
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Zap size={16} style={{ color: 'var(--gold)' }} />
              <span className="font-serif text-lg" style={{ color: 'var(--gold)' }}>{AI_LINE.vanity}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI answers 24/7</span>
            </div>
            <div className="flex gap-2">
              <a href={telLink(AI_LINE.numeric)} className="glass-button px-4 py-2 text-sm flex items-center gap-2 no-underline">
                <Phone size={14} /> Call Now
              </a>
              <button onClick={copyAiLine} className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5">
                <Copy size={12} /> {AI_LINE.numeric}
              </button>
            </div>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="max-w-3xl mx-auto w-full px-4 pb-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WIDGETS.map((w) => {
              const num = LEGAL_NUMBERS.find(n => n.id === w.numberId);
              return (
                <div key={w.href} className="glass-panel glass-panel-hover p-6 flex flex-col card-lift">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${w.accent}15` }}>
                    <w.icon size={20} style={{ color: w.accent }} />
                  </div>
                  <h3 className="font-serif text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                    {w.title}
                  </h3>
                  <p className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>
                    {w.description}
                  </p>
                  {num && (
                    <a href={telLink(num.numeric)}
                      className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono no-underline transition-colors"
                      style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' }}>
                      <Phone size={10} />
                      <span>{num.vanity}</span>
                      <span className="ml-auto text-[9px] opacity-60">AI</span>
                    </a>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={w.href} className="text-xs font-medium flex items-center gap-1 no-underline" style={{ color: w.accent }}>
                      Open Tool →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NEED AI Banner */}
        <div className="max-w-3xl mx-auto w-full px-4 pb-8">
          <div className="glass-panel p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono tracking-widest text-emerald-400">NEED AI POWERED</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Every tool is backed by an AI phone line that answers 24/7. Call the number on any tool card — or call 888-LAW for general legal AI.
                </p>
              </div>
              <a href="https://needai.unykorn.org" target="_blank" rel="noopener noreferrer"
                className="glass-button-outline px-4 py-2 text-xs flex items-center gap-2 no-underline whitespace-nowrap">
                <ExternalLink size={12} /> needai.unykorn.org
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {LEGAL_NUMBERS.filter(n => n.category === 'law-routing' && n.active).map(n => (
                <a key={n.id} href={telLink(n.numeric)}
                  className="glass-button-outline px-2 py-1 text-[10px] font-mono flex items-center gap-1 no-underline">
                  <Phone size={8} /> {n.vanity}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-4 px-4 text-center" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-[var(--gold)] transition-colors">Main Site</Link>
            <span>·</span>
            <span>UNYKORN // LAW</span>
            <span>·</span>
            <a href={telLink(AI_LINE.numeric)} className="hover:text-[var(--gold)] transition-colors no-underline"
              style={{ color: 'var(--text-muted)' }}>
              {AI_LINE.vanity}: {AI_LINE.numeric}
            </a>
            <span>·</span>
            <a href="https://needai.unykorn.org" target="_blank" rel="noopener noreferrer"
              className="text-emerald-400 no-underline hover:text-emerald-300 transition-colors font-mono">
              NEED AI
            </a>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
