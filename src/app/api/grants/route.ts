import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateVestingSchedule, calculateVestingProgress } from '@/lib/calculations/vesting';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawGrants = await prisma.grant.findMany({
      where: { userId: user.id },
      include: {
        company: true,
        vestingEvents: {
          orderBy: { vestDate: 'asc' },
        },
      },
      orderBy: { grantDate: 'desc' },
    });

    const asOfDate = new Date();

    const grants = rawGrants.map(grant => {
      const progress = calculateVestingProgress(grant.vestingEvents, grant.unitsGranted, asOfDate);
      const fmv = grant.company?.latestFmvPerShare || 0;
      const vestedValue = progress.vestedUnits * fmv;
      const unvestedValue = progress.unvestedUnits * fmv;
      const totalExerciseCost = grant.grantType === 'RSU' ? 0 : grant.unitsGranted * grant.strikePrice;
      const vestedExerciseCost = grant.grantType === 'RSU' ? 0 : progress.vestedUnits * grant.strikePrice;

      return {
        ...grant,
        vestedUnits: progress.vestedUnits,
        unvestedUnits: progress.unvestedUnits,
        percentVested: progress.percentVested,
        vestedValue: Math.round(vestedValue),
        unvestedValue: Math.round(unvestedValue),
        totalExerciseCost: Math.round(totalExerciseCost),
        vestedExerciseCost: Math.round(vestedExerciseCost),
        nextVestingDate: progress.nextVestingDate,
        nextVestingUnits: progress.nextVestingUnits,
      };
    });

    return NextResponse.json({ grants });
  } catch (error: any) {
    console.error('Fetch grants error:', error);
    return NextResponse.json({ error: 'Failed to fetch grants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      ticker,
      isPublic = false,
      sector = 'Technology',
      latestFmvPerShare = 10,
      grantIdentifier,
      grantType,
      unitsGranted,
      strikePrice = 0,
      grantDate,
      vestingStartDate,
      cliffMonths = 12,
      vestingSchedule = '4_YEAR_1_YEAR_CLIFF',
      expirationDate,
      earlyExercisable = false,
      notes,
    } = body;

    if (!companyName || !grantIdentifier || !grantType || !unitsGranted || !grantDate || !vestingStartDate) {
      return NextResponse.json({ error: 'Missing required grant fields' }, { status: 400 });
    }

    // Find or create Company
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: companyName } },
          ...(ticker ? [{ ticker: { equals: ticker } }] : [])
        ]
      }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          ticker: ticker || null,
          isPublic: Boolean(isPublic),
          sector: sector || 'Technology',
          latestFmvPerShare: Number(latestFmvPerShare) || 10,
          latestValuation: isPublic ? undefined : Number(latestFmvPerShare) * 100000000,
        }
      });
    } else if (latestFmvPerShare && Number(latestFmvPerShare) !== company.latestFmvPerShare) {
      // Update company FMV if provided new value
      await prisma.company.update({
        where: { id: company.id },
        data: {
          latestFmvPerShare: Number(latestFmvPerShare),
          lastFmvUpdateDate: new Date(),
        }
      });
    }

    const units = parseInt(unitsGranted, 10);
    const strike = grantType === 'RSU' ? 0 : parseFloat(strikePrice);
    const gDate = new Date(grantDate);
    const vStartDate = new Date(vestingStartDate);
    const expDate = expirationDate ? new Date(expirationDate) : new Date(gDate.getTime() + 10 * 365.25 * 24 * 60 * 60 * 1000);

    // Create Grant
    const newGrant = await prisma.grant.create({
      data: {
        userId: user.id,
        companyId: company.id,
        grantIdentifier,
        grantType,
        unitsGranted: units,
        strikePrice: strike,
        grantDate: gDate,
        vestingStartDate: vStartDate,
        cliffMonths: parseInt(cliffMonths, 10) || 0,
        vestingSchedule,
        expirationDate: expDate,
        earlyExercisable: Boolean(earlyExercisable),
        notes: notes || null,
        status: 'VESTING',
      },
      include: {
        company: true,
      }
    });

    // Generate Vesting Events
    const rawEvents = generateVestingSchedule(
      units,
      vStartDate,
      vestingSchedule,
      parseInt(cliffMonths, 10) || 0
    );

    for (const evt of rawEvents) {
      await prisma.vestingEvent.create({
        data: {
          grantId: newGrant.id,
          vestDate: evt.vestDate,
          unitsVested: evt.unitsVested,
          cumulativeVested: evt.cumulativeVested,
          isVested: evt.isVested,
        }
      });
    }

    // Auto-generate high-priority Action Reminders for this new grant
    // 1. 83(b) deadline if early exercisable
    if (earlyExercisable) {
      const deadline83b = new Date(gDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      await prisma.actionReminder.create({
        data: {
          userId: user.id,
          grantId: newGrant.id,
          type: 'ELECTION_83B',
          title: `IRS Section 83(b) Deadline for ${company.name} (${grantIdentifier})`,
          description: 'You indicated this grant is early exercisable. If exercising before vest, file Section 83(b) election with IRS within 30 days of purchase!',
          dueDate: deadline83b,
          urgency: 'CRITICAL',
          status: 'PENDING',
        }
      });
    }

    // 2. Upcoming first vest / cliff reminder
    const firstVest = rawEvents[0];
    if (firstVest) {
      await prisma.actionReminder.create({
        data: {
          userId: user.id,
          grantId: newGrant.id,
          type: 'VESTING_EVENT',
          title: `${company.name} Initial Vesting Milestone (${firstVest.unitsVested.toLocaleString()} units)`,
          description: `Vesting cliff/milestone date for ${grantIdentifier}.`,
          dueDate: firstVest.vestDate,
          urgency: 'MEDIUM',
          status: 'PENDING',
        }
      });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        grantId: newGrant.id,
        action: 'GRANT_CREATED',
        details: `Created ${grantType} grant '${grantIdentifier}' for ${company.name} with ${units.toLocaleString()} units at $${strike.toFixed(2)} strike.`,
      }
    });

    return NextResponse.json({ success: true, grant: newGrant });
  } catch (error: any) {
    console.error('Create grant error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create grant' }, { status: 500 });
  }
}

