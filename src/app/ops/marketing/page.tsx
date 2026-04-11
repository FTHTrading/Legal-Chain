'use client';

import Link from 'next/link';
import { FIRM } from '@/lib/firm';
import { WIDGET_APPS, REVENUE_PRIORITY, MARKETING_CONSTANTS } from '@/lib/marketing/config';
import {
  TrendingUp, Target, Megaphone, BarChart3, Users, Zap,
  DollarSign, Rocket, Shield, Eye, ArrowRight, CheckCircle,
  AlertTriangle, Clock, Layers,
} from 'lucide-react';

// ── Agent Card ──────────────────────────────────────────────────────

const AGENTS = [
  { id: 'revenue-commander', name: 'Revenue Commander', icon: TrendingUp, role: 'Orchestrator', color: '#c9a84c' },
  { id: 'market-intelligence', name: 'Market Intelligence', icon: Eye, role: 'Research', color: '#60a5fa' },
  { id: 'offer-strategy', name: 'Offer Strategy', icon: Target, role: 'Strategy', color: '#34d399' },
  { id: 'funnel-architect', name: 'Funnel Architect', icon: Layers, role: 'Design', color: '#a78bfa' },
  { id: 'content-engine', name: 'Content Engine', icon: Megaphone, role: 'Content', color: '#f472b6' },
  { id: 'outreach', name: 'Outreach', icon: Zap, role: 'Execution', color: '#fb923c' },
  { id: 'paid-acquisition', name: 'Paid Acquisition', icon: DollarSign, role: 'Media', color: '#fbbf24' },
  { id: 'conversion-ops', name: 'Conversion Ops', icon: Users, role: 'Optimization', color: '#2dd4bf' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, role: 'Intelligence', color: '#818cf8' },
  { id: 'brand-compliance', name: 'Brand & Compliance', icon: Shield, role: 'Governance', color: '#f87171' },
];

// ── Widget App Priority Board ───────────────────────────────────────

const URGENCY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
};

