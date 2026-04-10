// ── Email Template Definitions & Rendering ────────────────────────
// Built-in templates for all system email types.
// Uses mustache-style {{variable}} interpolation.

import { FIRM } from '@/lib/firm';
import type { EmailTemplateType } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────

export interface TemplateDef {
  slug: string;
  templateType: EmailTemplateType;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  fromIdentity: keyof typeof FIRM.email;
  requiresApproval: boolean;
}

export type TemplateVars = Record<string, string | number | undefined>;

// ── Interpolation ──────────────────────────────────────────────────

/** Replace {{key}} placeholders with values from the vars object. */
export function interpolate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = vars[key];
    return val !== undefined ? String(val) : '';
  });
}

// ── Shared Fragments ───────────────────────────────────────────────

const HEADER = `
<div style="background:#0a0e1a;padding:24px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.2)">
  <span style="font-family:serif;font-size:14px;letter-spacing:0.3em;color:#c9a84c">UNYKORN // LAW</span>
</div>`;

const FOOTER = `
<div style="background:#0d1225;padding:20px;text-align:center;border-top:1px solid rgba(201,168,76,0.15);margin-top:32px">
  <p style="font-size:11px;color:#8892b0;margin:0 0 8px">${FIRM.address.full}</p>
  <p style="font-size:10px;color:#5a6380;margin:0;max-width:480px;display:inline-block">${FIRM.disclaimer}</p>
</div>`;

function wrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#111936">
${HEADER}
<div style="padding:24px 32px;color:#ccd6f6;font-size:14px;line-height:1.7">
${content}
</div>
${FOOTER}
</div></body></html>`;
}

// ── Template Library ───────────────────────────────────────────────

export const BUILT_IN_TEMPLATES: TemplateDef[] = [
  {
    slug: 'intake-receipt',
    templateType: 'intake_receipt',
    name: 'Intake Receipt',
    subject: 'Your intake has been received — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Intake Received</h2>
      <p>Thank you, <strong>{{clientName}}</strong>. Your case intake has been received and assigned reference number <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <p>Our team will review your submission and follow up within 24 hours. You can track your case status at any time through the client portal.</p>
      <p style="margin-top:24px"><strong>What happens next:</strong></p>
      <ul style="padding-left:20px">
        <li>Conflict check (automated)</li>
        <li>Attorney review</li>
        <li>Case strategy assessment</li>
      </ul>
    `),
    bodyText: `Intake Received\n\nThank you, {{clientName}}. Your case intake has been received and assigned reference {{caseReference}}.\n\nOur team will review your submission and follow up within 24 hours.\n\n${FIRM.address.full}`,
    fromIdentity: 'intake',
    requiresApproval: false,
  },
  {
    slug: 'evidence-receipt',
    templateType: 'evidence_receipt',
    name: 'Evidence Receipt',
    subject: 'Evidence received and preserved — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Evidence Preserved</h2>
      <p>The following evidence has been received and cryptographically preserved for matter <strong style="color:#c9a84c">{{caseReference}}</strong>:</p>
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#8892b0">Item</p>
        <p style="margin:0;font-weight:600">{{evidenceTitle}}</p>
        <p style="margin:8px 0 0;font-size:11px;font-family:monospace;color:#8892b0">SHA-256: {{evidenceHash}}</p>
      </div>
      <p>This item is now part of the chain of custody and timestamped in the evidence timeline.</p>
    `),
    bodyText: `Evidence Preserved\n\nEvidence received for matter {{caseReference}}.\nItem: {{evidenceTitle}}\nSHA-256: {{evidenceHash}}\n\nThis item is now part of the chain of custody.\n\n${FIRM.address.full}`,
    fromIdentity: 'evidence',
    requiresApproval: false,
  },
  {
    slug: 'demand-delivery',
    templateType: 'demand_delivery',
    name: 'Demand Letter Delivery',
    subject: 'Demand Letter — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Demand Letter Delivered</h2>
      <p>A demand letter has been prepared and approved for matter <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <p>The attached document has been reviewed and approved by {{approverName}} on {{approvalDate}}.</p>
      <p><strong>Recipient:</strong> {{recipientName}}</p>
      <p>A copy is preserved in the case file and evidence timeline.</p>
    `),
    bodyText: `Demand Letter Delivered\n\nA demand letter has been prepared for matter {{caseReference}}.\nApproved by {{approverName}} on {{approvalDate}}.\nRecipient: {{recipientName}}\n\n${FIRM.address.full}`,
    fromIdentity: 'cases',
    requiresApproval: true,
  },
  {
    slug: 'status-update',
    templateType: 'status_update',
    name: 'Case Status Update',
    subject: 'Case update — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Case Status Update</h2>
      <p>Your matter <strong style="color:#c9a84c">{{caseReference}}</strong> has been updated.</p>
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#8892b0">New Status</p>
        <p style="margin:0;font-weight:600;color:#34d399">{{newStatus}}</p>
      </div>
      <p>{{statusMessage}}</p>
    `),
    bodyText: `Case Status Update\n\nMatter {{caseReference}} status: {{newStatus}}\n\n{{statusMessage}}\n\n${FIRM.address.full}`,
    fromIdentity: 'status',
    requiresApproval: false,
  },
  {
    slug: 'deadline-reminder',
    templateType: 'deadline_reminder',
    name: 'Deadline Reminder',
    subject: '⚠ Deadline approaching — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#fb923c;font-family:serif;margin:0 0 16px">Deadline Approaching</h2>
      <p>A deadline is approaching for matter <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <div style="background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#8892b0">Deadline</p>
        <p style="margin:0;font-weight:600;color:#fb923c">{{deadlineDate}}</p>
        <p style="margin:8px 0 0;font-size:13px">{{deadlineDescription}}</p>
      </div>
    `),
    bodyText: `DEADLINE APPROACHING\n\nMatter: {{caseReference}}\nDeadline: {{deadlineDate}}\n{{deadlineDescription}}\n\n${FIRM.address.full}`,
    fromIdentity: 'alerts',
    requiresApproval: false,
  },
  {
    slug: 'approval-request',
    templateType: 'approval_request',
    name: 'Approval Request',
    subject: 'Approval needed — {{approvalType}} — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Approval Required</h2>
      <p>A {{approvalType}} requires your review and approval for matter <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <p><strong>Submitted by:</strong> {{submitterName}}</p>
      <p><strong>Document:</strong> {{documentTitle}}</p>
      <p><strong>Confidence:</strong> {{confidenceScore}}</p>
      <p style="margin-top:20px">Please review this item in the Approval Queue.</p>
    `),
    bodyText: `Approval Required\n\n{{approvalType}} needs review for matter {{caseReference}}.\nSubmitted by: {{submitterName}}\nDocument: {{documentTitle}}\n\n${FIRM.address.full}`,
    fromIdentity: 'approvals',
    requiresApproval: false,
  },
  {
    slug: 'approval-result',
    templateType: 'approval_result',
    name: 'Approval Result',
    subject: '{{approvalDecision}} — {{documentTitle}} — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:{{decisionColor}};font-family:serif;margin:0 0 16px">{{approvalDecision}}</h2>
      <p>The {{approvalType}} for matter <strong style="color:#c9a84c">{{caseReference}}</strong> has been <strong>{{approvalDecision}}</strong>.</p>
      <p><strong>Reviewed by:</strong> {{reviewerName}}</p>
      <p>{{reviewerComments}}</p>
    `),
    bodyText: `{{approvalDecision}}\n\n{{approvalType}} for {{caseReference}} has been {{approvalDecision}}.\nReviewed by: {{reviewerName}}\n\n${FIRM.address.full}`,
    fromIdentity: 'approvals',
    requiresApproval: false,
  },
  {
    slug: 'case-assignment',
    templateType: 'case_assignment',
    name: 'Case Assignment',
    subject: 'You have been assigned to {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Case Assignment</h2>
      <p>You have been assigned to matter <strong style="color:#c9a84c">{{caseReference}}</strong> as <strong>{{assignmentRole}}</strong>.</p>
      <p><strong>Matter:</strong> {{matterTitle}}</p>
      <p><strong>Type:</strong> {{matterType}}</p>
      <p><strong>Assigned by:</strong> {{assignedBy}}</p>
    `),
    bodyText: `Case Assignment\n\nYou have been assigned to {{caseReference}} as {{assignmentRole}}.\nMatter: {{matterTitle}}\n\n${FIRM.address.full}`,
    fromIdentity: 'cases',
    requiresApproval: false,
  },
  {
    slug: 'document-delivery',
    templateType: 'document_delivery',
    name: 'Document Delivery',
    subject: 'Document ready — {{documentTitle}} — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Document Ready</h2>
      <p>A document is available for your review in matter <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#8892b0">Document</p>
        <p style="margin:0;font-weight:600">{{documentTitle}}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#8892b0">Type: {{documentType}}</p>
      </div>
      <p>Access it through the client portal or case file.</p>
    `),
    bodyText: `Document Ready\n\nDocument: {{documentTitle}}\nType: {{documentType}}\nMatter: {{caseReference}}\n\n${FIRM.address.full}`,
    fromIdentity: 'cases',
    requiresApproval: false,
  },
  {
    slug: 'escalation-alert',
    templateType: 'escalation_alert',
    name: 'Escalation Alert',
    subject: '🚨 Escalation — {{escalationType}} — {{caseReference}}',
    bodyHtml: wrap(`
      <h2 style="color:#f87171;font-family:serif;margin:0 0 16px">Escalation Alert</h2>
      <p>An escalation has been triggered for matter <strong style="color:#c9a84c">{{caseReference}}</strong>.</p>
      <div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#8892b0">Type</p>
        <p style="margin:0;font-weight:600;color:#f87171">{{escalationType}}</p>
        <p style="margin:8px 0 0;font-size:13px">{{escalationReason}}</p>
      </div>
      <p><strong>Triggered by:</strong> {{triggeredBy}}</p>
    `),
    bodyText: `ESCALATION ALERT\n\nMatter: {{caseReference}}\nType: {{escalationType}}\nReason: {{escalationReason}}\nTriggered by: {{triggeredBy}}\n\n${FIRM.address.full}`,
    fromIdentity: 'alerts',
    requiresApproval: false,
  },
  {
    slug: 'welcome',
    templateType: 'welcome',
    name: 'Welcome to UNYKORN LAW',
    subject: 'Welcome to UNYKORN LAW — {{clientName}}',
    bodyHtml: wrap(`
      <h2 style="color:#c9a84c;font-family:serif;margin:0 0 16px">Welcome</h2>
      <p>Welcome, <strong>{{clientName}}</strong>. Your account on the UNYKORN LAW platform has been created.</p>
      <p>From here you can:</p>
      <ul style="padding-left:20px">
        <li>Track your case status in real time</li>
        <li>Upload evidence securely</li>
        <li>View and download documents</li>
        <li>Communicate with your legal team</li>
      </ul>
      <p>If you have questions, reply to this email or contact us at ${FIRM.email.support}.</p>
    `),
    bodyText: `Welcome to UNYKORN LAW, {{clientName}}.\n\nYour account has been created. Track your case, upload evidence, and view documents through the client portal.\n\nQuestions? Contact ${FIRM.email.support}\n\n${FIRM.address.full}`,
    fromIdentity: 'noreply',
    requiresApproval: false,
  },
];

/** Look up a built-in template by slug. */
export function getBuiltInTemplate(slug: string): TemplateDef | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.slug === slug);
}

/** Render a template with the provided variables. */
export function renderTemplate(template: TemplateDef, vars: TemplateVars) {
  const fromAddress = FIRM.email[template.fromIdentity];
  return {
    fromAddress,
    fromName: FIRM.name,
    subject: interpolate(template.subject, vars),
    bodyHtml: interpolate(template.bodyHtml, vars),
    bodyText: interpolate(template.bodyText, vars),
    requiresApproval: template.requiresApproval,
  };
}
