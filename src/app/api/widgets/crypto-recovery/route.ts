import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { victimName, contactEmail, chain, walletAddress, amountLost, summary } = body;
    if (!victimName || !contactEmail || !chain || !walletAddress || !amountLost || !summary) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    const caseId = `CRY-${Date.now().toString(36).toUpperCase()}`;
    const riskLevel = parseFloat(amountLost.replace(/[^0-9.]/g, '')) > 100000 ? 'high' : parseFloat(amountLost.replace(/[^0-9.]/g, '')) > 10000 ? 'medium' : 'standard';
    return NextResponse.json({
      ok: true,
      caseId,
      riskLevel,
      status: 'ready-for-forensic-review',
      message: 'Incident logged',
      data: { victimName, contactEmail, chain, walletAddress, amountLost, summary },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
