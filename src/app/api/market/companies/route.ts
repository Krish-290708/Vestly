import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MOCK_COMPANIES } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Database companies
    const dbCompanies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });

    // Merge database companies and mock catalog
    const allCompaniesMap = new Map<string, any>();

    // Add mock catalog first
    MOCK_COMPANIES.forEach(comp => {
      allCompaniesMap.set(comp.name.toLowerCase(), comp);
    });

    // Layer database companies on top (or merge)
    dbCompanies.forEach(dbC => {
      const key = dbC.name.toLowerCase();
      const existing = allCompaniesMap.get(key);
      allCompaniesMap.set(key, {
        ...(existing || {}),
        id: dbC.id,
        name: dbC.name,
        ticker: dbC.ticker || existing?.ticker,
        isPublic: dbC.isPublic,
        sector: dbC.sector || existing?.sector || 'Technology',
        description: dbC.description || existing?.description,
        latestValuation: dbC.latestValuation || existing?.latestValuation,
        latestFmvPerShare: dbC.latestFmvPerShare,
        lastFmvUpdateDate: dbC.lastFmvUpdateDate,
        keyLeadership: dbC.keyLeadership || existing?.keyLeadership,
        fundingHistory: dbC.fundingHistory || existing?.fundingHistory,
        foundedYear: dbC.foundedYear || existing?.foundedYear,
        historicalPrices: existing?.historicalPrices || [
          { date: "2023-01", price: dbC.latestFmvPerShare * 0.7 },
          { date: "2023-06", price: dbC.latestFmvPerShare * 0.8 },
          { date: "2023-12", price: dbC.latestFmvPerShare * 0.9 },
          { date: "2024-06", price: dbC.latestFmvPerShare },
        ],
      });
    });

    let list = Array.from(allCompaniesMap.values());

    if (query) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.ticker && c.ticker.toLowerCase().includes(query)) ||
        (c.sector && c.sector.toLowerCase().includes(query))
      );
    }

    // Check if current user has grants or watchlist items for these companies
    const user = await getCurrentUser();
    let userCompanyIds = new Set<string>();
    let watchlistedCompanyIds = new Set<string>();

    if (user) {
      const userGrants = await prisma.grant.findMany({
        where: { userId: user.id },
        select: { companyId: true },
      });
      userCompanyIds = new Set(userGrants.map(g => g.companyId));

      const watchlist = await prisma.watchlistItem.findMany({
        where: { userId: user.id },
        select: { companyId: true },
      });
      watchlistedCompanyIds = new Set(watchlist.map(w => w.companyId));
    }

    const enrichedList = list.map(c => ({
      ...c,
      isUserEmployer: c.id ? userCompanyIds.has(c.id) : false,
      isWatchlisted: c.id ? watchlistedCompanyIds.has(c.id) : false,
    }));

    return NextResponse.json({ companies: enrichedList });
  } catch (error: any) {
    console.error('Fetch companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

