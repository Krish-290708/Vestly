import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateVestingProgress } from '@/lib/calculations/vesting';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        company: true,
        exerciseEvents: { orderBy: { exerciseDate: 'desc' } },
        vestingEvents: { orderBy: { vestDate: 'asc' } },
      },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    const totalExercised = grant.exerciseEvents.reduce(
      (sum, evt) => sum + evt.unitsExercised,
      0
    );

    const progress = calculateVestingProgress(
      grant.vestingEvents,
      grant.unitsGranted,
      new Date()
    );

    const exercisableUnits = grant.earlyExercisable
      ? Math.max(0, grant.unitsGranted - totalExercised)
      : Math.max(0, progress.vestedUnits - totalExercised);

    return NextResponse.json({
      exerciseEvents: grant.exerciseEvents,
      totalExercised,
      exercisableUnits,
      vestedUnits: progress.vestedUnits,
      unitsGranted: grant.unitsGranted,
      earlyExercisable: grant.earlyExercisable,
    });
  } catch (error: any) {
    console.error('Fetch exercise events error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise events' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        company: true,
        exerciseEvents: true,
        vestingEvents: { orderBy: { vestDate: 'asc' } },
      },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    const body = await req.json();
    const {
      unitsExercised,
      exerciseDate = new Date().toISOString(),
      fmvAtExercise,
      dispositionType = 'N_A',
      notes,
    } = body;

    const units = parseInt(unitsExercised, 10);
    if (!units || isNaN(units) || units <= 0) {
      return NextResponse.json({ error: 'A valid number of units is required' }, { status: 400 });
    }

    const totalExercisedPrior = grant.exerciseEvents.reduce(
      (sum, evt) => sum + evt.unitsExercised,
      0
    );

    const progress = calculateVestingProgress(
      grant.vestingEvents,
      grant.unitsGranted,
      new Date(exerciseDate)
    );

    const maxAllowed = grant.earlyExercisable
      ? grant.unitsGranted - totalExercisedPrior
      : progress.vestedUnits - totalExercisedPrior;

    if (units > maxAllowed) {
      return NextResponse.json(
        {
          error: `Cannot exercise ${units.toLocaleString()} units. Only ${Math.max(
            0,
            maxAllowed
          ).toLocaleString()} units are currently exercisable.`,
        },
        { status: 400 }
      );
    }

    const exDate = new Date(exerciseDate);
    const fmv = fmvAtExercise ? parseFloat(fmvAtExercise) : (grant.company?.latestFmvPerShare || 0);
    const strikePricePaid = grant.strikePrice;
    const totalCostPaid = units * strikePricePaid;
    const spreadAtExercise = Math.max(0, (fmv - strikePricePaid) * units);

    // Estimate tax paid/exposure
    let estimatedTax = 0;
    if (grant.grantType === 'ISO') {
      // AMT preferential rate assumption (28%) on spread
      estimatedTax = spreadAtExercise * 0.28;
    } else if (grant.grantType === 'NSO') {
      // Ordinary income rate assumption (37%) on spread
      estimatedTax = spreadAtExercise * 0.37;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create ExerciseEvent
      const newEvent = await tx.exerciseEvent.create({
        data: {
          grantId: grant.id,
          exerciseDate: exDate,
          unitsExercised: units,
          strikePricePaid,
          totalCostPaid,
          fmvAtExercise: fmv,
          spreadAtExercise,
          dispositionType: dispositionType || 'N_A',
          estimatedTaxPaid: Math.round(estimatedTax),
        },
      });

      // 2. Check if fully exercised
      if (totalExercisedPrior + units >= grant.unitsGranted) {
        await tx.grant.update({
          where: { id: grant.id },
          data: { status: 'EXERCISED' },
        });
      }

      // 3. ISO qualifying holding period reminder (Section 422)
      // Must be held 2 years from grant date AND 1 year from exercise date
      if (grant.grantType === 'ISO' && dispositionType !== 'DISQUALIFYING') {
        const oneYearFromExercise = new Date(exDate.getTime() + 365.25 * 24 * 60 * 60 * 1000);
        const twoYearsFromGrant = new Date(
          new Date(grant.grantDate).getTime() + 2 * 365.25 * 24 * 60 * 60 * 1000
        );
        const qualifyingDate =
          oneYearFromExercise > twoYearsFromGrant ? oneYearFromExercise : twoYearsFromGrant;

        await tx.actionReminder.create({
          data: {
            userId: user.id,
            grantId: grant.id,
            type: 'ISO_HOLDING_PERIOD',
            title: `ISO qualifying holding date for ${grant.grantIdentifier} (${units.toLocaleString()} units)`,
            description: `To qualify for long-term capital gains on sale, hold until ${qualifyingDate.toLocaleDateString(
              'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }
            )} (1 year from exercise and 2 years from grant).`,
            dueDate: qualifyingDate,
            status: 'PENDING',
          },
        });
      }

      // 4. Section 83(b) reminder if early exercised unvested shares
      const isEarlyExercise =
        grant.earlyExercisable && totalExercisedPrior + units > progress.vestedUnits;
      if (isEarlyExercise) {
        const deadline83b = new Date(exDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        await tx.actionReminder.create({
          data: {
            userId: user.id,
            grantId: grant.id,
            type: 'ELECTION_83B',
            title: `File Section 83(b) election for ${grant.grantIdentifier}`,
            description: `You early exercised unvested shares. File Form 83(b) with the IRS within 30 days of exercise (due ${deadline83b.toLocaleDateString(
              'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }
            )}).`,
            dueDate: deadline83b,
            status: 'PENDING',
          },
        });
      }

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          grantId: grant.id,
          action: 'EXERCISE_RECORDED',
          details: `Exercised ${units.toLocaleString()} units of ${
            grant.grantIdentifier
          } at $${strikePricePaid.toFixed(2)}/sh (Total: $${totalCostPaid.toLocaleString()})`,
        },
      });

      return newEvent;
    });

    return NextResponse.json({ success: true, exerciseEvent: result });
  } catch (error: any) {
    console.error('Record exercise error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record exercise' }, { status: 500 });
  }
}

