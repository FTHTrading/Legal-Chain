'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, PhoneCall, ArrowRight } from 'lucide-react';
import { AI_LINE, telLink, type LegalNumber } from '@/lib/legal-numbers';
import { legalIntakeSchema, type LegalIntakeFormData } from '@/lib/widget-schemas';
import { CallbackRequestModal } from './CallbackRequestModal';
import { Modal } from './ConfirmDialog';
import { FormField, GlassInput, GlassSelect, GlassButton } from './FormField';
import { toast } from './Toast';

interface EscalateToAiLineProps {
  escalationNumbers?: LegalNumber[];
}

export function EscalateToAiLine({ escalationNumbers = [] }: EscalateToAiLineProps) {
  const [showCallback, setShowCallback] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const allNumbers = [AI_LINE, ...escalationNumbers];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LegalIntakeFormData>({
    resolver: zodResolver(legalIntakeSchema),
    defaultValues: { preferredLine: AI_LINE.id },
  });

  const onIntakeSubmit = async () => {
    await new Promise(r => setTimeout(r, 600));
    setIntakeSubmitted(true);
    toast('Legal intake submitted');
    setTimeout(() => {
      setIntakeSubmitted(false);
      reset();
      setShowIntake(false);
    }, 2000);
  };

  return (
    <>
      <div className="glass-panel p-4">
        <p className="text-xs font-medium tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>ESCALATE</p>
        <div className="flex flex-wrap gap-2">
          <a href={telLink(AI_LINE.numeric)} className="glass-button px-3 py-2 text-xs flex items-center gap-1.5 no-underline">
            <Phone size={12} /> Call AI Now
          </a>
          <button onClick={() => setShowCallback(true)} className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5">
            <PhoneCall size={12} /> Request Callback
          </button>
          <button onClick={() => setShowIntake(true)} className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5">
            <ArrowRight size={12} /> Route to Legal Intake
          </button>
        </div>
      </div>

      <CallbackRequestModal open={showCallback} onClose={() => setShowCallback(false)} />

      <Modal open={showIntake} onClose={() => { setShowIntake(false); setIntakeSubmitted(false); }} title="Route to Legal Intake">
        {intakeSubmitted ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">✓</div>
            <p className="text-sm" style={{ color: '#34d399' }}>Intake routed. A legal specialist will follow up.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onIntakeSubmit)} className="space-y-4">
            <FormField label="CALLER NAME" error={errors.callerName?.message}>
              <GlassInput {...register('callerName')} placeholder="Full name" />
            </FormField>
            <FormField label="PHONE" error={errors.phone?.message}>
              <GlassInput {...register('phone')} type="tel" placeholder="+1 (555) 000-0000" />
            </FormField>
            <FormField label="ISSUE CATEGORY" error={errors.issueCategory?.message}>
              <GlassSelect {...register('issueCategory')}>
                <option value="">Select category</option>
                <option value="criminal">Criminal</option>
                <option value="civil">Civil</option>
                <option value="crypto">Crypto / Digital Assets</option>
                <option value="family">Family</option>
                <option value="appeal">Appeal</option>
                <option value="other">Other</option>
              </GlassSelect>
            </FormField>
            <FormField label="URGENCY" error={errors.urgency?.message}>
              <GlassSelect {...register('urgency')}>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </GlassSelect>
            </FormField>
            <FormField label="PREFERRED LAW LINE" error={errors.preferredLine?.message}>
              <GlassSelect {...register('preferredLine')}>
                {allNumbers.map(n => (
                  <option key={n.id} value={n.id}>{n.vanity} — {n.numeric}</option>
                ))}
              </GlassSelect>
            </FormField>
            <GlassButton type="submit" className="w-full">Submit Intake</GlassButton>
          </form>
        )}
      </Modal>
    </>
  );
}
