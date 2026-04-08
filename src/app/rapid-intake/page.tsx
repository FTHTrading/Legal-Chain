'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheck, ArrowLeft } from 'lucide-react';
import { intakeSchema, type IntakeFormData } from '@/lib/widget-schemas';
import { CASE_TYPES, URGENCY_LEVELS } from '@/lib/widget-mock-data';
import { getLawNumbers } from '@/lib/legal-numbers';
import {
  AppShell, SectionCard, StatCard, StatusPill, ResultPanel,
  FormField, GlassInput, GlassSelect, GlassTextarea, GlassButton,
  UploadDropzone, EscalateToAiLine, ToastProvider, toast,
} from '@/components/widgets';

const ESCALATION = getLawNumbers(['law-888', 'law-833']);

interface IntakeResult {
  caseId: string;
  status: string;
  data: IntakeFormData;
}

export default function RapidIntakePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { caseType: 'false-accusation', urgency: 'standard' },
  });

  const onSubmit = async (data: IntakeFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/widgets/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setResult({ caseId: json.caseId, status: json.status, data });
      toast('Intake submitted successfully');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setFiles([]);
    reset();
  };

  return (
    <ToastProvider>
      <AppShell title="Rapid Case Intake" subtitle="False accusation · Urgent legal review" escalationNumbers={ESCALATION}>
        {result ? (
          <div className="space-y-4 widget-enter">
            <ResultPanel title="INTAKE CONFIRMED" variant="success">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard label="Case ID" value={result.caseId} />
                <div className="flex items-center justify-center">
                  <StatusPill status={result.status === 'priority-review' ? 'Priority Review' : 'Submitted'}
                    variant={result.status === 'priority-review' ? 'amber' : 'green'} />
                </div>
              </div>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Name</span>
                  <span>{result.data.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span>{result.data.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Case Type</span>
                  <span>{CASE_TYPES.find(c => c.value === result.data.caseType)?.label}</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Urgency</span>
                  <span>{URGENCY_LEVELS.find(u => u.value === result.data.urgency)?.label}</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Summary</span>
                  <p className="mt-1 text-sm">{result.data.summary}</p>
                </div>
                {files.length > 0 && (
                  <div className="flex justify-between py-1">
                    <span style={{ color: 'var(--text-muted)' }}>Files Attached</span>
                    <span>{files.length}</span>
                  </div>
                )}
              </div>
            </ResultPanel>
            <button onClick={handleReset} className="glass-button-outline px-4 py-2 text-sm flex items-center gap-2">
              <ArrowLeft size={14} /> New Intake
            </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="FULL NAME" error={errors.name?.message}>
                    <GlassInput {...register('name')} placeholder="Your name" />
                  </FormField>
                  <FormField label="EMAIL" error={errors.email?.message}>
                    <GlassInput {...register('email')} type="email" placeholder="you@email.com" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="PHONE" error={errors.phone?.message}>
                    <GlassInput {...register('phone')} type="tel" placeholder="+1 (555) 000-0000" />
                  </FormField>
                  <FormField label="CASE TYPE" error={errors.caseType?.message}>
                    <GlassSelect {...register('caseType')}>
                      {CASE_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </GlassSelect>
                  </FormField>
                </div>
                <FormField label="URGENCY" error={errors.urgency?.message}>
                  <div className="flex gap-3">
                    {URGENCY_LEVELS.map(u => (
                      <label key={u.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value={u.value} {...register('urgency')}
                          className="accent-[var(--gold)]" />
                        <span className={`text-sm ${u.color}`}>{u.label}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="BRIEF SUMMARY" error={errors.summary?.message}>
                  <GlassTextarea {...register('summary')} rows={4} placeholder="Describe your situation briefly..." />
                </FormField>
                <FormField label="SUPPORTING FILES">
                  <UploadDropzone onFiles={setFiles} />
                </FormField>
                <GlassButton type="submit" loading={loading} className="w-full md:w-auto">
                  <span className="flex items-center gap-2"><FileCheck size={16} /> Start Review</span>
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
