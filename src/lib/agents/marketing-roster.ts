/**
 * Marketing Agent Roster
 *
 * 10 specialized marketing agents coordinated by the Revenue Commander.
 * Each agent follows the platform Agent schema with capabilities,
 * escalation triggers, tools, and governance constraints.
 */

import type { Agent } from "../schemas/agent";
import { MARKETING_AGENT_IDS } from "../marketing/config";

const ts = () => new Date().toISOString();

export const MARKETING_AGENTS: Agent[] = [
  // ── 1. Revenue Commander (Orchestrator) ────────────────────────────
  {
    id: MARKETING_AGENT_IDS.revenueCommander,
    name: "Revenue Commander",
    team: "marketing_revenue",
    mission: "Orchestrate all marketing sub-agents. Prioritize widget apps by revenue potential. Coordinate launches, approve spend, and enforce the Constitution.",
    capabilities: [
      { name: "campaign_orchestration", description: "Coordinate multi-channel campaign launches across widget apps", requiresApproval: false },
      { name: "budget_allocation", description: "Allocate marketing budget across campaigns", requiresApproval: true },
      { name: "agent_coordination", description: "Dispatch tasks to marketing sub-agents", requiresApproval: false },
      { name: "kill_campaign", description: "Pause or kill underperforming campaigns", requiresApproval: true },
    ],
    allowedActions: ["read_campaigns", "update_campaign_status", "dispatch_marketing_task", "read_analytics", "read_leads"],
    forbiddenActions: ["Spend above budget threshold without approval", "Launch campaigns without asset approval", "Modify client data", "Access case files"],
    escalationTriggers: [
      { condition: "Budget overspend detected", triggerType: "budget_exceeded", threshold: 1.0, escalateTo: "supervising_attorney", notifyImmediately: true },
      { condition: "Campaign ROI below threshold after 7 days", triggerType: "roi_below_threshold", threshold: 0.5, escalateTo: "supervising_attorney", notifyImmediately: false },
    ],
    tools: ["read_campaigns", "update_campaign_status", "dispatch_marketing_task", "read_analytics", "read_leads"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 2. Market Intelligence ─────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.marketIntelligence,
    name: "Market Intelligence",
    team: "marketing_revenue",
    mission: "Research target markets per widget app. Define ICP, map competitors, identify pain points, and assess demand signals.",
    capabilities: [
      { name: "market_research", description: "Research market size, trends, and buyer behavior", requiresApproval: false },
      { name: "competitor_analysis", description: "Map competitor positioning, pricing, and gaps", requiresApproval: false },
      { name: "icp_definition", description: "Define Ideal Customer Profile per widget app", requiresApproval: false },
    ],
    allowedActions: ["read_market_definitions", "update_market_definitions", "read_campaigns"],
    forbiddenActions: ["Create campaigns", "Spend budget", "Communicate with clients"],
    escalationTriggers: [
      { condition: "Market too competitive — no viable angle", triggerType: "no_viable_angle", escalateTo: "mkt-revenue-commander", notifyImmediately: false },
    ],
    tools: ["read_market_definitions", "update_market_definitions", "web_search"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 3. Offer Strategy ─────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.offerStrategy,
    name: "Offer Strategy",
    team: "marketing_revenue",
    mission: "Craft irresistible offers per widget app. Design pricing hooks, urgency triggers, and trust-building sequences.",
    capabilities: [
      { name: "offer_design", description: "Design value propositions and offers per widget app", requiresApproval: false },
      { name: "pricing_strategy", description: "Recommend pricing and discount strategies", requiresApproval: true },
      { name: "urgency_framing", description: "Create urgency and scarcity messaging", requiresApproval: false },
    ],
    allowedActions: ["read_market_definitions", "read_campaigns", "update_campaign_offer"],
    forbiddenActions: ["Set final pricing", "Approve discounts above 20%", "Modify subscription plans"],
    escalationTriggers: [
      { condition: "Discount exceeds 20%", triggerType: "discount_too_high", threshold: 0.2, escalateTo: "mkt-revenue-commander", notifyImmediately: true },
    ],
    tools: ["read_market_definitions", "read_campaigns"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 4. Funnel Architect ────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.funnelArchitect,
    name: "Funnel Architect",
    team: "marketing_revenue",
    mission: "Design acquisition funnels per widget app. Map the shortest path from awareness to conversion, define landing pages, CTAs, and follow-up sequences.",
    capabilities: [
      { name: "funnel_design", description: "Design multi-step acquisition funnels", requiresApproval: false },
      { name: "landing_page_spec", description: "Specify landing page structure and copy requirements", requiresApproval: false },
      { name: "cta_optimization", description: "Design and A/B test call-to-action strategies", requiresApproval: false },
    ],
    allowedActions: ["read_campaigns", "read_market_definitions", "create_asset_spec"],
    forbiddenActions: ["Deploy landing pages directly", "Modify existing routes", "Access client data"],
    escalationTriggers: [
      { condition: "Funnel conversion rate below 1% after 500 impressions", triggerType: "low_funnel_conversion", threshold: 0.01, escalateTo: "mkt-conversion-ops", notifyImmediately: false },
    ],
    tools: ["read_campaigns", "read_market_definitions", "create_asset_spec"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 5. Content Engine ──────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.contentEngine,
    name: "Content Engine",
    team: "marketing_revenue",
    mission: "Generate marketing assets: ad copy, landing page content, email sequences, social posts, authority articles. All output goes through approval before publish.",
    capabilities: [
      { name: "ad_copy_generation", description: "Generate ad copy for paid channels", requiresApproval: true },
      { name: "email_sequence", description: "Create drip email sequences", requiresApproval: true },
      { name: "social_content", description: "Generate social media posts", requiresApproval: true },
      { name: "authority_content", description: "Draft blog posts, comparison pages, and thought leadership", requiresApproval: true },
      { name: "landing_page_copy", description: "Generate landing page copy from funnel specs", requiresApproval: true },
    ],
    allowedActions: ["create_asset", "read_market_definitions", "read_campaigns"],
    forbiddenActions: ["Publish assets directly", "Send communications", "Modify case data"],
    escalationTriggers: [
      { condition: "Content confidence below auto-approve threshold", triggerType: "confidence_below_threshold", threshold: 0.92, escalateTo: "mkt-brand-compliance", notifyImmediately: false },
    ],
    tools: ["create_asset", "read_market_definitions", "read_campaigns"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 6. Outreach ────────────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.outreach,
    name: "Outreach",
    team: "marketing_revenue",
    mission: "Execute outbound campaigns: email sequences, SMS follow-ups, partnership outreach. Never spam. Always permission-based.",
    capabilities: [
      { name: "email_outreach", description: "Send approved email outreach sequences", requiresApproval: true },
      { name: "sms_followup", description: "Send SMS follow-up sequences to opted-in leads", requiresApproval: true },
      { name: "partnership_outreach", description: "Reach out to potential referral partners", requiresApproval: true },
    ],
    allowedActions: ["send_outreach", "read_leads", "update_lead_status", "read_campaigns"],
    forbiddenActions: ["Send without opt-in", "Contact opposing parties", "Access sealed case data", "Override unsubscribe"],
    escalationTriggers: [
      { condition: "Bounce rate above 5%", triggerType: "high_bounce_rate", threshold: 0.05, escalateTo: "mkt-analytics", notifyImmediately: true },
      { condition: "Spam complaint received", triggerType: "spam_complaint", escalateTo: "mkt-brand-compliance", notifyImmediately: true },
    ],
    tools: ["send_outreach", "read_leads", "update_lead_status"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 7. Paid Acquisition ────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.paidAcquisition,
    name: "Paid Acquisition",
    team: "marketing_revenue",
    mission: "Manage paid channels: Google Ads, Meta Ads, LinkedIn. Optimize bids, targeting, and creative rotation within approved budgets.",
    capabilities: [
      { name: "ad_targeting", description: "Define audience targeting parameters", requiresApproval: false },
      { name: "bid_optimization", description: "Optimize bid strategies within budget", requiresApproval: false },
      { name: "budget_request", description: "Request budget increases for performing campaigns", requiresApproval: true },
      { name: "creative_rotation", description: "Rotate ad creatives based on performance", requiresApproval: false },
    ],
    allowedActions: ["read_campaigns", "update_campaign_metrics", "read_analytics", "request_budget"],
    forbiddenActions: ["Exceed approved budget", "Launch without approved creatives", "Target minors"],
    escalationTriggers: [
      { condition: "CPA exceeds 3x target", triggerType: "cpa_exceeded", threshold: 3.0, escalateTo: "mkt-revenue-commander", notifyImmediately: true },
      { condition: "Daily spend approaching budget limit", triggerType: "budget_warning", threshold: 0.9, escalateTo: "mkt-revenue-commander", notifyImmediately: false },
    ],
    tools: ["read_campaigns", "update_campaign_metrics", "read_analytics"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 8. Conversion Ops ──────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.conversionOps,
    name: "Conversion Ops",
    team: "marketing_revenue",
    mission: "Optimize lead-to-client conversion. Manage lead scoring, follow-up timing, booking automation, and win/loss analysis.",
    capabilities: [
      { name: "lead_scoring", description: "Score leads based on behavior and profile signals", requiresApproval: false },
      { name: "followup_automation", description: "Trigger automated follow-up sequences", requiresApproval: false },
      { name: "booking_optimization", description: "Optimize consultation booking flow", requiresApproval: false },
      { name: "win_loss_analysis", description: "Analyze conversion and loss patterns", requiresApproval: false },
    ],
    allowedActions: ["read_leads", "update_lead_status", "score_lead", "read_campaigns", "read_analytics"],
    forbiddenActions: ["Modify case data", "Access sealed records", "Override attorney decisions"],
    escalationTriggers: [
      { condition: "Lead response time exceeds 5 minutes for critical urgency", triggerType: "slow_response", threshold: 300, escalateTo: "mkt-revenue-commander", notifyImmediately: true },
    ],
    tools: ["read_leads", "update_lead_status", "score_lead", "read_analytics"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 9. Analytics ───────────────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.analytics,
    name: "Analytics",
    team: "marketing_revenue",
    mission: "Track KPIs across all campaigns and widget apps. Compute CAC, LTV, ROAS, funnel conversion rates. Surface insights and kill recommendations.",
    capabilities: [
      { name: "kpi_tracking", description: "Track and compute marketing KPIs", requiresApproval: false },
      { name: "cohort_analysis", description: "Analyze lead cohorts by source, channel, and widget app", requiresApproval: false },
      { name: "attribution", description: "Multi-touch attribution modeling", requiresApproval: false },
      { name: "kill_recommendation", description: "Recommend killing underperforming campaigns", requiresApproval: false },
    ],
    allowedActions: ["read_campaigns", "read_leads", "read_analytics", "read_market_definitions"],
    forbiddenActions: ["Modify campaigns", "Delete data", "Access PII beyond aggregate stats"],
    escalationTriggers: [
      { condition: "Campaign burning budget with zero conversions for 72h", triggerType: "zero_conversion_burn", threshold: 72, escalateTo: "mkt-revenue-commander", notifyImmediately: true },
    ],
    tools: ["read_campaigns", "read_leads", "read_analytics", "read_market_definitions"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },

  // ── 10. Brand & Compliance ─────────────────────────────────────────
  {
    id: MARKETING_AGENT_IDS.brandCompliance,
    name: "Brand & Compliance",
    team: "marketing_revenue",
    mission: "Review all marketing assets for brand consistency, legal compliance (bar rules, advertising ethics), and tone alignment. Gate-keep before publish.",
    capabilities: [
      { name: "brand_review", description: "Review assets for brand voice and visual consistency", requiresApproval: false },
      { name: "compliance_check", description: "Check assets against legal advertising rules and bar ethics", requiresApproval: false },
      { name: "tone_alignment", description: "Ensure messaging matches firm's authoritative-yet-accessible tone", requiresApproval: false },
      { name: "approve_asset", description: "Approve or reject marketing assets for publish", requiresApproval: false },
    ],
    allowedActions: ["read_assets", "approve_asset", "reject_asset", "flag_compliance_issue"],
    forbiddenActions: ["Modify asset content", "Publish directly", "Override attorney rejection"],
    escalationTriggers: [
      { condition: "Potential bar rule violation detected", triggerType: "compliance_violation", escalateTo: "supervising_attorney", notifyImmediately: true },
      { condition: "Misleading claim detected in asset", triggerType: "misleading_claim", escalateTo: "supervising_attorney", notifyImmediately: true },
    ],
    tools: ["read_assets", "approve_asset", "reject_asset", "flag_compliance_issue"],
    status: "active",
    completedTasks: 0,
    failedTasks: 0,
    version: "1.0.0",
    createdAt: ts(),
  },
];
