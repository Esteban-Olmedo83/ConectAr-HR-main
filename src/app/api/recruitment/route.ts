import { NextRequest, NextResponse } from 'next/server';
import { getRecruitmentPositions, getCandidates } from '@/lib/services/recruitment.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const positionId = searchParams.get('positionId') ?? undefined;

  if (positionId) {
    const candidates = await getCandidates(positionId);
    return NextResponse.json({ candidates, total: candidates.length });
  }

  const positions = await getRecruitmentPositions();
  return NextResponse.json({ positions, total: positions.length });
}
