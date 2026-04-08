import { z } from 'zod';

export const intakeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  caseType: z.enum(['false-accusation', 'urgent-legal-review', 'criminal-defense', 'civil-dispute', 'other']),
  summary: z.string().min(10, 'Brief summary required'),
  urgency: z.enum(['standard', 'urgent', 'emergency']),
});
export type IntakeFormData = z.infer<typeof intakeSchema>;

export const demandLetterSchema = z.object({
  senderName: z.string().min(2, 'Sender name required'),
  senderAddress: z.string().min(5, 'Sender address required'),
  recipientName: z.string().min(2, 'Recipient name required'),
  recipientAddress: z.string().min(5, 'Recipient address required'),
  issueType: z.enum(['unpaid-invoice', 'breach-of-contract', 'payment-dispute', 'property-damage', 'other']),
  amount: z.string().min(1, 'Amount required'),
  facts: z.string().min(10, 'Facts required'),
  resolution: z.string().min(5, 'Requested resolution required'),
  deadline: z.string().min(1, 'Deadline required'),
});
export type DemandLetterFormData = z.infer<typeof demandLetterSchema>;

export const cryptoRecoverySchema = z.object({
  victimName: z.string().min(2, 'Name required'),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(7, 'Phone required'),
  chain: z.enum(['ethereum', 'bitcoin', 'polygon', 'solana', 'xrpl', 'stellar', 'other']),
  walletAddress: z.string().min(10, 'Wallet address required'),
  txHash: z.string().optional(),
  amountLost: z.string().min(1, 'Amount required'),
  platformUsed: z.string().min(1, 'Platform required'),
  summary: z.string().min(10, 'Incident summary required'),
});
export type CryptoRecoveryFormData = z.infer<typeof cryptoRecoverySchema>;

export const callbackSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(7, 'Phone required'),
  preferredTime: z.string().optional(),
});
export type CallbackFormData = z.infer<typeof callbackSchema>;

export const legalIntakeSchema = z.object({
  callerName: z.string().min(2, 'Name required'),
  phone: z.string().min(7, 'Phone required'),
  issueCategory: z.enum(['criminal', 'civil', 'crypto', 'family', 'appeal', 'other']),
  urgency: z.enum(['standard', 'urgent', 'emergency']),
  preferredLine: z.string().min(1, 'Select a line'),
});
export type LegalIntakeFormData = z.infer<typeof legalIntakeSchema>;
