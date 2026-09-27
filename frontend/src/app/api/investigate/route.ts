import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INVESTIGATION } from '@/lib/demo-data';

export async function POST(req: NextRequest) {
  const { target } = await req.json();
  // In demo mode always return INV-8391 scenario
  // In production this would query Fabric Gateway
  void target;
  const scenario = DEMO_INVESTIGATION;
  return NextResponse.json({ ok: true, investigation: scenario, demoMode: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, investigation: DEMO_INVESTIGATION, demoMode: true });
}
