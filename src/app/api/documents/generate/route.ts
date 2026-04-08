/**
 * Document Generation API
 *
 * POST /api/documents/generate
 *
 * Takes a document type + case context, routes to the Document Drafting team
 * for AI content generation, then renders a court-standard PDF.
 *
 * This is what separates UNYKORN from ChatGPT:
 *   - Governed agents with forbidden actions and escalation triggers
 *   - Court-standard formatting (caption, numbered paragraphs, cert of service)
 *   - Confidence scoring on every output
 *   - Human approval gate before filing
 *   - Real PDF download, not markdown
 */

import { NextRequest, NextResponse } from "next/server";
import { initRuntime, routeTask } from "@/lib/agents/runtime";
import { generateLegalPDF, getDocumentTypes, type DocumentType, type DocumentRequest } from "@/lib/documents/legal-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rate limiter — 3 documents per minute per IP
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60_000;

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const rl = rateLimiter.get(ip);
  if (rl && rl.resetAt > now) {
    if (rl.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum 3 documents per minute." }, { status: 429 });
    }
    rl.count++;
  } else {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  }

  // Parse and validate input
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, caseCaption, caseNumber, court, jurisdiction, movingParty, additionalContext } = body as {
    type?: string; caseCaption?: string; caseNumber?: string; court?: string;
    jurisdiction?: string; movingParty?: string; additionalContext?: string;
  };

  // Validate document type
  const validTypes = getDocumentTypes().map((d) => d.type);
  if (!type || !validTypes.includes(type as DocumentType)) {
    return NextResponse.json({
      error: "Invalid document type",
      validTypes: getDocumentTypes().map((d) => ({ type: d.type, label: d.label })),
    }, { status: 400 });
  }

  if (!caseCaption || typeof caseCaption !== "string" || caseCaption.trim().length < 5) {
    return NextResponse.json({ error: "caseCaption is required (minimum 5 characters)" }, { status: 400 });
  }

  // Apply defaults for optional fields
  const docType = type as DocumentType;
  const typeInfo = getDocumentTypes().find((d) => d.type === docType)!;
  const finalCourt = (court as string)?.trim() || "CIRCUIT COURT";
  const finalJurisdiction = (jurisdiction as string)?.trim() || "";
  const finalCaseNumber = (caseNumber as string)?.trim() || `UNY-${Date.now().toString(36).toUpperCase()}`;
  const finalMovingParty = (movingParty as string)?.trim() || "Defendant";

  // ── AI Content Generation ──
  // Route to document_drafting team — this goes through the real agent executor
  // with governance constraints, forbidden actions, and confidence scoring

  const draftInstruction = buildDraftInstruction(docType, typeInfo.label, caseCaption.trim(), finalCaseNumber, finalCourt, finalJurisdiction, finalMovingParty, (additionalContext as string)?.trim());

  let aiContent: string;
  let agentName: string;
  let confidenceScore: number;
  let model: string;
  let tokensUsed: number;
  let processingTimeMs: number;

  try {
    initRuntime();
    const start = Date.now();
    const result = await routeTask("document_drafting", draftInstruction, {
      context: "Document drafting mode. You are generating the BODY of a legal document. Output ONLY the substantive legal content — numbered paragraphs with legal arguments, facts, and citations. Do NOT include the caption, title, signature block, or certificate of service. Do NOT include any markdown formatting. Write in formal legal prose. Be thorough and cite relevant statutes and case law. Minimum 5 substantive paragraphs.",
    });
    processingTimeMs = Date.now() - start;
    aiContent = result.output;
    agentName = result.agentName || "Document Drafting Agent";
    confidenceScore = result.confidenceScore;
    model = result.model || "unknown";
    tokensUsed = result.tokensUsed || 0;
  } catch (err) {
    // Check if it's a missing API key issue
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: "AI service unavailable — no API key configured",
        detail: "Document generation requires an active AI provider. Contact platform administrator.",
      }, { status: 503 });
    }
    return NextResponse.json({ error: "AI content generation failed", detail: String(err) }, { status: 500 });
  }

  // ── PDF Generation ──
  const docReq: DocumentRequest = {
    type: docType,
    matterId: `UNY-DOC-${Date.now()}`,
    caseCaption: caseCaption.trim(),
    caseNumber: finalCaseNumber,
    court: finalCourt,
    jurisdiction: finalJurisdiction,
    movingParty: finalMovingParty,
    aiDraftedContent: aiContent,
    agentName,
    confidenceScore,
    generatedAt: new Date().toISOString(),
  };

  const doc = await generateLegalPDF(docReq);

  // Return PDF as downloadable file
  return new NextResponse(Buffer.from(doc.pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
      "X-Document-Id": doc.id,
      "X-Agent-Name": doc.agentName,
      "X-Confidence-Score": String(doc.confidenceScore),
      "X-Page-Count": String(doc.pageCount),
      "X-Processing-Time-Ms": String(processingTimeMs),
      "X-Model": model,
      "X-Tokens-Used": String(tokensUsed),
      "X-Disclaimer": doc.disclaimer,
    },
  });
}