export default function MarketingDashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--midnight)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={28} style={{ color: 'var(--gold)' }} />
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
                  Revenue Commander
                </h1>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                {FIRM.name} — Marketing Orchestration & Revenue Activation
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/api/orchestrator/marketing/analytics"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                API Analytics
              </Link>
              <Link
                href="/ops"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--navy-card)', color: 'var(--text-muted)', border: '1px solid rgba(201,168,76,0.1)' }}
              >
                Back to Ops
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* ── Revenue Priority Board ─────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Rocket size={20} className="inline mr-2" />
            Revenue Priority — Widget App Launch Board
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Each widget app is a standalone acquisition machine. Launch sequentially — highest ticket first.
          </p>

          <div className="grid gap-4">
            {REVENUE_PRIORITY.map((appId, i) => {
              const app = WIDGET_APPS.find((w) => w.id === appId);
              if (!app) return null;

              return (
                <div
                  key={app.id}
                  className="glass-panel p-5 rounded-xl card-lift flex items-start gap-5"
                >
                  {/* Priority Badge */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}
                  >
                    #{i + 1}
                  </div>

                  {/* App Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {app.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium uppercase"
                        style={{ backgroundColor: `${URGENCY_COLOR[app.urgencyLevel]}22`, color: URGENCY_COLOR[app.urgencyLevel] }}
                      >
                        {app.urgencyLevel}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      {app.tagline}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div>
                        <span className="block font-medium" style={{ color: 'var(--gold)' }}>
                          ${(app.avgLeadValueCents / 100).toLocaleString()}
                        </span>
                        Avg Lead Value
                      </div>
                      <div>
                        <span className="block font-medium" style={{ color: 'var(--text-primary)' }}>
                          {app.targetBuyer.slice(0, 50)}
                        </span>
                        Target Buyer
                      </div>
                      <div>
                        <span className="block font-medium" style={{ color: 'var(--text-primary)' }}>
                          {app.channels.length} channels
                        </span>
                        Distribution
                      </div>
                      <div>
                        <Link href={app.route} className="font-medium flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                          {app.route} <ArrowRight size={12} />
                        </Link>
                        Widget App
                      </div>
                    </div>

                    {/* Trust barriers */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.trustBarriers.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                        >
                          <AlertTriangle size={10} className="inline mr-1" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Agent Squadron ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Users size={20} className="inline mr-2" />
            Marketing Agent Squadron
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            10 specialized agents coordinated through MCP. Every action is logged, approval-gated, and Constitution-compliant.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="glass-panel p-4 rounded-xl text-center card-lift"
                >
                  <div
                    className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${agent.color}22` }}
                  >
                    <Icon size={20} style={{ color: agent.color }} />
                  </div>
                  <h4 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                    {agent.name}
                  </h4>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {agent.role}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── API Routes Quick Reference ─────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Zap size={20} className="inline mr-2" />
            Orchestrator API Routes
          </h2>

          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>Method</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>Endpoint</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>Purpose</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--gold)' }}>Permission</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['POST', '/api/orchestrator/marketing/init', 'Initialize agents + seed market definitions', 'marketing:manage'],
                  ['POST', '/api/orchestrator/marketing/launch', 'Create campaign for widget app', 'marketing:manage'],
                  ['GET', '/api/orchestrator/marketing/launch', 'List campaigns (filterable)', 'marketing:view'],
                  ['POST', '/api/orchestrator/marketing/assets', 'Create marketing asset', 'marketing:manage'],
                  ['GET', '/api/orchestrator/marketing/assets', 'List assets (filterable)', 'marketing:view'],
                  ['POST', '/api/orchestrator/marketing/approvals', 'Approve/reject campaign or asset', 'marketing:approve'],
                  ['GET', '/api/orchestrator/marketing/approvals', 'List pending approvals', 'marketing:view'],
                  ['GET', '/api/orchestrator/marketing/analytics', 'KPIs, leads, revenue metrics', 'marketing:analytics'],
                  ['POST', '/api/orchestrator/marketing/followup', 'Stale leads, auto-qualify, flag campaigns', 'marketing:manage'],
                ].map(([method, endpoint, purpose, perm]) => (
                  <tr key={`${method}-${endpoint}`} style={{ borderBottom: '1px solid rgba(201,168,76,0.07)' }}>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                        style={{
                          backgroundColor: method === 'POST' ? 'rgba(52,211,153,0.15)' : 'rgba(96,165,250,0.15)',
                          color: method === 'POST' ? '#34d399' : '#60a5fa',
                        }}
                      >
                        {method}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{endpoint}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--text-muted)' }}>{purpose}</td>
                    <td className="px-4 py-2">
                      <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}>
                        {perm}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Operating Constants ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
            <CheckCircle size={20} className="inline mr-2" />
            Operating Constants
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Max Campaigns/App', value: MARKETING_CONSTANTS.maxCampaignsPerApp },
              { label: 'Auto-Qualify Score', value: `${MARKETING_CONSTANTS.autoQualifyScore}/100` },
              { label: 'Stale Lead Days', value: MARKETING_CONSTANTS.staleDays },
              { label: 'Budget Approval Threshold', value: `$${(MARKETING_CONSTANTS.budgetApprovalThresholdCents / 100).toLocaleString()}` },
              { label: 'Auto-Approve Confidence', value: `${(MARKETING_CONSTANTS.autoApproveConfidence * 100).toFixed(0)}%` },
            ].map((c) => (
              <div key={c.label} className="glass-panel p-4 rounded-xl text-center">
                <div className="text-lg font-bold mb-1" style={{ color: 'var(--gold)' }}>{c.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Launch Doctrine ─────────────────────────────────────────── */}
        <section className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
            <Clock size={20} className="inline mr-2" />
            Launch Doctrine
          </h2>
          <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: 'var(--text-muted)' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Do not market the whole universe first.</strong> Launch each widget as a single painkiller in a single market, then upsell into the broader platform.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Revenue Commander picks the order.</strong> Highest-ticket, highest-urgency apps go first.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Every asset goes through approval.</strong> Brand & Compliance reviews before publish.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Kill fast.</strong> If a campaign shows zero conversions after 72 hours of spend, kill it.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Upsell is the real revenue.</strong> Widget entry → full platform onboarding → retainer.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Track everything.</strong> UTM → Lead → Booking → Conversion → Revenue. Full attribution chain.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
