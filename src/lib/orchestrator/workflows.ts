/**
 * Legal Workflow Templates
 *
 * Pre-built workflows for the full legal lifecycle:
 *   1. INTAKE_INVESTIGATION — auto-run after intake: conflict check → research → preliminary report
 *   2. CASE_FILE_BUILDER — builds the full case file with evidence, analysis, strategy, motions
 *   3. FULL_DEFENSE — end-to-end: intake investigation → case file → ongoing defense
 *
 * All workflows route through the Privacy Vault — agents receive
 * only vault references and sanitized summaries, never raw PII.
 */

import type { WorkflowDef, PipelineDef, StepDef } from "./types";

// ════════════════════════════════════════════════════════════════
// 1. INTAKE INVESTIGATION
// ════════════════════════════════════════════════════════════════

const intakeScreeningPipeline: PipelineDef = {
  id: "pipe-intake-screening",
  name: "Intake Screening & Conflict Check",
  description: "Initial screening, conflict check, and jurisdiction analysis",
  pattern: "sequential",
  steps: [
    {
      id: "step-conflict-check",
      name: "Automated Conflict Check",
      agentTeam: "compliance_audit",
      instruction:
        "Run a conflict-of-interest check for this matter. Check all parties against existing clients and matters. " +
        "Flag any potential conflicts. Return a clear PASS or FAIL with details. " +
        "Use the vault reference IDs provided — do NOT attempt to access raw client data.",
      outputKey: "conflict_result",
      maxRetries: 1,
      minConfidence: 0.7,
    },
    {
      id: "step-jurisdiction-analysis",
      name: "Jurisdiction Analysis",
      agentTeam: "legal_research",
      instruction:
        "Analyze the jurisdiction for this matter. Identify applicable courts, statutes of limitations, " +
        "filing requirements, and procedural rules. Consider both state and federal options if applicable.",
      dependsOn: ["step-conflict-check"],
      condition: { type: "step_succeeded", stepId: "step-conflict-check" },
      outputKey: "jurisdiction_analysis",
      minConfidence: 0.65,
    },
    {
      id: "step-initial-scoring",
      name: "Case Viability Scoring",
      agentTeam: "case_strategy",
      instruction:
        "Score this case for viability on a 0–100 scale. Consider: strength of legal position, " +
        "likely damages/recovery, cost-benefit analysis, available evidence indicators, and jurisdiction favorability. " +
        "Base analysis on the jurisdiction research and conflict check results in context.",
      dependsOn: ["step-jurisdiction-analysis"],
      outputKey: "viability_score",
      minConfidence: 0.6,
    },
  ],
  onFailure: "escalate",
};

const preliminaryInvestigationPipeline: PipelineDef = {
  id: "pipe-prelim-investigation",
  name: "Preliminary AI Investigation",
  description: "Deep-dive research, damages assessment, and evidence mapping",
  pattern: "parallel",
  maxConcurrency: 3,
  steps: [
    {
      id: "step-legal-research",
      name: "Legal Research Deep Dive",
      agentTeam: "legal_research",
      instruction:
        "Conduct comprehensive legal research for this matter. Find relevant case law, statutes, regulations, " +
        "and secondary sources. Identify controlling precedent, persuasive authority, and any adverse authority. " +
        "Cite all sources with full Bluebook citations.",
      outputKey: "legal_research",
      minConfidence: 0.6,
      x402Action: {
        type: "research_subscription",
        description: "Legal research database access",
        amount: "1000000000000000000",
        asset: "ATP",
        requiresPreApproval: false,
      },
    },
    {
      id: "step-damages-assessment",
      name: "Damages & Recovery Assessment",
      agentTeam: "case_strategy",
      instruction:
        "Assess potential damages and recovery paths. Calculate economic damages, potential punitive damages, " +
        "attorney fees recoverability, and total recovery ceiling. Factor in collection risks and " +
        "judgment enforcement challenges.",
      outputKey: "damages_assessment",
      minConfidence: 0.55,
    },
    {
      id: "step-evidence-mapping",
      name: "Evidence Landscape Mapping",
      agentTeam: "evidence_analysis",
      instruction:
        "Map the evidence landscape for this matter. Identify what evidence exists, what needs to be " +
        "preserved, what discovery will likely yield, and any evidentiary challenges. " +
        "Flag any spoliation risks or urgent preservation needs.",
      outputKey: "evidence_map",
      minConfidence: 0.6,
    },
  ],
  onFailure: "skip",
};

