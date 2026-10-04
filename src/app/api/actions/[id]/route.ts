import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status, snoozedUntil, notes } = body;

    const reminder = await prisma.actionReminder.findFirst({
      where: { id: params.id, userId: user.id },
      include: { grant: { include: { company: true } } },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    const updated = await prisma.actionReminder.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(snoozedUntil ? { snoozedUntil: new Date(snoozedUntil) } : {}),
      },
    });

    // Write audit log
    const grantInfo = reminder.grant ? ` for ${reminder.grant.company.name}` : '';
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        grantId: reminder.grantId,
        action: `ACTION_${status || 'UPDATED'}`,
        details: `Marked "${reminder.title}"${grantInfo} as ${status}${notes ? ` (Note: ${notes})` : ''}`,
      },
    });

    return NextResponse.json({ success: true, reminder: updated });
  } catch (error: any) {
    console.error('Update action error:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reminder = await prisma.actionReminder.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    await prisma.actionReminder.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ACTION_DISMISSED',
        details: `Dismissed reminder: "${reminder.title}"`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}

