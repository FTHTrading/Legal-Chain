'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Copy, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { demandLetterSchema, type DemandLetterFormData } from '@/lib/widget-schemas';
import { ISSUE_TYPES } from '@/lib/widget-mock-data';
import { getLawNumbers } from '@/lib/legal-numbers';
import {
  AppShell, SectionCard, StatusPill, ActionPanel,
  FormField, GlassInput, GlassSelect, GlassTextarea, GlassButton,
  EscalateToAiLine, ToastProvider, toast,
  ProofReceipt,
} from '@/components/widgets';

const ESCALATION = getLawNumbers(['law-888', 'law-888-763']);

interface LetterResult {
  letterId: string;
  content: string;
  status: string;
}

export default function DemandLetterPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LetterResult | null>(null);
  const [error, setError] = useState('');
  const [approved, setApproved] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DemandLetterFormData>({
    resolver: zodResolver(demandLetterSchema),
    defaultValues: { issueType: 'unpaid-invoice' },
  });

  const onSubmit = async (data: DemandLetterFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/widgets/demand-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setResult({ letterId: json.letterId, content: json.content, status: json.status });
      toast('Letter generated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.content);
      toast('Letter copied to clipboard');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-letter-${result.letterId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Letter downloaded');
  };

  const handleApprove = () => {
    setApproved(true);
    toast('Marked ready for approval');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setApproved(false);
    reset();
  };

  return (
    <ToastProvider>
      <AppShell title="Demand Letter Now" subtitle="Generate a clean demand letter fast." escalationNumbers={ESCALATION}>
        {result ? (
          <div className="space-y-4 widget-enter">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.letterId}</span>
                <StatusPill status={approved ? 'Ready for Approval' : 'Draft'} variant={approved ? 'green' : 'gold'} />
              </div>
              <button onClick={handleReset} className="glass-button-outline px-3 py-1.5 text-xs flex items-center gap-1.5">
                <ArrowLeft size={12} /> New Letter
              </button>
            </div>
            <SectionCard>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-body"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                {result.content}
              </pre>
            </SectionCard>
            <ActionPanel>
              <GlassButton onClick={handleCopy} variant="outline" className="flex items-center gap-2">
                <Copy size={14} /> Copy
              </GlassButton>
              <GlassButton onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                <Download size={14} /> Download
              </GlassButton>
              {!approved && (
                <GlassButton onClick={handleApprove} className="flex items-center gap-2">
                  <CheckCircle size={14} /> Mark Ready for Approval
                </GlassButton>
              )}
            </ActionPanel>
            <ProofReceipt caseId={result.letterId} submittedAt={new Date()} type="demand-letter" />
            <EscalateToAiLine escalationNumbers={ESCALATION} />
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="glass-panel p-4 text-sm" style={{ borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}
            <SectionCard>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>SENDER</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="NAME" error={errors.senderName?.message}>
                    <GlassInput {...register('senderName')} placeholder="Your full name" />
                  </FormField>
                  <FormField label="ADDRESS" error={errors.senderAddress?.message}>
                    <GlassInput {...register('senderAddress')} placeholder="Street, City, State ZIP" />
                  </FormField>
                </div>
                <div className="border-t my-4" style={{ borderColor: 'rgba(201,168,76,0.1)' }} />
                <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>RECIPIENT</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="NAME" error={errors.recipientName?.message}>
                    <GlassInput {...register('recipientName')} placeholder="Recipient name" />
                  </FormField>
                  <FormField label="ADDRESS" error={errors.recipientAddress?.message}>
                    <GlassInput {...register('recipientAddress')} placeholder="Street, City, State ZIP" />
                  </FormField>
                </div>
                <div className="border-t my-4" style={{ borderColor: 'rgba(201,168,76,0.1)' }} />
                <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>DISPUTE</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="ISSUE TYPE" error={errors.issueType?.message}>
                    <GlassSelect {...register('issueType')}>
                      {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </GlassSelect>
                  </FormField>
                  <FormField label="AMOUNT ($)" error={errors.amount?.message}>
                    <GlassInput {...register('amount')} placeholder="25,000" />
                  </FormField>
                </div>
                <FormField label="FACTS" error={errors.facts?.message}>
                  <GlassTextarea {...register('facts')} rows={4} placeholder="Brief factual summary of the dispute..." />
                </FormField>
                <FormField label="REQUESTED RESOLUTION" error={errors.resolution?.message}>
                  <GlassTextarea {...register('resolution')} rows={2} placeholder="What you are demanding..." />
                </FormField>
                <FormField label="DEADLINE" error={errors.deadline?.message}>
                  <GlassInput {...register('deadline')} type="date" />
                </FormField>
                <GlassButton type="submit" loading={loading} className="w-full md:w-auto">
                  <span className="flex items-center gap-2"><FileText size={16} /> Generate Letter</span>
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
