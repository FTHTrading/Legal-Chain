// POST /api/email/approve — Approve or reject a pending email
import { NextRequest, NextResponse } from 'next/server';
import { approveEmail, rejectEmail } from '@/lib/email/send';
import { requirePermission, getSession } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  await requirePermission('approval:review');

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { emailLogId, action, reason } = body;

  if (!emailLogId || !action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'emailLogId and action (approve|reject) are required' },
      { status: 400 },
    );
  }

  if (action === 'approve') {
    await approveEmail(emailLogId, session.user.id);
    return NextResponse.json({ ok: true, message: 'Email approved and dispatched.' });
  }

  if (!reason) {
    return NextResponse.json(
      { error: 'reason is required when rejecting' },
      { status: 400 },
    );
  }

  await rejectEmail(emailLogId, session.user.id, reason);
  return NextResponse.json({ ok: true, message: 'Email rejected.' });
}
