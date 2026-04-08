import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, caseType, summary, urgency } = body;
    if (!name || !email || !summary) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    const caseId = `INT-${Date.now().toString(36).toUpperCase()}`;
    return NextResponse.json({
      ok: true,
      caseId,
      status: urgency === 'emergency' ? 'priority-review' : 'submitted',
      message: 'Intake received',
      data: { name, email, phone, caseType, summary, urgency },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
