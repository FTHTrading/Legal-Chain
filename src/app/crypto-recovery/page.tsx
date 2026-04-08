'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowLeft, AlertTriangle, Search } from 'lucide-react';
import { cryptoRecoverySchema, type CryptoRecoveryFormData } from '@/lib/widget-schemas';
import { CHAIN_OPTIONS } from '@/lib/widget-mock-data';
import { getLawNumbers } from '@/lib/legal-numbers';
import {
  AppShell, SectionCard, StatCard, StatusPill, ResultPanel,
  FormField, GlassInput, GlassSelect, GlassTextarea, GlassButton,
  EscalateToAiLine, ToastProvider, toast,
} from '@/components/widgets';

const ESCALATION = getLawNumbers(['law-888', 'law-888-974']);

interface RecoveryResult {
  caseId: string;
  riskLevel: string;
  status: string;
  data: CryptoRecoveryFormData;
}

export default function CryptoRecoveryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecoveryResult | null>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CryptoRecoveryFormData>({
    resolver: zodResolver(cryptoRecoverySchema),
    defaultValues: { chain: 'ethereum' },
  });

  const onSubmit = async (data: CryptoRecoveryFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/widgets/crypto-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setResult({ caseId: json.caseId, riskLevel: json.riskLevel, status: json.status, data });
      toast('Incident logged');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    reset();
  };

  const riskVariant = (level: string) => level === 'high' ? 'red' : level === 'medium' ? 'amber' : 'blue';

  return (
    <ToastProvider>
      <AppShell title="Crypto Recovery Intake" subtitle="Stolen crypto · Wallet tracing" escalationNumbers={ESCALATION}>
        {result ? (
          <div className="space-y-4 widget-enter">
            <ResultPanel title="INCIDENT LOGGED" variant="success">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <StatCard label="Case ID" value={result.caseId} />
                <div className="glass-panel p-4 text-center">
                  <StatusPill status={`Risk: ${result.riskLevel.toUpperCase()}`} variant={riskVariant(result.riskLevel)} />
                </div>
                <div className="glass-panel p-4 text-center">
                  <StatusPill status="Ready for Review" variant="green" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>WALLET CAPTURE</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Chain</span>
                      <span>{CHAIN_OPTIONS.find(c => c.value === result.data.chain)?.label}</span>
                    </div>
                    <div className="py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                      <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>Wallet Address</span>
                      <code className="text-xs font-mono break-all" style={{ color: 'var(--gold)' }}>{result.data.walletAddress}</code>
                    </div>
                    {result.data.txHash && (
                      <div className="py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                        <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>TX Hash</span>
                        <code className="text-xs font-mono break-all" style={{ color: 'var(--text-primary)' }}>{result.data.txHash}</code>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Lost</span>
                      <span style={{ color: '#f87171' }}>${result.data.amountLost}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span style={{ color: 'var(--text-muted)' }}>Platform</span>
                      <span>{result.data.platformUsed}</span>
                    </div>
                  </div>
                </div>
                <div className="glass-panel p-4">
                  <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>INCIDENT SUMMARY</p>
                  <p className="text-sm">{result.data.summary}</p>
                </div>
              </div>
            </ResultPanel>
            <div className="flex gap-3">
              <button onClick={handleReset} className="glass-button-outline px-4 py-2 text-sm flex items-center gap-2">
                <ArrowLeft size={14} /> New Incident
              </button>
              <div className="glass-panel px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#34d399' }}>
                <Search size={14} /> Ready for Forensic Review
              </div>
            </div>
            <EscalateToAiLine escalationNumbers={ESCALATION} />
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="glass-panel p-4 text-sm flex items-center gap-2" style={{ borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <SectionCard>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>VICTIM INFORMATION</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="FULL NAME" error={errors.victimName?.message}>
                    <GlassInput {...register('victimName')} placeholder="Your name" />
                  </FormField>
                  <FormField label="EMAIL" error={errors.contactEmail?.message}>
                    <GlassInput {...register('contactEmail')} type="email" placeholder="you@email.com" />
                  </FormField>
                  <FormField label="PHONE" error={errors.contactPhone?.message}>
                    <GlassInput {...register('contactPhone')} type="tel" placeholder="+1 (555) 000-0000" />
                  </FormField>
                </div>
                <div className="border-t my-4" style={{ borderColor: 'rgba(201,168,76,0.1)' }} />
                <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>INCIDENT DETAILS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="CHAIN" error={errors.chain?.message}>
                    <GlassSelect {...register('chain')}>
                      {CHAIN_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </GlassSelect>
                  </FormField>
                  <FormField label="PLATFORM USED" error={errors.platformUsed?.message}>
                    <GlassInput {...register('platformUsed')} placeholder="Coinbase, MetaMask, etc." />
                  </FormField>
                </div>
                <FormField label="WALLET ADDRESS" error={errors.walletAddress?.message}>
                  <GlassInput {...register('walletAddress')} placeholder="0x..." className="font-mono" />
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="TX HASH (optional)" error={errors.txHash?.message}>
                    <GlassInput {...register('txHash')} placeholder="0x..." className="font-mono" />
                  </FormField>
                  <FormField label="AMOUNT LOST ($)" error={errors.amountLost?.message}>
                    <GlassInput {...register('amountLost')} placeholder="50,000" />
                  </FormField>
                </div>
                <FormField label="INCIDENT SUMMARY" error={errors.summary?.message}>
                  <GlassTextarea {...register('summary')} rows={4} placeholder="What happened? When did you notice? Any known perpetrators?" />
                </FormField>
                <GlassButton type="submit" loading={loading} className="w-full md:w-auto">
                  <span className="flex items-center gap-2"><Shield size={16} /> Log Incident</span>
                </GlassButton>
              </form>
            </SectionCard>
            <EscalateToAiLine escalationNumbers={ESCALATION} />
          </div>
        )}
      </AppShell>
    </ToastProvider>
  );
}
