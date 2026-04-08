import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone } = body;
    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: 'Name and phone required' }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      callbackId: `CB-${Date.now().toString(36).toUpperCase()}`,
      scheduledAt: new Date().toISOString(),
      message: 'Callback scheduled',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
