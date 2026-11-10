import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MOCK_COMPANIES, EXTRA_COMPANIES } from '@/lib/mockData';
import { searchListedCompanies } from '@/lib/finnhub';
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

    // One entry per company: listed companies are matched by ticker, private ones by name.
    const keyOf = (c: { name: string; ticker?: string | null; isPublic?: boolean }) =>
      c.isPublic && c.ticker ? `tk:${c.ticker.toUpperCase()}` : `nm:${c.name.toLowerCase()}`;

    // Add the built-in catalog first
    [...MOCK_COMPANIES, ...EXTRA_COMPANIES].forEach(comp => {
      allCompaniesMap.set(keyOf(comp), comp);
    });

    // Layer database companies on top (or merge)
    dbCompanies.forEach(dbC => {
      const key = keyOf(dbC);
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

    // Catalog entries carry the company's name as its slug; live-search hits use the ticker.
    const fullList: any[] = Array.from(allCompaniesMap.values());
    let list: any[] = fullList;

    if (query) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.ticker && c.ticker.toLowerCase().includes(query)) ||
        (c.sector && c.sector.toLowerCase().includes(query))
      );
    }

    // Live search for other listed companies (needs FINNHUB_API_KEY; empty otherwise).
    let liveSearchActive = false;
    if (query.length >= 2) {
      const shown = new Set(list.map((c) => (c.isPublic && c.ticker ? String(c.ticker).toUpperCase() : '')));
      const known = new Map<string, any>(
        fullList.filter((c) => c.isPublic && c.ticker).map((c) => [String(c.ticker).toUpperCase(), c])
      );
      const hits = await searchListedCompanies(query);
      liveSearchActive = !!process.env.FINNHUB_API_KEY;
      for (const h of hits) {
        if (shown.has(h.symbol)) continue;
        shown.add(h.symbol);
        // A company already in the catalog or database keeps its fuller record.
        if (known.has(h.symbol)) {
          list.push(known.get(h.symbol));
          continue;
        }
        list.push({
          name: h.name,
          ticker: h.symbol,
          isPublic: true,
          sector: 'Not provided',
          description: '',
          latestValuation: null,
          latestFmvPerShare: 0,
          keyLeadership: null,
          slug: h.symbol.toLowerCase(),
          source: 'finnhub-search',
        });
      }
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

    const dbIds = new Set(dbCompanies.map((d) => d.id));
    const enrichedList = list.map(c => ({
      ...c,
      // Only companies stored in the database can be followed or linked to grants.
      inDatabase: !!c.id && dbIds.has(c.id),
      isUserEmployer: c.id ? userCompanyIds.has(c.id) : false,
      isWatchlisted: c.id ? watchlistedCompanyIds.has(c.id) : false,
    }));

    return NextResponse.json({ companies: enrichedList, liveSearchActive });
  } catch (error: any) {
    console.error('Fetch companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

