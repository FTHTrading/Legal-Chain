'use client';

import { Shield, Clock, Copy, Download, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/widgets';

interface ProofReceiptProps {
  caseId: string;
  submittedAt: Date;
  type: 'intake' | 'demand-letter' | 'crypto-recovery' | 'evidence' | 'status';
  summary?: string;
}

const TYPE_LABELS: Record<string, string> = {
  'intake': 'Emergency Intake',
  'demand-letter': 'Demand Letter',
  'crypto-recovery': 'Crypto Recovery Report',
  'evidence': 'Evidence Drop',
  'status': 'Status Update',
};

function generateReceiptHash(caseId: string, timestamp: string): string {
  let hash = 0;
  const str = `${caseId}:${timestamp}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

export function ProofReceipt({ caseId, submittedAt, type, summary }: ProofReceiptProps) {
  const [copied, setCopied] = useState(false);
  const timestamp = submittedAt.toISOString();
  const receiptHash = generateReceiptHash(caseId, timestamp);
  const displayTime = submittedAt.toLocaleString();

  const receiptText = [
    `UNYKORN LAW — Proof Receipt`,
    `Type: ${TYPE_LABELS[type] || type}`,
    `Case ID: ${caseId}`,
    `Submitted: ${displayTime}`,
    `Receipt: #${receiptHash}`,
    summary ? `Summary: ${summary}` : '',
    `---`,
    `This receipt confirms your submission was received.`,
    `Save this for your records.`,
  ].filter(Boolean).join('\n');

  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    toast('Receipt copied — save this for your records');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="glass-panel p-5 widget-enter" style={{ borderColor: 'rgba(52,211,153,0.25)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
          <CheckCircle size={18} style={{ color: '#34d399' }} />
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold" style={{ color: '#34d399' }}>
            Submission Received
          </h4>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {TYPE_LABELS[type] || type}
          </p>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Case ID</span>
          <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{caseId}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Timestamp</span>
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
            <Clock size={10} className="inline mr-1" />
            {displayTime}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Receipt</span>
          <span className="font-mono" style={{ color: 'var(--gold)' }}>
            <Shield size={10} className="inline mr-1" />
            #{receiptHash}
          </span>
        </div>
        {summary && (
          <div className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
            {summary}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={copyReceipt}
          className="glass-button-outline px-3 py-2 text-xs flex items-center gap-1.5 flex-1 justify-center"
        >
          {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy Receipt'}
        </button>
      </div>

      {/* Save Warning */}
      <p className="text-[10px] text-center mt-3" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
        Save this receipt. It confirms your submission was received and timestamped.
      </p>
    </div>
  );
}
