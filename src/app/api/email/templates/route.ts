// GET  /api/email/templates — List available email templates
// POST /api/email/templates — Create a custom email template
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import { BUILT_IN_TEMPLATES } from '@/lib/email/templates';

export async function GET() {
  await requirePermission('comms:review');

  const dbTemplates = await db.emailTemplate.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    builtIn: BUILT_IN_TEMPLATES.map((t) => ({
      slug: t.slug,
      name: t.name,
      templateType: t.templateType,
      fromIdentity: t.fromIdentity,
      requiresApproval: t.requiresApproval,
    })),
    custom: dbTemplates,
  });
}

export async function POST(req: NextRequest) {
  await requirePermission('comms:send');

  const body = await req.json();
  const { slug, templateType, name, subject, bodyHtml, bodyText, fromIdentity } = body;

  if (!slug || !templateType || !name || !subject || !bodyHtml || !fromIdentity) {
    return NextResponse.json(
      { error: 'slug, templateType, name, subject, bodyHtml, and fromIdentity are required' },
      { status: 400 },
    );
  }

  const template = await db.emailTemplate.create({
    data: {
      slug,
      templateType,
      name,
      subject,
      bodyHtml,
      bodyText: bodyText ?? null,
      fromIdentity,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
