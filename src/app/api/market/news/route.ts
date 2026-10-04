import { NextRequest, NextResponse } from 'next/server';
import { getMarketNews } from '@/lib/finnhub';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'general';
    const data = await getMarketNews(category);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

