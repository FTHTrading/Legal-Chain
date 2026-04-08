import { NextResponse } from "next/server";

/**
 * POST /api/beta/promote — AI-powered promotional content generation
 *
 * Uses the platform's AI to generate social posts, email campaigns, and
 * beta outreach content optimized for different channels.
 *
 * Body: { channel, topic?, tone?, customPrompt? }
 */

type Channel = "twitter" | "linkedin" | "email" | "reddit" | "discord" | "press_release";

interface PromoteRequest {
  channel: Channel;
  topic?: string;
  tone?: string;
  customPrompt?: string;
}

const PLATFORM_FACTS = {
  name: "UNYKORN // LAW",
  url: "https://law.unykorn.org",
  betaUrl: "https://law.unykorn.org/beta",
  agents: 26,
  chain: "Apostle Chain 7332",
  price: "$25/mo founders rate",
  standardPrice: "$99/mo",
  founderSpots: 100,
  features: [
    "26 AI agents for legal research, strategy, and document drafting",
    "RAG-powered legal knowledge base",
    "Court-standard document generation (10 types)",
    "Blockchain forensics (TRON, ETH, Polygon)",
    "x402 AI-to-AI payment protocol",
    "Full audit trail with hash-chain integrity",
    "Human approval gates — AI suggests, attorneys decide",
  ],
  differentiators: [
    "Real AI agents, not chatbot wrappers",
    "Confidence scoring on all outputs",
    "Attorney review gates — nothing auto-sends",
    "Web3 transparent audit trail",
    "26 specialized agents vs generic AI",
  ],
};

const CHANNEL_TEMPLATES: Record<Channel, { maxLength: number; format: string; guidelines: string }> = {
  twitter: {
    maxLength: 280,
    format: "Short, punchy tweet. Include hashtags. Optional emoji.",
    guidelines: "Lead with a hook. End with CTA. Use #LegalTech #AI #Web3 #LegalAI",
  },
  linkedin: {
    maxLength: 1500,
    format: "Professional post. 3-5 paragraphs. Personal but authoritative.",
    guidelines: "Start with a compelling question or stat. Share insight. CTA to beta signup.",
  },
  email: {
    maxLength: 3000,
    format: "Email with subject line, body, CTA button text. Professional warm tone.",
    guidelines: "Subject < 50 chars. Preview text < 100 chars. Clear value prop. Single CTA.",
  },
  reddit: {
    maxLength: 2000,
    format: "Reddit post title + body. Informative, not salesy. Community-first.",
    guidelines: "Don't be promotional. Share genuine value. Relevant to r/legaltech, r/artificial, r/lawfirm.",
  },
  discord: {
    maxLength: 1000,
    format: "Discord announcement. Casual but professional. Use markdown formatting.",
    guidelines: "Use bold for key points. Include link. Keep it scannable.",
  },
  press_release: {
    maxLength: 5000,
    format: "Professional press release. Headline, dateline, body, boilerplate, contact.",
    guidelines: "AP style. Quote from founder. Include specific metrics. Newsworthy angle.",
  },
};

