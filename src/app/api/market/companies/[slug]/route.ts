import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MOCK_COMPANIES } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';
import { calculateVestingProgress } from '@/lib/calculations/vesting';

export const dynamic = 'force-dynamic';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rawSlug = params.slug.toLowerCase().trim();

    // 1. Search database first
    const dbCompanies = await prisma.company.findMany({
      include: {
        grants: true,
      },
    });

    const dbCompany = dbCompanies.find(
      (c) =>
        c.id.toLowerCase() === rawSlug ||
        slugify(c.name) === rawSlug ||
        c.name.toLowerCase() === rawSlug ||
        (c.ticker && c.ticker.toLowerCase() === rawSlug)
    );

    // 2. Search mock companies
    const mockCompany = MOCK_COMPANIES.find(
      (c) =>
        c.id.toLowerCase() === rawSlug ||
        slugify(c.name) === rawSlug ||
        c.name.toLowerCase() === rawSlug ||
        (c.ticker && c.ticker.toLowerCase() === rawSlug)
    );

    if (!dbCompany && !mockCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Merge company metadata
    const name = dbCompany?.name || mockCompany?.name || '';
    const ticker = dbCompany?.ticker || mockCompany?.ticker || null;
    const isPublic = dbCompany ? dbCompany.isPublic : mockCompany?.isPublic ?? false;
    const sector = dbCompany?.sector || mockCompany?.sector || 'Technology';
    const description = dbCompany?.description || mockCompany?.description || '';
    const latestValuation = dbCompany?.latestValuation || mockCompany?.latestValuation || null;
    const latestFmvPerShare = dbCompany?.latestFmvPerShare || mockCompany?.latestFmvPerShare || 0;
    const lastFmvUpdateDate = dbCompany?.lastFmvUpdateDate || null;
    const foundedYear = dbCompany?.foundedYear || mockCompany?.foundedYear || null;
    const keyLeadership = dbCompany?.keyLeadership || mockCompany?.keyLeadership || null;
    const fundingHistory = dbCompany?.fundingHistory || mockCompany?.fundingHistory || null;
    const metrics = (mockCompany as any)?.metrics || null;
    const historicalPrices = mockCompany?.historicalPrices || [
      { date: '2023-01', price: Math.round(latestFmvPerShare * 0.7 * 100) / 100 },
      { date: '2023-06', price: Math.round(latestFmvPerShare * 0.8 * 100) / 100 },
      { date: '2023-12', price: Math.round(latestFmvPerShare * 0.9 * 100) / 100 },
      { date: '2024-06', price: latestFmvPerShare },
    ];

    // Funding rounds timeline
    const fundingRounds = [
      { round: 'Series Seed', date: '2018-04', raisedFormatted: '$2.5M', valuationFormatted: '$12M', leadInvestor: 'Y Combinator' },
      { round: 'Series A', date: '2019-10', raisedFormatted: '$15M', valuationFormatted: '$65M', leadInvestor: 'Sequoia Capital' },
      { round: 'Series B', date: '2021-03', raisedFormatted: '$50M', valuationFormatted: '$350M', leadInvestor: 'Andreessen Horowitz' },
      { round: 'Series C', date: '2022-08', raisedFormatted: '$120M', valuationFormatted: '$1.2B', leadInvestor: 'Index Ventures' },
      { round: 'Series D / Tender', date: '2024-02', raisedFormatted: '$250M', valuationFormatted: latestValuation ? `$${(latestValuation / 1e9).toFixed(1)}B` : '$2.5B', leadInvestor: 'T. Rowe Price' },
    ];

    // Check user relationship
    const user = await getCurrentUser();
    let userEquityOverlay: any = null;
    let isWatchlisted = false;
    let watchlistNote: string | null = null;

    if (user) {
      // Watchlist status
      const watchItem = await prisma.watchlistItem.findFirst({
        where: {
          userId: user.id,
          companyId: dbCompany?.id,
        },
      });
      if (watchItem) {
        isWatchlisted = true;
        watchlistNote = watchItem.note;
      }

      // Check grants
      const userGrants = await prisma.grant.findMany({
        where: {
          userId: user.id,
          OR: [
            ...(dbCompany ? [{ companyId: dbCompany.id }] : []),
            { company: { name: { equals: name } } },
          ],
        },
        include: {
          company: true,
          vestingEvents: true,
        },
      });

      if (userGrants.length > 0) {
        const asOfDate = new Date();
        const enrichedGrants = userGrants.map((g) => {
          const progress = calculateVestingProgress(g.vestingEvents, g.unitsGranted, asOfDate);
          const vestedCost = g.grantType === 'RSU' ? 0 : progress.vestedUnits * g.strikePrice;
          return {
            id: g.id,
            grantIdentifier: g.grantIdentifier,
            grantType: g.grantType,
            unitsGranted: g.unitsGranted,
            vestedUnits: progress.vestedUnits,
            strikePrice: g.strikePrice,
            vestedCost,
          };
        });

        const totalUnits = enrichedGrants.reduce((s, g) => s + g.unitsGranted, 0);
        const vestedUnits = enrichedGrants.reduce((s, g) => s + g.vestedUnits, 0);
        const exerciseCost = enrichedGrants.reduce((s, g) => s + g.vestedCost, 0);
        const vestedValue = vestedUnits * latestFmvPerShare;
        const netValue = vestedValue - exerciseCost;

        userEquityOverlay = {
          hasGrants: true,
          grantCount: enrichedGrants.length,
          primaryGrantId: enrichedGrants[0].id,
          totalUnits,
          vestedUnits,
          exerciseCost: Math.round(exerciseCost),
          vestedValue: Math.round(vestedValue),
          netValue: Math.round(netValue),
          grants: enrichedGrants,
        };
      }
    }

    return NextResponse.json({
      company: {
        id: dbCompany?.id || mockCompany?.id || rawSlug,
        slug: slugify(name),
        name,
        ticker,
        isPublic,
        sector,
        description,
        latestValuation,
        latestFmvPerShare,
        lastFmvUpdateDate,
        foundedYear,
        keyLeadership,
        fundingHistory,
        metrics,
        historicalPrices,
        fundingRounds,
        isWatchlisted,
        watchlistNote,
      },
      userEquityOverlay,
    });
  } catch (error: any) {
    console.error('Fetch company detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}
