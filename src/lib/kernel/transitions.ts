/**
 * TRANSITION LAYER
 *
 * Data-driven state machine for every entity lifecycle.
 * Rules encode which status transitions are permitted, with optional
 * labels, role requirements, and approval flags. The TransitionEngine
 * validates moves before the store executes them.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TransitionRule {
  from: string;
  to: string;
  label: string;
  requiredRole?: string;
  requiresApproval?: boolean;
}

export interface TransitionResult {
  allowed: boolean;
  violations: string[];
  rule?: TransitionRule;
}

// ─── Transition Rules ───────────────────────────────────────────────────────

const RULES: Record<string, TransitionRule[]> = {
  // ── Intake lifecycle ─────────────────────────────────────────────────
  intake: [
    { from: "new", to: "screening", label: "Begin screening" },
    { from: "new", to: "conflict_check", label: "Run conflict check" },
    { from: "new", to: "declined", label: "Decline at intake" },
    { from: "new", to: "withdrawn", label: "Client withdrew" },
    { from: "screening", to: "conflict_check", label: "Advance to conflict check" },
    { from: "screening", to: "declined", label: "Decline after screening" },
    { from: "screening", to: "withdrawn", label: "Client withdrew" },
    { from: "conflict_check", to: "initial_review", label: "Pass conflict check" },
    { from: "conflict_check", to: "declined", label: "Conflict found — decline" },
    { from: "initial_review", to: "consultation_scheduled", label: "Schedule consultation" },
    { from: "initial_review", to: "accepted", label: "Accept matter", requiredRole: "attorney" },
    { from: "initial_review", to: "declined", label: "Decline at review" },
    { from: "initial_review", to: "referred_out", label: "Refer to outside counsel" },
    { from: "consultation_scheduled", to: "accepted", label: "Accept after consultation", requiredRole: "attorney" },
    { from: "consultation_scheduled", to: "declined", label: "Decline after consultation" },
    { from: "consultation_scheduled", to: "withdrawn", label: "Client withdrew" },
  ],

  // ── Approval lifecycle ───────────────────────────────────────────────
  approval: [
    { from: "draft", to: "in_review", label: "Submit for review" },
    { from: "in_review", to: "requires_source_check", label: "Flag for source verification" },
    { from: "in_review", to: "requires_attorney_review", label: "Escalate to attorney" },
    { from: "in_review", to: "approved", label: "Approve", requiredRole: "attorney" },
    { from: "in_review", to: "rejected", label: "Reject" },
    { from: "requires_source_check", to: "in_review", label: "Sources verified — return to review" },
    { from: "requires_source_check", to: "approved", label: "Sources verified — approve", requiredRole: "attorney" },
    { from: "requires_source_check", to: "rejected", label: "Sources invalid — reject" },
    { from: "requires_attorney_review", to: "approved", label: "Attorney approved", requiredRole: "attorney" },
    { from: "requires_attorney_review", to: "rejected", label: "Attorney rejected", requiredRole: "attorney" },
    { from: "approved", to: "sent", label: "Send to opposing party" },
    { from: "approved", to: "filed", label: "File with court" },
    { from: "approved", to: "archived", label: "Archive" },
    { from: "rejected", to: "draft", label: "Revise and resubmit" },
    { from: "rejected", to: "archived", label: "Archive rejection" },
    { from: "sent", to: "archived", label: "Archive sent document" },
    { from: "filed", to: "archived", label: "Archive filed document" },
  ],

  // ── Task lifecycle ───────────────────────────────────────────────────
  task: [
    { from: "pending", to: "assigned", label: "Assign task" },
    { from: "pending", to: "in_progress", label: "Start immediately" },
    { from: "pending", to: "cancelled", label: "Cancel before start" },
    { from: "pending", to: "skipped", label: "Skip — not applicable" },
    { from: "assigned", to: "in_progress", label: "Begin work" },
    { from: "assigned", to: "blocked", label: "Mark blocked" },
    { from: "assigned", to: "cancelled", label: "Cancel assignment" },
    { from: "in_progress", to: "awaiting_approval", label: "Submit for approval", requiresApproval: true },
    { from: "in_progress", to: "completed", label: "Mark complete" },
    { from: "in_progress", to: "failed", label: "Mark failed" },
    { from: "in_progress", to: "blocked", label: "Mark blocked" },
    { from: "blocked", to: "in_progress", label: "Unblock — resume" },
    { from: "blocked", to: "cancelled", label: "Cancel blocked task" },
    { from: "awaiting_approval", to: "completed", label: "Approve and complete", requiredRole: "attorney" },
    { from: "awaiting_approval", to: "in_progress", label: "Return for revision" },
    { from: "failed", to: "pending", label: "Retry task" },
    { from: "failed", to: "cancelled", label: "Cancel after failure" },
  ],

  // ── Communication lifecycle ──────────────────────────────────────────
  communication: [
    { from: "draft", to: "pending_review", label: "Submit for review" },
    { from: "draft", to: "archived", label: "Discard draft" },
    { from: "pending_review", to: "approved", label: "Approve for send" },
    { from: "pending_review", to: "draft", label: "Return with edits" },
    { from: "approved", to: "sent", label: "Send now" },
    { from: "approved", to: "scheduled", label: "Schedule send" },
    { from: "approved", to: "archived", label: "Cancel approved" },
    { from: "scheduled", to: "sent", label: "Execute scheduled send" },
    { from: "scheduled", to: "archived", label: "Cancel scheduled" },
    { from: "sent", to: "delivered", label: "Delivery confirmed" },
    { from: "sent", to: "bounced", label: "Bounced" },
    { from: "sent", to: "failed", label: "Send failed" },
    { from: "delivered", to: "read", label: "Read receipt" },
    { from: "delivered", to: "archived", label: "Archive" },
    { from: "read", to: "archived", label: "Archive" },
    { from: "bounced", to: "draft", label: "Revise and retry" },
    { from: "failed", to: "draft", label: "Revise and retry" },
  ],

  // ── Matter lifecycle ─────────────────────────────────────────────────
  matter: [
    { from: "intake", to: "investigation", label: "Open investigation" },
    { from: "intake", to: "closed", label: "Close at intake" },
    { from: "investigation", to: "pre_litigation", label: "Escalate to pre-litigation" },
    { from: "investigation", to: "closed", label: "Close after investigation" },
    { from: "pre_litigation", to: "litigation", label: "File suit" },
    { from: "pre_litigation", to: "closed", label: "Settle pre-litigation" },
    { from: "litigation", to: "appeal", label: "File appeal" },
    { from: "litigation", to: "enforcement", label: "Judgment obtained — enforce" },
    { from: "litigation", to: "closed", label: "Case resolved" },
    { from: "appeal", to: "litigation", label: "Remand for new trial" },
    { from: "appeal", to: "enforcement", label: "Appeal upheld — enforce" },
    { from: "appeal", to: "closed", label: "Appeal resolved" },
    { from: "enforcement", to: "closed", label: "Judgment satisfied" },
    { from: "closed", to: "investigation", label: "Reopen investigation", requiredRole: "attorney" },
  ],

  // ── Evidence lifecycle ───────────────────────────────────────────────
  evidence: [
    { from: "collected", to: "under_review", label: "Begin review" },
    { from: "under_review", to: "authenticated", label: "Authentication confirmed" },
    { from: "under_review", to: "challenged", label: "Authenticity challenged" },
    { from: "authenticated", to: "admitted", label: "Admitted by court" },
    { from: "authenticated", to: "excluded", label: "Excluded by court" },
    { from: "challenged", to: "authenticated", label: "Challenge overcome" },
    { from: "challenged", to: "excluded", label: "Challenge sustained — exclude" },
  ],
};

// ─── TransitionEngine ───────────────────────────────────────────────────────

export class TransitionEngine {
  /** Check whether a transition is permitted. */
  canTransition(entityType: string, from: string, to: string): TransitionResult {
    const typeRules = RULES[entityType];
    if (!typeRules) {
      return { allowed: true, violations: [] }; // No rules defined — allow freely
    }

    const rule = typeRules.find(r => r.from === from && r.to === to);
    if (!rule) {
      return {
        allowed: false,
        violations: [`No transition rule permits ${entityType}: "${from}" → "${to}"`],
      };
    }

    return { allowed: true, violations: [], rule };
  }

  /** List all valid next states from a given status. */
  validNextStates(entityType: string, from: string): string[] {
    const typeRules = RULES[entityType];
    if (!typeRules) return [];
    return typeRules.filter(r => r.from === from).map(r => r.to);
  }

  /** Get the human-readable labels for valid transitions. */
  validTransitions(entityType: string, from: string): Array<{ to: string; label: string }> {
    const typeRules = RULES[entityType];
    if (!typeRules) return [];
    return typeRules
      .filter(r => r.from === from)
      .map(r => ({ to: r.to, label: r.label }));
  }

  /** Get all rules for an entity type to display a full lifecycle diagram. */
  getRules(entityType: string): TransitionRule[] {
    return RULES[entityType] ?? [];
  }

  /** Get all entity types that have rules defined. */
  get entityTypes(): string[] {
    return Object.keys(RULES);
  }
}