const preliminaryReportPipeline: PipelineDef = {
  id: "pipe-prelim-report",
  name: "Preliminary Investigation Report",
  description: "Generate the auto-populated preliminary investigation PDF",
  pattern: "sequential",
  steps: [
    {
      id: "step-generate-prelim-report",
      name: "Generate Preliminary Report",
      agentTeam: "document_drafting",
      instruction:
        "Generate a comprehensive PRELIMINARY INVESTIGATION REPORT based on all prior context: " +
        "conflict check results, jurisdiction analysis, viability score, legal research, damages assessment, and evidence mapping.\n\n" +
        "FORMAT THE REPORT AS A STRUCTURED DOCUMENT WITH THESE SECTIONS:\n" +
        "1. EXECUTIVE SUMMARY — One-paragraph overview of the matter and AI assessment\n" +
        "2. CONFLICT CHECK — Pass/fail with details\n" +
        "3. JURISDICTION ANALYSIS — Courts, venue, SOL, filing requirements\n" +
        "4. CASE VIABILITY — Score and breakdown\n" +
        "5. LEGAL RESEARCH — Key authorities, controlling law, adverse authority\n" +
        "6. DAMAGES ASSESSMENT — Economic analysis, recovery ceiling, collection risks\n" +
        "7. EVIDENCE LANDSCAPE — Available evidence, preservation needs, discovery expectations\n" +
        "8. RISK FACTORS — Identified risks and mitigation strategies\n" +
        "9. RECOMMENDED NEXT STEPS — Prioritized action items\n" +
        "10. AI CONFIDENCE ASSESSMENT — Overall confidence rating with explanations\n\n" +
        "IMPORTANT: Do NOT include any raw client names, emails, phones, or PII. Reference only by matter ID and case type.",
      outputKey: "preliminary_report",
      requiresApproval: false,
      minConfidence: 0.65,
    },
    {
      id: "step-attorney-review-gate",
      name: "Attorney Review Gate",
      agentTeam: "compliance_audit",
      instruction:
        "Flag this preliminary report for supervising attorney review. " +
        "Verify no PII leakage in the report text. Confirm all citations are properly formatted. " +
        "Check for any ethical concerns or unauthorized practice of law risks.",
      dependsOn: ["step-generate-prelim-report"],
      outputKey: "review_gate_result",
      requiresApproval: true,
      minConfidence: 0.8,
    },
  ],
  onFailure: "escalate",
};

export const INTAKE_INVESTIGATION: WorkflowDef = {
  id: "wf-intake-investigation",
  name: "Intake Investigation Workflow",
  description:
    "Automated preliminary investigation triggered by new case intake. " +
    "Screens, researches, assesses damages, maps evidence, and generates a high-end preliminary report. " +
    "All client PII is secured in the Web3 Privacy Vault.",
  version: "1.0.0",
  category: "intake",
  pipelines: [intakeScreeningPipeline, preliminaryInvestigationPipeline, preliminaryReportPipeline],
  requiresSupervisingAttorney: true,
  approvalGates: ["step-attorney-review-gate"],
  estimatedTotalATP: "5000000000000000000",
  x402Enabled: true,
  createdAt: "2026-04-07T00:00:00Z",
  updatedAt: "2026-04-07T00:00:00Z",
};

// ════════════════════════════════════════════════════════════════
// 2. CASE FILE BUILDER
// ════════════════════════════════════════════════════════════════

