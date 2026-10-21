import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ grants: [], companies: [] });
  }

  try {
    // 1. Search user's grants
    const rawGrants = await prisma.grant.findMany({
      where: {
        userId: user.id,
        OR: [
          { company: { name: { contains: q } } },
          { grantIdentifier: { contains: q } },
          { grantType: { contains: q } },
          { notes: { contains: q } },
        ],
      },
      select: {
        id: true,
        grantIdentifier: true,
        grantType: true,
        unitsGranted: true,
        strikePrice: true,
        company: {
          select: {
            name: true,
            latestFmvPerShare: true,
          },
        },
      },
      take: 8,
    });

    const grants = rawGrants.map((g) => ({
      id: g.id,
      companyName: g.company.name,
      grantType: g.grantType,
      sharesTotal: g.unitsGranted,
      strikePrice: g.strikePrice,
      currentFmv: g.company.latestFmvPerShare,
    }));

    // 2. Search companies database
    const rawCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { ticker: { contains: q } },
          { sector: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        sector: true,
        latestValuation: true,
      },
      take: 8,
    });

    const companies = rawCompanies.map((c) => ({
      id: c.id,
      name: c.name,
      ticker: c.ticker,
      industry: c.sector,
      lastValuation: c.latestValuation,
    }));

    return NextResponse.json({ grants, companies });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
