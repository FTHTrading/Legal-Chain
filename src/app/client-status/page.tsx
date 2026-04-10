'use client';

import { useState } from 'react';
import { CheckCircle, Circle, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import { MOCK_MATTER, type MockMatter } from '@/lib/widget-mock-data';
import { getLawNumbers } from '@/lib/legal-numbers';
import {
  AppShell, SectionCard, StatCard, StatusPill, ActionPanel, ResultPanel,
  FormField, GlassTextarea, GlassButton,
  EscalateToAiLine, ToastProvider, toast,
} from '@/components/widgets';

const ESCALATION = getLawNumbers(['law-888', 'law-833', 'law-888-643']);

const statusVariant = (s: MockMatter['status']) => {
  switch (s) {
    case 'active': return 'green';
    case 'pending-review': return 'amber';
    case 'awaiting-response': return 'blue';
    case 'resolved': return 'gold';
  }
};

const statusLabel = (s: MockMatter['status']) => {
  switch (s) {
    case 'active': return 'Matter Active';
    case 'pending-review': return 'Pending Review';
    case 'awaiting-response': return 'Awaiting Response';
    case 'resolved': return 'Resolved';
  }
};

export default function ClientStatusPage() {
  const [matter] = useState<MockMatter>(MOCK_MATTER);
  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast('Enter a message', 'error');
      return;
    }
    setMessageSent(true);
    setMessage('');
    toast('Message sent');
    setTimeout(() => setMessageSent(false), 3000);
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    toast('Action acknowledged');
  };

  if (showDetail) {
    return (
      <ToastProvider>
        <AppShell title={matter.title} subtitle={`Case ${matter.id}`} escalationNumbers={ESCALATION}>
          <div className="space-y-4 widget-enter">
            <button onClick={() => setShowDetail(false)} className="glass-button-outline px-3 py-1.5 text-xs flex items-center gap-1.5">
              <ArrowLeft size={12} /> Back to Overview
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Case ID" value={matter.id} />
              <StatCard label="Progress" value={`${matter.progress}%`} />
              <StatCard label="Status" value={statusLabel(matter.status)} />
              <StatCard label="Updates" value={matter.updates.length} />
            </div>

            {/* Progress Steps */}
            <SectionCard>
              <p className="text-xs tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>CASE PROGRESS</p>
              <div className="space-y-3">
                {matter.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle size={18} className="flex-shrink-0" style={{ color: '#34d399' }} />
                    ) : (
                      <Circle size={18} className="flex-shrink-0" style={{ color: 'rgba(201,168,76,0.3)' }} />
                    )}
                    <span className="text-sm" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {step.label}
                    </span>
                    {i === matter.steps.findIndex(s => !s.done) && (
                      <StatusPill status="Current" variant="amber" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${matter.progress}%`, background: 'var(--gold)' }} />
              </div>
            </SectionCard>

            {/* All Updates */}
            <SectionCard>
              <p className="text-xs tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>ALL UPDATES</p>
              <div className="space-y-4">
                {matter.updates.map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--gold)' }} />
                    <div>
                      <span className="text-[11px] font-mono block" style={{ color: 'var(--text-muted)' }}>{u.date}</span>
                      <p className="text-sm mt-0.5">{u.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <EscalateToAiLine escalationNumbers={ESCALATION} />
          </div>
        </AppShell>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppShell title="Status + Help" subtitle="Check your case. Get your next step." escalationNumbers={ESCALATION}>
        <div className="space-y-4">
          {/* Matter Card */}
          <SectionCard className="glass-panel-hover cursor-pointer" >
            <div onClick={() => setShowDetail(true)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{matter.id}</p>
                  <h2 className="font-serif text-xl" style={{ color: 'var(--text-primary)' }}>{matter.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={statusLabel(matter.status)} variant={statusVariant(matter.status)} />
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span className="text-xs" style={{ color: 'var(--gold)' }}>{matter.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${matter.progress}%`, background: 'var(--gold)' }} />
                </div>
              </div>
              {/* Mini steps */}
              <div className="flex gap-2 flex-wrap">
                {matter.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs"
                    style={{ color: step.done ? '#34d399' : 'var(--text-muted)' }}>
                    {step.done ? <CheckCircle size={10} /> : <Circle size={10} />}
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Recent Updates */}
          <SectionCard>
            <p className="text-xs tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>RECENT UPDATES</p>
            <div className="space-y-3">
              {matter.updates.slice(0, 2).map((u, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--gold)' }} />
                  <div>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{u.date}</span>
                    <p className="text-sm">{u.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Next Action */}
          <ResultPanel title="NEXT REQUIRED ACTION" variant="info">
            <p className="text-sm mb-4" style={{ color: 'var(--text-primary)' }}>{matter.nextAction}</p>
            <ActionPanel>
              {acknowledged ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#34d399' }}>
                  <CheckCircle size={16} /> Acknowledged
                </div>
              ) : (
                <GlassButton onClick={handleAcknowledge} className="flex items-center gap-2">
                  <CheckCircle size={14} /> Acknowledge
                </GlassButton>
              )}
              <GlassButton variant="outline" onClick={() => setShowDetail(true)} className="flex items-center gap-2">
                 View Details <ChevronRight size={14} />
              </GlassButton>
            </ActionPanel>
          </ResultPanel>

          {/* Message */}
          <SectionCard>
            <p className="text-xs tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>SEND A MESSAGE</p>
            {messageSent ? (
              <div className="text-center py-4 widget-enter">
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: '#34d399' }} />
                <p className="text-sm" style={{ color: '#34d399' }}>Message sent to your legal team.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <GlassTextarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Type your message..." />
                <GlassButton onClick={handleSendMessage} variant="outline" className="flex items-center gap-2">
                  <MessageSquare size={14} /> Send Message
                </GlassButton>
              </div>
            )}
          </SectionCard>

          <EscalateToAiLine escalationNumbers={ESCALATION} />
        </div>
      </AppShell>
    </ToastProvider>
  );
}
