import { NextResponse } from 'next/server';
import { getRankedPriests, getRankedVenues } from '../../lib/recommendationEngine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, criteria } = body;

    if (category === 'priests') {
      const ranked = getRankedPriests(criteria || {});
      return NextResponse.json({ success: true, results: ranked });
    } else if (category === 'venues') {
      const ranked = getRankedVenues(criteria || {});
      return NextResponse.json({ success: true, results: ranked });
    }

    const defaultPriests = getRankedPriests(criteria || {});
    return NextResponse.json({ success: true, results: defaultPriests });
  } catch (error) {
    console.error('Recommendations Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