// Also support GET to list available document types
export async function GET() {
  return NextResponse.json({
    documentTypes: getDocumentTypes(),
    endpoint: "POST /api/documents/generate",
    requiredFields: ["type", "caseCaption"],
    optionalFields: ["caseNumber", "court", "jurisdiction", "movingParty", "additionalContext"],
    rateLimit: "3 documents per minute per IP",
    note: "Documents are AI-drafted by governed agents and rendered as court-standard PDFs with DRAFT watermark.",
  });
}

// ── Instruction Builder ──

function buildDraftInstruction(
  type: DocumentType, label: string, caption: string, caseNum: string,
  court: string, jurisdiction: string, movingParty: string, additionalContext?: string
): string {
  const base = `Draft the body content for a ${label} in the case of ${caption}, Case No. ${caseNum}, filed in ${court}${jurisdiction ? `, ${jurisdiction}` : ""}. The ${movingParty} is the moving party.`;

  const typeGuidance: Record<string, string> = {
    motion_to_dismiss: "Argue that the charges or claims should be dismissed. Address jurisdictional issues, failure to state a claim, insufficiency of evidence, or applicable statutory defenses. Cite relevant Florida Rules of Criminal Procedure and case law.",
    motion_to_suppress: "Argue that specific evidence should be excluded. Address Fourth Amendment violations, chain of custody issues, Miranda violations, or fruit of the poisonous tree doctrine. Cite relevant suppression case law.",
    motion_for_discovery: "Request specific categories of discovery from the opposing party. List the types of documents, records, and evidence sought. Cite applicable discovery rules and demonstrate relevance and proportionality.",
    motion_for_continuance: "Set forth good cause for postponement. Address scheduling conflicts, need for additional preparation time, witness availability, or newly discovered evidence. Show no prejudice to the opposing party.",
    demand_letter: "State the factual basis for the demand clearly. Specify the relief sought, the deadline for response, and the consequences of non-compliance. Maintain a firm but professional tone.",
    legal_brief: "Present a thorough legal analysis with multiple authorities. Use headings for each argument. Distinguish adverse precedent. Apply the law to the specific facts of this case.",
    cease_and_desist: "Identify the unlawful or objectionable conduct with specificity. Cite the legal basis for demanding cessation. State the deadline and consequences of continued activity.",
    affidavit: "State facts within personal knowledge. Each paragraph should address one factual matter. Use clear, declarative sentences. Include the basis for knowledge of each stated fact.",
    notice_of_appearance: "State that counsel is entering an appearance on behalf of the named party. Include contact information placeholders and request that all future communications be directed to counsel.",
    memorandum_of_law: "Present a comprehensive legal analysis. Organize by issue. For each issue: state the legal standard, cite authorities, apply facts, and conclude. Address counterarguments.",
  };

  const guidance = typeGuidance[type] || "";
  const contextLine = additionalContext ? `\n\nAdditional context from the client: ${additionalContext}` : "";

  return `${base}\n\n${guidance}${contextLine}\n\nIMPORTANT: Output ONLY the body paragraphs. Do not include document headers, captions, signature blocks, or certificates of service — those are generated separately. Write at least 5 substantive paragraphs. Use formal legal prose with proper legal citations.`;
}
