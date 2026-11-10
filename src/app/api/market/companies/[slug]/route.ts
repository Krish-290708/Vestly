import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MOCK_COMPANIES, EXTRA_COMPANIES } from '@/lib/mockData';
import { lookupListedCompany, getListedInsights } from '@/lib/finnhub';
import { getCompanyInsight, pricedEvents, buildPrivateScorecard, buildListedScorecard } from '@/lib/companyInsights';
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
    const mockCompany = [...MOCK_COMPANIES, ...EXTRA_COMPANIES].find(
      (c) =>
        c.id.toLowerCase() === rawSlug ||
        slugify(c.name) === rawSlug ||
        c.name.toLowerCase() === rawSlug ||
        (c.ticker && c.ticker.toLowerCase() === rawSlug)
    );

    // 3. Listed company found through live search (the slug is its ticker)
    const liveOnly = !dbCompany && !mockCompany ? await lookupListedCompany(rawSlug) : null;

    if (!dbCompany && !mockCompany && !liveOnly) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Live quote overlay for listed companies already in the catalog or database
    const listedTicker =
      (dbCompany?.isPublic ?? mockCompany?.isPublic) ? (dbCompany?.ticker || mockCompany?.ticker || null) : null;
    const live = liveOnly || (listedTicker ? await lookupListedCompany(listedTicker) : null);

    // Merge company metadata
    const name = dbCompany?.name || mockCompany?.name || live?.name || '';
    const earlyTicker = dbCompany?.ticker || mockCompany?.ticker || live?.ticker || null;
    const researched = getCompanyInsight(name, earlyTicker);
    const ticker = dbCompany?.ticker || mockCompany?.ticker || live?.ticker || null;
    const isPublic = dbCompany ? dbCompany.isPublic : mockCompany?.isPublic ?? !!liveOnly;
    const sector = dbCompany?.sector || mockCompany?.sector || live?.sector || 'Not provided';
    const description = dbCompany?.description || mockCompany?.description || live?.description || '';
    // For private companies, the researched, dated valuation replaces older sample figures.
    const researchedValuation = researched && !live ? pricedEvents(researched).slice(-1)[0]?.valuationUsd ?? null : null;
    const latestValuation =
      live?.marketCap || researchedValuation || dbCompany?.latestValuation || mockCompany?.latestValuation || null;
    const latestFmvPerShare = live?.price || dbCompany?.latestFmvPerShare || mockCompany?.latestFmvPerShare || 0;
    const priceSource: 'live' | 'sample' | 'none' = live?.price ? 'live' : latestFmvPerShare > 0 ? 'sample' : 'none';
    const lastFmvUpdateDate = live?.price ? new Date() : dbCompany?.lastFmvUpdateDate || null;
    const foundedYear = dbCompany?.foundedYear || mockCompany?.foundedYear || null;
    const keyLeadership = dbCompany?.keyLeadership || mockCompany?.keyLeadership || null;
    const latestEvent = researched && !live ? pricedEvents(researched).slice(-1)[0] : null;
    // A researched, dated event replaces older hand-written funding text for private companies.
    const fundingHistory = latestEvent
      ? `Latest: ${latestEvent.kind === 'funding' ? 'funding round' : latestEvent.kind === 'tender' ? 'tender offer' : 'secondary sale'} at $${((latestEvent.valuationUsd as number) / 1e9).toFixed(1).replace(/\.0$/, '')}B (${latestEvent.date})`
      : dbCompany?.fundingHistory || mockCompany?.fundingHistory || null;
    const metrics = (mockCompany as any)?.metrics || null;
    // Only show a price history when the catalog has one. Never generate a trend from a single price.
    const historicalPrices = mockCompany?.historicalPrices ?? [];

    // Funding rounds are not available from any data source here, so none are shown.
    // (An earlier version generated the same made-up rounds, with named investors, for every company.)
    const fundingRounds: Array<{ round: string; date: string; raisedFormatted: string; valuationFormatted: string; leadInvestor: string }> = [];

    // Research layer: summary, ESOP-relevant history, peers and a factual scorecard (never a rating).
    const isListed = !!live || isPublic;
    const listedInsights = isListed && ticker ? await getListedInsights(ticker) : null;
    const insights = {
      summary: researched?.summary || null,
      asOf: researched?.asOf || null,
      ipoStatus: researched?.ipoStatus || (isListed ? 'listed' : null),
      events: researched ? [...researched.events].sort((a, b) => b.date.localeCompare(a.date)) : [],
      facts: researched?.facts || [],
      esopNotes: researched?.esopNotes || [],
      competitors: researched?.competitors || [],
      sources: researched?.sources || [],
      scorecard: isListed
        ? buildListedScorecard(listedInsights?.metrics ?? null, live?.price ?? null, listedInsights?.analyst ?? null)
        : researched
          ? buildPrivateScorecard(researched)
          : [],
      peers: listedInsights?.peers || [],
      analyst: listedInsights?.analyst || null,
      listedMetrics: listedInsights?.metrics || null,
      hasResearch: !!researched,
      hasLiveInsights: !!listedInsights,
    };

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
        priceSource,
        insights,
        logoUrl: live?.logoUrl || null,
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
