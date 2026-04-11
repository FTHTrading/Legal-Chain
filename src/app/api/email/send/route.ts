// POST /api/email/send — Queue an email for sending
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';
import { requirePermission } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  await requirePermission('comms:send');

  const body = await req.json();
  const { templateSlug, vars, to, cc, bcc, matterId, metadata } = body;

  if (!templateSlug || !to || !Array.isArray(to) || to.length === 0) {
    return NextResponse.json(
      { error: 'templateSlug and to[] are required' },
      { status: 400 },
    );
  }

  const result = await sendEmail({
    templateSlug,
    vars: vars ?? {},
    to,
    cc,
    bcc,
    matterId,
    metadata,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
