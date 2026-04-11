'use client';

import Link from 'next/link';
import { Scale, FileCheck, FileText, Shield, Camera, BarChart3, Phone, Zap, QrCode, ArrowRight } from 'lucide-react';
import { AI_LINE, telLink } from '@/lib/legal-numbers';
import { ToastProvider, toast } from '@/components/widgets';
import { Copy } from 'lucide-react';

const RESCUE_APPS = [
  {
    id: 'emergency-intake',
    title: 'Emergency Intake',
    tagline: 'Report what happened. Get help now.',
    description: 'Scan QR, enter name, issue, location, upload proof, submit. Your front door when something is going wrong.',
    href: '/rapid-intake',
    icon: FileCheck,
    accent: '#34d399',
    action: 'Start Report',
    time: '< 30 sec',
  },
  {
    id: 'demand-letter',
    title: 'Demand Letter Now',
    tagline: 'Generate a clean demand letter fast.',
    description: 'Guided flow for consumer disputes, landlord issues, employer conflicts, debt collection, harassment, service failures.',
    href: '/demand-letter',
    icon: FileText,
    accent: '#60a5fa',
    action: 'Draft Letter',
    time: '< 2 min',
  },
  {
    id: 'crypto-recovery',
    title: 'Crypto Recovery Report',
    tagline: 'Log the theft. Start the trace.',
    description: 'Wallet address, TX hash, exchange, screenshots, chain selection, loss summary. Our strongest specialist wedge.',
    href: '/crypto-recovery',
    icon: Shield,
    accent: '#a78bfa',
    action: 'Log Incident',
    time: '< 2 min',
  },
  {
    id: 'evidence-drop',
    title: 'Evidence Drop',
    tagline: 'Save the proof before it disappears.',
    description: 'Fast upload for photos, texts, documents, screenshots, voice notes. Timestamped. Receipted. Chain-of-custody ready.',
    href: '/evidence-timeline',
    icon: Camera,
    accent: '#fbbf24',
    action: 'Upload Evidence',
    time: '< 15 sec',
  },
  {
    id: 'status-help',
    title: 'Status + Help',
    tagline: 'Check your case. Get your next step.',
    description: 'Case status, next action, request callback, acknowledge tasks. Stay connected without needing a full portal.',
    href: '/client-status',
    icon: BarChart3,
    accent: '#f472b6',
    action: 'Check Status',
    time: 'Instant',
  },
];

export default function RescueHubPage() {
  const copyAiLine = () => {
    navigator.clipboard.writeText(AI_LINE.numeric);
    toast(`Copied ${AI_LINE.numeric}`);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--midnight)' }}>
        {/* Hero */}
        <div className="text-center pt-12 pb-6 px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale size={24} style={{ color: 'var(--gold)' }} />
            <span className="font-serif text-sm tracking-[0.3em] uppercase" style={{ color: 'var(--gold)' }}>
              UNYKORN // LAW
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
            Rescue Apps
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-2" style={{ color: 'var(--text-muted)' }}>
            Scan. Report. Protect. Escalate.
          </p>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Fast, mobile-first legal rescue tools. No login required. Open instantly when something is going wrong.
          </p>
        </div>

        {/* Emergency Line */}
        <div className="max-w-2xl mx-auto w-full px-4 mb-8">
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-medium tracking-wider" style={{ color: '#f87171' }}>NEED URGENT HELP?</span>
            </div>
            <div className="flex gap-2">
              <a href={telLink(AI_LINE.numeric)}
                className="glass-button px-5 py-2.5 text-sm flex items-center gap-2 no-underline"
                style={{ background: 'linear-gradient(135deg, #c44, #e55)' }}>
                <Phone size={14} /> Call Now — 24/7
              </a>
              <button onClick={copyAiLine} className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5">
                <Copy size={12} /> {AI_LINE.numeric}
              </button>
            </div>
          </div>
        </div>

        {/* App Grid */}
        <div className="max-w-2xl mx-auto w-full px-4 pb-12 flex-1">
          <div className="space-y-4">
            {RESCUE_APPS.map((app) => (
              <Link key={app.id} href={app.href} className="no-underline block">
                <div className="glass-panel glass-panel-hover p-5 flex items-start gap-4 cursor-pointer card-lift">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${app.accent}15` }}>
                    <app.icon size={22} style={{ color: app.accent }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>
                        {app.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${app.accent}15`, color: app.accent }}>
                        {app.time}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: app.accent }}>
                      {app.tagline}
                    </p>
                    <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                      {app.description}
                    </p>
                  </div>
                  {/* Action */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium self-center"
                    style={{ color: app.accent }}>
                    <span className="hidden sm:inline">{app.action}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* QR Hub Callout */}
        <div className="max-w-2xl mx-auto w-full px-4 pb-8">
          <div className="glass-panel p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <QrCode size={18} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-medium tracking-wider" style={{ color: 'var(--gold)' }}>QR-READY</span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Print these. Share these. Post these.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Each app opens directly to action from any QR code — cards, flyers, community boards, partner offices, social posts. No marketing page. No login. Straight to help.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="max-w-2xl mx-auto w-full px-4 pb-8">
          <p className="text-center text-xs italic" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            These are not widgets. They are legal rescue apps built to be scanned, shared, and used fast when someone needs help now.
          </p>
        </div>

        {/* Footer */}
        <footer className="border-t py-4 px-4 text-center" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-[var(--gold)] transition-colors">Main Site</Link>
            <span>·</span>
            <Link href="/intake" className="hover:text-[var(--gold)] transition-colors">Full Intake</Link>
            <span>·</span>
            <span>UNYKORN // LAW</span>
            <span>·</span>
            <a href={telLink(AI_LINE.numeric)} className="hover:text-[var(--gold)] transition-colors no-underline"
              style={{ color: 'var(--text-muted)' }}>
              {AI_LINE.vanity}: {AI_LINE.numeric}
            </a>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
