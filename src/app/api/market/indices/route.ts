import { NextResponse } from 'next/server';
import { getMarketIndices } from '@/lib/finnhub';

export async function GET() {
  try {
    const data = await getMarketIndices();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch market indices' }, { status: 500 });
  }
}