const evidenceCollectionPipeline: PipelineDef = {
  id: "pipe-evidence-collection",
  name: "Evidence Collection & Chain of Custody",
  description: "Systematic evidence gathering with blockchain-anchored custody chain",
  pattern: "sequential",
  steps: [
    {
      id: "step-evidence-inventory",
      name: "Evidence Inventory",
      agentTeam: "evidence_analysis",
      instruction:
        "Create a complete inventory of all known evidence for this matter. Catalog each piece with: " +
        "type, source, custodian, relevance, authentication status, and privilege assessment. " +
        "Cross-reference with the preliminary evidence mapping from the investigation phase.",
      outputKey: "evidence_inventory",
      minConfidence: 0.7,
    },
    {
      id: "step-chain-of-custody",
      name: "Blockchain Chain of Custody",
      agentTeam: "forensic_intelligence",
      instruction:
        "Establish blockchain-anchored chain of custody for all critical evidence. " +
        "Hash each evidence item and prepare for on-chain anchoring. " +
        "Ensure tamper-proof verification trail for litigation.",
      dependsOn: ["step-evidence-inventory"],
      outputKey: "custody_chain",
      x402Action: {
        type: "evidence_preservation",
        description: "Evidence hash anchoring on chain",
        amount: "500000000000000000",
        asset: "ATP",
        requiresPreApproval: false,
      },
    },
  ],
  onFailure: "escalate",
};

const legalAnalysisPipeline: PipelineDef = {
  id: "pipe-legal-analysis",
  name: "Comprehensive Legal Analysis",
  description: "Full legal analysis across all claim theories",
  pattern: "parallel",
  maxConcurrency: 3,
  steps: [
    {
      id: "step-claim-analysis",
      name: "Claim-by-Claim Analysis",
      agentTeam: "case_strategy",
      instruction:
        "Analyze each potential claim or defense theory in detail. For each claim: " +
        "elements required, evidence supporting each element, strength assessment (1-10), " +
        "potential defenses/counterclaims, and case law support. " +
        "Rank claims by strength and strategic value.",
      outputKey: "claim_analysis",
      minConfidence: 0.6,
    },
    {
      id: "step-defense-strategy",
      name: "Defense Strategy Development",
      agentTeam: "case_strategy",
      instruction:
        "Develop a comprehensive defense strategy. Include: primary theory of the case, " +
        "alternative theories, anticipated opposing arguments and rebuttals, " +
        "key witnesses needed, expert witness requirements, and strategic timeline. " +
        "Consider both settlement and trial tracks.",
      outputKey: "defense_strategy",
      minConfidence: 0.6,
    },
    {
      id: "step-liability-exposure",
      name: "Liability & Exposure Analysis",
      agentTeam: "compliance_audit",
      instruction:
        "Assess liability exposure from all angles. Calculate worst-case exposure, " +
        "likely outcome ranges, insurance coverage analysis, indemnification rights, " +
        "and contribution claims. Flag any regulatory exposure.",
      outputKey: "liability_exposure",
    },
  ],
  onFailure: "skip",
};