export async function POST(request: Request) {
  try {
    const body: PromoteRequest = await request.json();
    const { channel, topic, tone, customPrompt } = body;

    if (!channel || !CHANNEL_TEMPLATES[channel]) {
      return NextResponse.json(
        { error: "Invalid channel. Use: twitter, linkedin, email, reddit, discord, press_release" },
        { status: 400 }
      );
    }

    const template = CHANNEL_TEMPLATES[channel];
    const topicContext = topic || "beta launch announcement";
    const toneContext = tone || "professional but bold";

    // Build the generation prompt
    const systemPrompt = `You are the marketing AI for ${PLATFORM_FACTS.name}, an AI-powered legal intelligence platform.

PLATFORM FACTS:
- ${PLATFORM_FACTS.agents} specialized AI agents for legal work
- ${PLATFORM_FACTS.price} (first 100 founders), then ${PLATFORM_FACTS.standardPrice}
- Built on ${PLATFORM_FACTS.chain} with x402 payment protocol
- Features: ${PLATFORM_FACTS.features.join("; ")}
- Key differentiators: ${PLATFORM_FACTS.differentiators.join("; ")}
- Beta signup: ${PLATFORM_FACTS.betaUrl}
- Live site: ${PLATFORM_FACTS.url}

CHANNEL: ${channel}
FORMAT: ${template.format}
MAX LENGTH: ${template.maxLength} characters
GUIDELINES: ${template.guidelines}
TONE: ${toneContext}

Generate compelling ${channel} content about: ${topicContext}
${customPrompt ? `ADDITIONAL CONTEXT: ${customPrompt}` : ""}

Return the content ONLY — no explanations, no meta-commentary. Just the ready-to-post content.`;

    // Use OpenAI if available, otherwise generate template-based content
    let content: string;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey && !openaiKey.startsWith("sk-...")) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a ${channel} post about ${topicContext}. Tone: ${toneContext}.` },
          ],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      });
      const data = await res.json();
      content = data.choices?.[0]?.message?.content || generateFallbackContent(channel, topicContext);
    } else {
      content = generateFallbackContent(channel, topicContext);
    }

    return NextResponse.json({
      ok: true,
      channel,
      topic: topicContext,
      content,
      characterCount: content.length,
      maxLength: template.maxLength,
      generatedAt: new Date().toISOString(),
      readyToPost: content.length <= template.maxLength,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Content generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateFallbackContent(channel: Channel, topic: string): string {
  const templates: Record<Channel, string> = {
    twitter: `🚀 UNYKORN // LAW is now in beta. 26 AI agents for legal research, document drafting & blockchain forensics. $25/mo for first 100 founders.\n\nNot a chatbot — real agentic AI with attorney review gates.\n\nJoin the beta → law.unykorn.org/beta\n\n#LegalTech #AI #Web3 #LegalAI`,
    linkedin: `We just launched UNYKORN // LAW into beta.\n\nHere's why it matters: The legal industry is drowning in manual research, document drafting, and case management. We built 26 specialized AI agents that handle the heavy lifting — while keeping attorneys in control.\n\nWhat makes this different from ChatGPT for legal:\n→ Confidence scoring on every output\n→ Human approval gates — nothing auto-sends\n→ Court-standard document generation\n→ Blockchain forensics across TRON, ETH, and Polygon\n→ Full audit trail with hash-chain integrity\n\nFirst 100 beta testers get the $25/mo founder rate (standard will be $99/mo).\n\nIf you work in legal tech, defense, or civil litigation — I'd love your feedback.\n\n→ law.unykorn.org/beta`,
    email: `Subject: You're invited to the UNYKORN // LAW beta\n\nHi there,\n\n26 AI agents. Court-standard documents. Blockchain forensics. One platform.\n\nWe're opening UNYKORN // LAW to beta testers — and you're invited.\n\nWhat you get:\n• Full access to 26 specialized legal AI agents\n• Document drafting (motions, briefs, demand letters)\n• RAG-powered legal research\n• Blockchain forensic tracing\n• $25/mo founder rate (locked forever)\n\nThis isn't a chatbot wrapper. It's a real agentic system with confidence scoring, attorney review gates, and a transparent audit trail.\n\nJoin the beta → law.unykorn.org/beta\n\n— The UNYKORN Team`,
    reddit: `**[Show & Tell] We built an AI legal platform with 26 specialized agents — now in beta**\n\nHey everyone,\n\nWe've been building UNYKORN // LAW — an AI-powered legal intelligence platform with 26 AI agents, each specialized for different legal tasks (research, drafting, evidence analysis, forensics, strategy).\n\nKey technical details:\n- RAG pipeline for legal knowledge retrieval\n- Confidence scoring (0-1) on all outputs\n- Human approval gates — AI never auto-sends anything\n- Court-standard PDF generation (10 document types)\n- Blockchain forensics (TRON, ETH, Polygon wallet tracing)\n- Built on Apostle Chain (7332) with x402 protocol for transparent billing\n\nWe're looking for beta testers who work in legal tech, defense, or civil litigation to stress-test the system and give candid feedback.\n\nBeta: law.unykorn.org/beta\n\nHappy to answer technical questions.`,
    discord: `# 🏛️ UNYKORN // LAW — Beta Now Open\n\n**26 AI agents** for legal research, document drafting, and blockchain forensics.\n\n**What's included:**\n→ Court-standard document generation\n→ RAG-powered legal research\n→ Blockchain forensic tracing\n→ Confidence scoring on all outputs\n→ Attorney review gates\n\n**Founder rate:** $25/mo (first 100 testers)\n\n**Join →** law.unykorn.org/beta`,
    press_release: `FOR IMMEDIATE RELEASE\n\nUNYKORN Launches AI Legal Intelligence Platform with 26 Specialized AI Agents\n\nPlatform combines agentic AI, blockchain forensics, and Web3 transparency for legal professionals\n\nATLANTA, GA — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} — UNYKORN today announced the beta launch of UNYKORN // LAW, an AI-powered legal intelligence platform featuring 26 specialized AI agents designed for legal research, document drafting, evidence analysis, and blockchain forensics.\n\nUnlike general-purpose AI chatbots, UNYKORN // LAW employs purpose-built agents with confidence scoring, human approval gates, and a hash-chained audit trail to ensure accuracy and accountability.\n\n"We didn't build another ChatGPT wrapper," said Kevan Burns, founder of UNYKORN. "Every output has a confidence score. Every action goes through attorney review. Nothing auto-sends. This is what responsible legal AI looks like."\n\nThe platform generates court-standard documents across 10 types, conducts blockchain forensic analysis across TRON, Ethereum, and Polygon networks, and operates on Apostle Chain (7332) for transparent, immutable legal record-keeping.\n\nBeta access is available at law.unykorn.org/beta with a founder rate of $25/month for the first 100 testers.\n\nAbout UNYKORN\nUNYKORN builds AI-powered platforms for legal advocacy, financial technology, and Web3 infrastructure. The company operates on Apostle Chain (7332) using the x402 AI-to-AI payment protocol.\n\nContact: legal@unykorn.org\nWebsite: law.unykorn.org`,
  };

  return templates[channel] || templates.twitter;
}

/**
 * GET /api/beta/promote — List available channels
 */
export async function GET() {
  return NextResponse.json({
    channels: Object.entries(CHANNEL_TEMPLATES).map(([id, tmpl]) => ({
      id,
      maxLength: tmpl.maxLength,
      format: tmpl.format,
    })),
    platformFacts: {
      name: PLATFORM_FACTS.name,
      url: PLATFORM_FACTS.url,
      betaUrl: PLATFORM_FACTS.betaUrl,
      agents: PLATFORM_FACTS.agents,
    },
  });
}
