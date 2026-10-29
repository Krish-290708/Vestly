import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateVestingSchedule, calculateVestingProgress } from '@/lib/calculations/vesting';

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
        vestingEvents: { orderBy: { vestDate: 'asc' } },
        actions: { orderBy: { dueDate: 'asc' } },
        exerciseEvents: { orderBy: { exerciseDate: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    const asOfDate = new Date();
    const progress = calculateVestingProgress(
      grant.vestingEvents,
      grant.unitsGranted,
      asOfDate
    );
    const fmv = grant.company?.latestFmvPerShare || 0;
    const vestedValue = progress.vestedUnits * fmv;
    const unvestedValue = progress.unvestedUnits * fmv;
    const totalExerciseCost =
      grant.grantType === 'RSU' ? 0 : grant.unitsGranted * grant.strikePrice;
    const vestedExerciseCost =
      grant.grantType === 'RSU' ? 0 : progress.vestedUnits * grant.strikePrice;
    const totalExercised = (grant.exerciseEvents || []).reduce(
      (sum, evt) => sum + evt.unitsExercised,
      0
    );

    const enrichedGrant = {
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
      totalExercised,
      exercisableUnits: grant.earlyExercisable
        ? Math.max(0, grant.unitsGranted - totalExercised)
        : Math.max(0, progress.vestedUnits - totalExercised),
    };

    return NextResponse.json({ grant: enrichedGrant });
  } catch (error: any) {
    console.error('Fetch grant error:', error);
    return NextResponse.json({ error: 'Failed to fetch grant' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      grantIdentifier,
      grantType,
      unitsGranted,
      strikePrice,
      grantDate,
      vestingStartDate,
      cliffMonths,
      vestingSchedule,
      expirationDate,
      earlyExercisable,
      status,
      notes,
      latestFmvPerShare,
    } = body;

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
      include: { company: true },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    const scheduleNeedsRegen =
      (unitsGranted !== undefined && parseInt(unitsGranted, 10) !== grant.unitsGranted) ||
      (vestingStartDate !== undefined &&
        new Date(vestingStartDate).getTime() !== new Date(grant.vestingStartDate).getTime()) ||
      (cliffMonths !== undefined && parseInt(cliffMonths, 10) !== grant.cliffMonths) ||
      (vestingSchedule !== undefined && vestingSchedule !== grant.vestingSchedule);

    const updated = await prisma.$transaction(async (tx) => {
      const newUnits =
        unitsGranted !== undefined ? parseInt(unitsGranted, 10) : grant.unitsGranted;
      const newVestingStart = vestingStartDate
        ? new Date(vestingStartDate)
        : grant.vestingStartDate;
      const newCliff =
        cliffMonths !== undefined ? parseInt(cliffMonths, 10) : grant.cliffMonths;
      const newSchedule = vestingSchedule || grant.vestingSchedule;

      const updatedGrant = await tx.grant.update({
        where: { id: params.id },
        data: {
          ...(grantIdentifier !== undefined ? { grantIdentifier } : {}),
          ...(grantType !== undefined ? { grantType } : {}),
          ...(unitsGranted !== undefined ? { unitsGranted: newUnits } : {}),
          ...(strikePrice !== undefined
            ? { strikePrice: grantType === 'RSU' ? 0 : parseFloat(strikePrice) }
            : {}),
          ...(grantDate !== undefined ? { grantDate: new Date(grantDate) } : {}),
          ...(vestingStartDate !== undefined ? { vestingStartDate: newVestingStart } : {}),
          ...(cliffMonths !== undefined ? { cliffMonths: newCliff } : {}),
          ...(vestingSchedule !== undefined ? { vestingSchedule: newSchedule } : {}),
          ...(expirationDate !== undefined
            ? { expirationDate: new Date(expirationDate) }
            : {}),
          ...(earlyExercisable !== undefined
            ? { earlyExercisable: Boolean(earlyExercisable) }
            : {}),
          ...(status !== undefined ? { status } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      });

      if (scheduleNeedsRegen) {
        // Delete old vesting events and generate new ones
        await tx.vestingEvent.deleteMany({ where: { grantId: grant.id } });

        const rawEvents = generateVestingSchedule(
          newUnits,
          newVestingStart,
          newSchedule,
          newCliff
        );

        if (rawEvents.length > 0) {
          await tx.vestingEvent.createMany({
            data: rawEvents.map((evt) => ({
              grantId: grant.id,
              vestDate: evt.vestDate,
              unitsVested: evt.unitsVested,
              cumulativeVested: evt.cumulativeVested,
              isVested: evt.isVested,
            })),
          });
        }
      }

      if (latestFmvPerShare !== undefined && grant.company) {
        await tx.company.update({
          where: { id: grant.company.id },
          data: {
            latestFmvPerShare: parseFloat(latestFmvPerShare),
            lastFmvUpdateDate: new Date(),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          grantId: grant.id,
          action: 'GRANT_UPDATED',
          details: `Updated grant ${grantIdentifier || grant.grantIdentifier}${
            scheduleNeedsRegen ? ' (regenerated schedule)' : ''
          }`,
        },
      });

      return updatedGrant;
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (error: any) {
    console.error('Update grant error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update grant' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    await prisma.grant.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'GRANT_DELETED',
        details: `Deleted grant ${grant.grantIdentifier}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete grant error:', error);
    return NextResponse.json({ error: 'Failed to delete grant' }, { status: 500 });
  }
}