const caseFileAssemblyPipeline: PipelineDef = {
  id: "pipe-case-file-assembly",
  name: "Full Case File Assembly",
  description: "Assemble the complete case file from all analysis",
  pattern: "sequential",
  steps: [
    {
      id: "step-motion-drafts",
      name: "Draft Key Motions",
      agentTeam: "document_drafting",
      instruction:
        "Draft initial versions of key motions and pleadings based on the case analysis. Include: " +
        "complaint/answer outline, motion for preliminary injunction (if applicable), " +
        "discovery plan, and any emergency motions needed. " +
        "Use proper legal formatting with case captions.",
      outputKey: "motion_drafts",
      requiresApproval: true,
      minConfidence: 0.7,
    },
    {
      id: "step-assemble-case-file",
      name: "Assemble Complete Case File",
      agentTeam: "document_drafting",
      instruction:
        "Assemble the COMPLETE CASE FILE REPORT integrating all prior work:\n\n" +
        "1. CASE OVERVIEW — Matter summary, parties (by role only, no PII), jurisdiction\n" +
        "2. INVESTIGATION SUMMARY — Key findings from preliminary investigation\n" +
        "3. EVIDENCE INVENTORY — Cataloged evidence with custody chain references\n" +
        "4. LEGAL ANALYSIS — Claim-by-claim breakdown with authorities\n" +
        "5. DEFENSE STRATEGY — Primary and alternative theories, timeline\n" +
        "6. LIABILITY EXPOSURE — Risk matrix and financial exposure\n" +
        "7. DISCOVERY PLAN — Interrogatories, document requests, depositions needed\n" +
        "8. MOTION PRACTICE — Drafted motions and anticipated filings\n" +
        "9. EXPERT WITNESSES — Required experts and expected testimony\n" +
        "10. SETTLEMENT ANALYSIS — Settlement range, BATNA, negotiation strategy\n" +
        "11. BUDGET & TIMELINE — Litigation budget and milestone timeline\n" +
        "12. BLOCKCHAIN ANCHORS — Evidence hashes and chain verification references\n\n" +
        "CRITICAL: NO CLIENT PII. Reference parties by role (Claimant, Respondent, etc.) and matter ID only.",
      dependsOn: ["step-motion-drafts"],
      outputKey: "complete_case_file",
      minConfidence: 0.65,
      x402Action: {
        type: "case_registration",
        description: "Full case file registration on chain",
        amount: "2000000000000000000",
        asset: "ATP",
        requiresPreApproval: false,
      },
    },
  ],
  onFailure: "escalate",
};

export const CASE_FILE_BUILDER: WorkflowDef = {
  id: "wf-case-file-builder",
  name: "Full Case File Builder",
  description:
    "Builds the complete case file: evidence collection with blockchain custody chain, " +
    "comprehensive legal analysis, defense strategy, motion drafts, and case file assembly. " +
    "All client information secured in Web3 Privacy Vault.",
  version: "1.0.0",
  category: "litigation",
  pipelines: [evidenceCollectionPipeline, legalAnalysisPipeline, caseFileAssemblyPipeline],
  requiresSupervisingAttorney: true,
  approvalGates: ["step-motion-drafts"],
  estimatedTotalATP: "10000000000000000000",
  x402Enabled: true,
  createdAt: "2026-04-07T00:00:00Z",
  updatedAt: "2026-04-07T00:00:00Z",
};

// ════════════════════════════════════════════════════════════════
// 3. FULL DEFENSE (Composite)
// ════════════════════════════════════════════════════════════════

export const FULL_DEFENSE: WorkflowDef = {
  id: "wf-full-defense",
  name: "Full Defense Lifecycle",
  description:
    "End-to-end defense workflow: intake screening → preliminary investigation → " +
    "full case file construction → motion practice → defense preparation. " +
    "Combines Intake Investigation and Case File Builder into a single automated pipeline.",
  version: "1.0.0",
  category: "litigation",
  pipelines: [
    intakeScreeningPipeline,
    preliminaryInvestigationPipeline,
    preliminaryReportPipeline,
    evidenceCollectionPipeline,
    legalAnalysisPipeline,
    caseFileAssemblyPipeline,
  ],
  requiresSupervisingAttorney: true,
  approvalGates: ["step-attorney-review-gate", "step-motion-drafts"],
  estimatedTotalATP: "15000000000000000000",
  x402Enabled: true,
  createdAt: "2026-04-07T00:00:00Z",
  updatedAt: "2026-04-07T00:00:00Z",
};

// ════════════════════════════════════════════════════════════════
// Workflow Registry
// ════════════════════════════════════════════════════════════════

const WORKFLOW_REGISTRY: Record<string, WorkflowDef> = {
  "wf-intake-investigation": INTAKE_INVESTIGATION,
  "wf-case-file-builder": CASE_FILE_BUILDER,
  "wf-full-defense": FULL_DEFENSE,
};

export function getWorkflow(id: string): WorkflowDef | undefined {
  return WORKFLOW_REGISTRY[id];
}

export function listWorkflows(): WorkflowDef[] {
  return Object.values(WORKFLOW_REGISTRY);
}
