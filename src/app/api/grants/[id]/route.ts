import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        company: true,
        vestingEvents: { orderBy: { vestDate: 'asc' } },
        actions: true,
        exerciseEvents: true,
      },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    return NextResponse.json({ grant });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch grant' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status, notes, latestFmvPerShare } = body;

    const grant = await prisma.grant.findFirst({
      where: { id: params.id, userId: user.id },
      include: { company: true },
    });

    if (!grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 });

    const updated = await prisma.grant.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    if (latestFmvPerShare && grant.company) {
      await prisma.company.update({
        where: { id: grant.company.id },
        data: {
          latestFmvPerShare: parseFloat(latestFmvPerShare),
          lastFmvUpdateDate: new Date(),
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        grantId: grant.id,
        action: 'GRANT_UPDATED',
        details: `Updated grant ${grant.grantIdentifier} status to ${status || grant.status}`,
      },
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update grant' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'Failed to delete grant' }, { status: 500 });
  }
}

