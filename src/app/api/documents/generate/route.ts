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

  const { type, caseCaption, caseNumber, court, jurisdiction, movingParty, additionalContext, attorneyName } = body as {
    type?: string; caseCaption?: string; caseNumber?: string; court?: string;
    jurisdiction?: string; movingParty?: string; additionalContext?: string; attorneyName?: string;
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

  const hasApiKey = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

  if (hasApiKey) {
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
      return NextResponse.json({ error: "AI content generation failed", detail: String(err) }, { status: 500 });
    }
  } else {
    // ── Fallback: high-quality template content for beta testers ──
    const start = Date.now();
    aiContent = generateFallbackContent(docType, caseCaption.trim(), finalCaseNumber, finalMovingParty, finalCourt, finalJurisdiction);
    processingTimeMs = Date.now() - start;
    agentName = "Scribe-7 (Document Drafting)";
    confidenceScore = 0.78;
    model = "template-v2.0";
    tokensUsed = 0;
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
    attorneyName: (attorneyName as string)?.trim() || undefined,
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

// ── Fallback Content Generator ──
// Produces high-quality template legal content when no AI API key is configured.
// This ensures beta testers can see the full PDF generation pipeline working.

function generateFallbackContent(
  type: DocumentType,
  caption: string,
  caseNum: string,
  movingParty: string,
  court: string,
  jurisdiction: string,
): string {
  const captionParts = caption.split(" v. ");
  const partyA = captionParts[0]?.trim() || "PLAINTIFF";
  const partyB = captionParts[1]?.trim() || "DEFENDANT";

  const templates: Record<string, string> = {
    motion_to_dismiss: `The ${movingParty} respectfully submits that the Complaint fails to state a claim upon which relief can be granted and should be dismissed with prejudice pursuant to applicable rules of civil procedure.

Upon careful review of the allegations contained in the Complaint, it is apparent that the Plaintiff has failed to plead sufficient facts to support the essential elements of the asserted causes of action. The mere recitation of legal conclusions, absent supporting factual allegations, is insufficient to survive a motion to dismiss. See Bell Atlantic Corp. v. Twombly, 550 U.S. 544, 555 (2007) (requiring "enough facts to state a claim to relief that is plausible on its face").

Furthermore, the Complaint fails to establish that this Court has proper jurisdiction over the subject matter or the parties. The ${movingParty} is not domiciled within this judicial circuit, and the alleged conduct did not occur within the territorial boundaries of ${jurisdiction || "this jurisdiction"}. Without a proper basis for personal jurisdiction, this Court lacks authority to adjudicate the claims asserted.

The statute of limitations applicable to the claims alleged in the Complaint has expired. The operative facts, as pled, occurred more than the statutorily prescribed period prior to the filing of the Complaint. The ${movingParty} raised this affirmative defense at the earliest opportunity, and the Plaintiff cannot establish any basis for tolling or equitable estoppel.

Additionally, the Plaintiff has failed to exhaust available administrative remedies as required by law prior to initiating this action. The failure to exhaust administrative remedies deprives this Court of subject matter jurisdiction and warrants dismissal without prejudice to refile after proper administrative proceedings have been completed.

For all of the foregoing reasons, and for such other good cause as may appear, the ${movingParty} respectfully requests that this Honorable Court grant this Motion to Dismiss and enter an order dismissing the Complaint in its entirety, with prejudice, and awarding the ${movingParty} costs and attorney's fees as permitted by law.`,

    motion_to_suppress: `The ${movingParty} moves this Honorable Court for an Order suppressing all evidence obtained as a result of the unlawful search and seizure conducted on or about the date alleged in the charging instrument, as such evidence was obtained in direct violation of the Fourth and Fourteenth Amendments to the United States Constitution and corresponding state constitutional provisions.

On the date in question, law enforcement officers conducted a search of the ${movingParty}'s person, vehicle, and/or residence without a valid search warrant, without valid consent, and without the existence of any recognized exception to the warrant requirement. The search was conducted without probable cause and without reasonable suspicion of criminal activity. See Mapp v. Ohio, 367 U.S. 643 (1961); Wong Sun v. United States, 371 U.S. 471 (1963).

The evidence obtained as a result of the unlawful search constitutes "fruit of the poisonous tree" and must be suppressed in its entirety. The exclusionary rule, as established by the United States Supreme Court, mandates the suppression of all evidence derived from unlawful government conduct, including any derivative evidence that would not have been discovered but for the initial constitutional violation. See Silverthorne Lumber Co. v. United States, 251 U.S. 385 (1920).

Furthermore, any statements made by the ${movingParty} during or after the unlawful search were obtained in violation of the Fifth Amendment right against self-incrimination and the Sixth Amendment right to counsel. The ${movingParty} was not advised of Miranda rights prior to custodial interrogation, and any statements obtained must be suppressed. See Miranda v. Arizona, 384 U.S. 436 (1966).

The chain of custody for the physical evidence has been compromised due to improper collection, documentation, and storage procedures employed by the investigating officers. The integrity of the evidence cannot be verified, and its admission would be prejudicial to the ${movingParty}.

The ${movingParty} respectfully requests that this Court conduct an evidentiary hearing on this Motion, at which the State shall bear the burden of demonstrating that the evidence was lawfully obtained. Absent such showing, all evidence obtained as a result of the unlawful search and seizure should be suppressed.`,

    motion_for_discovery: `The ${movingParty} moves this Honorable Court for an Order compelling the opposing party to produce all documents, records, and electronically stored information responsive to the discovery requests served on the opposing party, which remain unanswered beyond the time permitted by applicable rules.

The ${movingParty} served comprehensive discovery requests upon the opposing party, including Interrogatories, Requests for Production of Documents, and Requests for Admission, on the dates set forth in the certificate of service filed with this Court. Despite the expiration of the applicable response period, the opposing party has failed to provide complete and substantive responses.

The discovery sought is directly relevant to the claims and defenses in this action and is proportional to the needs of the case, considering the importance of the issues at stake, the amount in controversy, the parties' relative access to relevant information, and the importance of the discovery in resolving the issues. See Fed. R. Civ. P. 26(b)(1).

Specifically, the ${movingParty} seeks: (a) all documents relating to communications between the parties during the relevant time period; (b) all financial records, bank statements, and transaction histories pertaining to the subject matter of this litigation; (c) all contracts, agreements, and amendments relevant to the dispute; (d) all electronic communications, including emails, text messages, and instant messages; and (e) all expert reports, analyses, and opinions obtained by the opposing party.

The opposing party's failure to produce responsive documents has prejudiced the ${movingParty}'s ability to prepare for trial and has resulted in unnecessary delay and expense. The ${movingParty} has made good faith efforts to resolve this discovery dispute without court intervention, as required by applicable rules, but those efforts have been unsuccessful.

The ${movingParty} respectfully requests that this Court enter an Order compelling production within fourteen (14) days and awarding the ${movingParty} reasonable expenses, including attorney's fees, incurred in bringing this Motion.`,

    motion_for_continuance: `The ${movingParty} respectfully moves this Honorable Court for a continuance of the hearing/trial currently scheduled in this matter, and in support thereof states that good cause exists for the requested postponement and that no prejudice will result to the opposing party.

The ${movingParty}'s counsel has a previously scheduled professional commitment that conflicts with the currently scheduled hearing date. Counsel's presence is required at a deposition in a related matter in another jurisdiction on the same date, and the deposition cannot be rescheduled without significant prejudice to the parties in that proceeding.

Additionally, the ${movingParty} has recently obtained new counsel who requires adequate time to review the case file, conduct independent investigation, and prepare for the scheduled proceedings. Denying the requested continuance would deprive the ${movingParty} of the effective assistance of counsel and would result in manifest injustice.

Critical witnesses necessary for the ${movingParty}'s case are unavailable on the currently scheduled date due to documented medical and travel limitations. The ${movingParty} has exercised due diligence in attempting to secure the attendance of these witnesses and has been unable to do so for the current date.

The ${movingParty} proposes rescheduling the hearing/trial to a date within thirty (30) days of the currently scheduled date. The ${movingParty} is available on alternate dates and will cooperate with the Court and opposing counsel to identify a mutually agreeable date.

This is the ${movingParty}'s first request for a continuance in this matter. No previous continuances have been granted at the ${movingParty}'s request. The opposing party will not be prejudiced by a brief continuance, as all discovery remains open and no trial deadlines will be affected.`,

    demand_letter: `${partyA} hereby demands that ${partyB} immediately cease and remedy the conduct described herein and provide full compensation for all damages sustained as a result of the wrongful actions taken by ${partyB}.

The facts giving rise to this demand are as follows: ${partyA} and ${partyB} entered into a contractual and/or legal relationship, the terms and obligations of which are well known to both parties. ${partyB} has breached its obligations under this relationship through specific acts and omissions that have caused substantial and quantifiable harm to ${partyA}.

As a direct and proximate result of ${partyB}'s conduct, ${partyA} has suffered the following damages: (a) direct financial losses; (b) consequential damages including lost business opportunities and revenue; (c) costs incurred in mitigation of damages; (d) emotional distress and reputational harm; and (e) attorney's fees and costs associated with this matter. The total amount of damages sustained by ${partyA} is being calculated and will be presented at the appropriate time.

${partyA} demands that ${partyB} take the following actions within thirty (30) days of receipt of this letter: (1) provide a full and complete accounting of all relevant transactions and communications; (2) remit payment in the amount to be determined for all damages sustained; (3) cease all conduct that is the subject of this demand; and (4) provide written assurance that such conduct will not recur.

Should ${partyB} fail to comply with the demands set forth herein within the time specified, ${partyA} will pursue all available legal remedies, including but not limited to filing a civil action seeking compensatory damages, punitive damages, injunctive relief, and attorney's fees and costs. This letter is not intended to be, and should not be construed as, a complete statement of ${partyA}'s legal rights and remedies, all of which are expressly reserved.

${partyA} prefers to resolve this matter amicably and without the necessity of litigation. However, ${partyA} is fully prepared to litigate this matter to conclusion if a satisfactory resolution cannot be reached promptly.`,

    legal_brief: `This Brief is submitted in support of the position of ${movingParty} in the above-captioned matter. The legal issues presented herein are of significant importance and require careful analysis of applicable statutory provisions, administrative regulations, and judicial precedent.

STATEMENT OF FACTS: The material facts relevant to the legal issues presented in this Brief are as follows. The parties entered into a transaction or relationship that gave rise to the operative facts of this case. The relevant events occurred within the territorial jurisdiction of this Court and within the applicable limitations period. The ${movingParty} has standing to raise the legal issues presented herein and has exhausted all available administrative remedies.

ARGUMENT I: APPLICABLE LEGAL STANDARD. The standard of review applicable to the issues presented in this Brief is well established. Under controlling precedent, the moving party bears the burden of demonstrating entitlement to the relief sought by a preponderance of the evidence. The legal standard requires a showing that the facts, viewed in the light most favorable to the non-moving party, establish all essential elements of the asserted claim or defense.

ARGUMENT II: APPLICATION OF LAW TO FACTS. Applying the applicable legal standard to the undisputed material facts of this case, it is clear that the ${movingParty}'s position is supported by controlling authority. The operative facts satisfy each element required under the applicable legal framework. The opposing party's arguments to the contrary are without merit and are contradicted by the weight of authority.

ARGUMENT III: POLICY CONSIDERATIONS. Beyond the strict application of legal precedent, strong policy considerations support the ${movingParty}'s position. Courts have consistently recognized the importance of enforcing the legal principles at issue in this case to promote certainty, fairness, and the orderly administration of justice.

CONCLUSION: For the reasons set forth above, the ${movingParty} respectfully requests that this Court rule in favor of the ${movingParty} on the issues presented in this Brief and grant all relief requested.`,

    cease_and_desist: `${partyA} hereby demands that ${partyB} immediately cease and desist from all unlawful, unauthorized, and injurious conduct described herein. This notice constitutes a formal demand and serves as notice that legal action will be initiated if the described conduct does not cease immediately.

${partyB} has engaged in conduct that is harmful, unauthorized, and in violation of applicable law, including but not limited to: unauthorized use of proprietary information, intellectual property, trade secrets, and/or confidential materials belonging to ${partyA}; publication and dissemination of false, misleading, or defamatory statements concerning ${partyA}; interference with ${partyA}'s business relationships and contractual obligations; and other conduct that has caused and continues to cause irreparable harm.

The conduct described herein violates applicable state and federal laws, including but not limited to statutes governing unfair business practices, intellectual property rights, defamation, and tortious interference. ${partyA}'s rights under these statutes are clear, and ${partyB}'s conduct constitutes actionable violations for which ${partyA} is entitled to injunctive relief and monetary damages.

${partyA} demands that ${partyB}: (1) immediately cease all conduct described in this notice; (2) remove all infringing, defamatory, or unauthorized materials from all platforms and media; (3) provide written confirmation within ten (10) days of receipt of this notice that all such conduct has ceased; and (4) preserve all documents and communications relevant to this matter.

Failure to comply with this demand will result in ${partyA} pursuing all available legal remedies without further notice, including seeking a temporary restraining order, preliminary injunction, and permanent injunction, as well as compensatory damages, statutory damages, punitive damages, and attorney's fees and costs.`,

    affidavit: `I, the undersigned affiant, being first duly sworn, do hereby depose and state as follows, based upon my personal knowledge, unless otherwise indicated:

I am over the age of eighteen (18) years and am competent to make this affidavit. I have personal knowledge of the facts stated herein and, if called as a witness, could and would competently testify to the matters set forth below.

I am a party to, or have direct knowledge of, the matters at issue in the above-captioned case, ${caption}, Case No. ${caseNum}. My knowledge of the facts stated herein is derived from my direct personal observation, my review of contemporaneous business records and documents, and my participation in the events described.

The following facts are true and correct to the best of my knowledge and belief: The events giving rise to this matter occurred on specific dates and at specific locations known to both parties. I observed or participated in the relevant transactions and communications. The documents referenced in this affidavit are true and accurate copies of the originals, which are in my possession or are available for inspection.

I have reviewed the filings and pleadings in this case and can attest that the factual representations made on behalf of my position are accurate and supported by documentary evidence. I have no personal interest in the outcome of this case beyond those interests disclosed to the Court.

I declare under penalty of perjury that the foregoing statements are true and correct. I understand that any false statement made herein may subject me to criminal prosecution for perjury. This affidavit is executed voluntarily and without coercion, duress, or undue influence.`,

    notice_of_appearance: `Undersigned counsel hereby enters an appearance in the above-captioned matter on behalf of ${movingParty === "Defendant" ? partyB : partyA}.

Counsel represents that this appearance is authorized by the client named above and that counsel is admitted to practice before this Court and is in good standing with the applicable bar. Counsel's contact information for purposes of all future communications, pleadings, and notices is set forth in the signature block below.

All future communications, notices, pleadings, discovery requests, and other correspondence in this matter should be directed exclusively to undersigned counsel at the address shown below. Service upon the client directly is no longer appropriate after entry of this Notice of Appearance.

Counsel respectfully requests that the Clerk of Court update the case file to reflect this entry of appearance and that all parties and counsel of record be notified of the same. Counsel further requests copies of all pending motions, notices, and orders that have been filed or entered in this case.

Counsel is prepared to participate in any scheduled hearings, conferences, or other proceedings in this matter and requests notice of all such events. If any deadlines or proceedings are currently pending, counsel requests a reasonable period to familiarize with the case file and prepare accordingly.`,

    memorandum_of_law: `This Memorandum of Law is submitted in support of the ${movingParty}'s position in the above-captioned matter. The issues presented herein require analysis of constitutional provisions, statutory authority, administrative regulations, and binding judicial precedent.

I. PRELIMINARY STATEMENT. This case presents the Court with significant legal questions concerning the rights and obligations of the parties under applicable law. The ${movingParty} submits that the applicable legal authorities clearly support the relief requested, and that the opposing party's position is contrary to established precedent and sound legal reasoning.

II. STATEMENT OF FACTS. The material facts are not in substantial dispute. The parties entered into the relationship or transaction at issue, and the events giving rise to this litigation are documented in the record before the Court. The ${movingParty} has acted in good faith and in compliance with all applicable legal requirements throughout the relevant time period.

III. LEGAL ANALYSIS. The controlling legal standard is well established in this jurisdiction. Under applicable precedent, the ${movingParty} is required to demonstrate the essential elements of the claim or defense by the applicable evidentiary standard. The undisputed facts of this case satisfy each required element.

IV. RESPONSE TO OPPOSING ARGUMENTS. The opposing party's legal arguments fail for several reasons. First, the authorities cited by the opposing party are distinguishable on their facts and do not control the outcome of this case. Second, the opposing party's interpretation of the applicable statute is inconsistent with the plain language of the text and the legislative history. Third, the policy considerations favoring the opposing party's position are outweighed by the stronger interests supporting the ${movingParty}'s position.

V. CONCLUSION. For all of the foregoing reasons, the ${movingParty} respectfully requests that this Court adopt the legal analysis set forth in this Memorandum and grant the relief requested.`,
  };

  return templates[type] || templates.legal_brief;
}
