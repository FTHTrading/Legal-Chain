// ── Email Send Service ─────────────────────────────────────────────
// Queues, validates, and logs outbound emails.
// Emails requiring approval are held until approved via the Approval Queue.
// Actual SMTP dispatch is stubbed — plug in a provider (Resend, SES, etc.) later.

import { db } from '@/lib/db';
import { FIRM } from '@/lib/firm';
import {
  getBuiltInTemplate,
  renderTemplate,
  interpolate,
  type TemplateVars,
} from './templates';

// ── Types ──────────────────────────────────────────────────────────

export interface SendEmailInput {
  /** Template slug (e.g. "intake-receipt") */
  templateSlug: string;
  /** Variable values to interpolate into the template */
  vars: TemplateVars;
  /** Recipient email addresses */
  to: string[];
  /** Optional CC */
  cc?: string[];
  /** Optional BCC */
  bcc?: string[];
  /** Optional matter linkage */
  matterId?: string;
  /** Metadata to store with the log */
  metadata?: Record<string, unknown>;
}

export interface SendResult {
  ok: boolean;
  emailLogId: string;
  status: 'queued' | 'pending_approval' | 'sent';
  message: string;
}

// ── Core Send Function ─────────────────────────────────────────────

/**
 * Queue an email for sending.
 * - Resolves the template from the built-in library or the database.
 * - Renders the template with the provided variables.
 * - If the template requires approval, sets status to pending_approval.
 * - Otherwise, attempts immediate dispatch (or queues for async send).
 * - Logs everything to the EmailLog table.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  // 1. Resolve template
  const builtIn = getBuiltInTemplate(input.templateSlug);

  let rendered: {
    fromAddress: string;
    fromName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    requiresApproval: boolean;
  };
  let dbTemplateId: string | undefined;

  if (builtIn) {
    rendered = renderTemplate(builtIn, input.vars);
  } else {
    // Fall back to database-stored template
    const dbTemplate = await db.emailTemplate.findUnique({
      where: { slug: input.templateSlug },
    });
    if (!dbTemplate || !dbTemplate.active) {
      throw new Error(`Email template not found or inactive: ${input.templateSlug}`);
    }
    dbTemplateId = dbTemplate.id;
    const fromAddress =
      FIRM.email[dbTemplate.fromIdentity as keyof typeof FIRM.email] ??
      FIRM.email.noreply;
    rendered = {
      fromAddress,
      fromName: FIRM.name,
      subject: interpolate(dbTemplate.subject, input.vars),
      bodyHtml: interpolate(dbTemplate.bodyHtml, input.vars),
      bodyText: dbTemplate.bodyText
        ? interpolate(dbTemplate.bodyText, input.vars)
        : '',
      requiresApproval: false,
    };
  }

  // 2. Determine initial status
  const status = rendered.requiresApproval ? 'pending_approval' : 'queued';

  // 3. Create log entry
  const log = await db.emailLog.create({
    data: {
      templateId: dbTemplateId ?? undefined,
      matterId: input.matterId ?? undefined,
      fromAddress: rendered.fromAddress,
      fromName: rendered.fromName,
      toAddresses: input.to,
      ccAddresses: input.cc ?? [],
      bccAddresses: input.bcc ?? [],
      subject: rendered.subject,
      bodyHtml: rendered.bodyHtml,
      bodyText: rendered.bodyText || undefined,
      status,
      requiresApproval: rendered.requiresApproval,
      metadata: (input.metadata ?? undefined) as undefined | Record<string, string | number | boolean | null>,
    },
  });

  // 4. If no approval needed, attempt dispatch
  if (status === 'queued') {
    await dispatchEmail(log.id);
    return {
      ok: true,
      emailLogId: log.id,
      status: 'sent',
      message: 'Email dispatched.',
    };
  }

  return {
    ok: true,
    emailLogId: log.id,
    status: 'pending_approval',
    message: 'Email queued for approval.',
  };
}

// ── Dispatch (SMTP stub) ──────────────────────────────────────────

/**
 * Dispatch an email via the configured provider.
 * Currently a stub — logs the send and updates status.
 * Replace with Resend, AWS SES, Postmark, etc.
 */
async function dispatchEmail(emailLogId: string): Promise<void> {
  // TODO: plug in actual SMTP/API provider here
  // const log = await db.emailLog.findUniqueOrThrow({ where: { id: emailLogId } });
  // await resend.emails.send({ from: log.fromAddress, to: log.toAddresses, ... });

  await db.emailLog.update({
    where: { id: emailLogId },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });
}

// ── Approval Actions ───────────────────────────────────────────────

/** Approve a pending email and dispatch it. */
export async function approveEmail(
  emailLogId: string,
  approvedById: string,
): Promise<void> {
  const log = await db.emailLog.findUniqueOrThrow({
    where: { id: emailLogId },
  });
  if (log.status !== 'pending_approval') {
    throw new Error(`Email ${emailLogId} is not pending approval (status: ${log.status})`);
  }

  await db.emailLog.update({
    where: { id: emailLogId },
    data: {
      status: 'approved',
      approvedById,
      approvedAt: new Date(),
    },
  });

  await dispatchEmail(emailLogId);
}

/** Reject a pending email. */
export async function rejectEmail(
  emailLogId: string,
  approvedById: string,
  reason: string,
): Promise<void> {
  const log = await db.emailLog.findUniqueOrThrow({
    where: { id: emailLogId },
  });
  if (log.status !== 'pending_approval') {
    throw new Error(`Email ${emailLogId} is not pending approval (status: ${log.status})`);
  }

  await db.emailLog.update({
    where: { id: emailLogId },
    data: {
      status: 'rejected',
      approvedById,
      approvedAt: new Date(),
      rejectedReason: reason,
    },
  });
}
