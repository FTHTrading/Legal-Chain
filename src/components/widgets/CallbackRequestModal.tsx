'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { callbackSchema, type CallbackFormData } from '@/lib/widget-schemas';
import { Modal } from './ConfirmDialog';
import { FormField, GlassInput, GlassButton } from './FormField';
import { toast } from './Toast';

interface CallbackRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function CallbackRequestModal({ open, onClose }: CallbackRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CallbackFormData>({
    resolver: zodResolver(callbackSchema),
  });

  const onSubmit = async (data: CallbackFormData) => {
    await new Promise(r => setTimeout(r, 600));
    setSubmitted(true);
    toast('Callback request received');
    setTimeout(() => {
      setSubmitted(false);
      reset();
      onClose();
    }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Request Callback">
      {submitted ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-3">✓</div>
          <p className="text-sm" style={{ color: '#34d399' }}>Callback scheduled. We'll reach out shortly.</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleString()}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="YOUR NAME" error={errors.name?.message}>
            <GlassInput {...register('name')} placeholder="Full name" />
          </FormField>
          <FormField label="PHONE" error={errors.phone?.message}>
            <GlassInput {...register('phone')} type="tel" placeholder="+1 (555) 000-0000" />
          </FormField>
          <FormField label="PREFERRED TIME" error={errors.preferredTime?.message}>
            <GlassInput {...register('preferredTime')} placeholder="e.g. Tomorrow morning" />
          </FormField>
          <GlassButton type="submit" className="w-full">Request Callback</GlassButton>
        </form>
      )}
    </Modal>
  );
}
