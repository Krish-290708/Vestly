import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reminders = await prisma.actionReminder.findMany({
      where: { userId: user.id },
      include: {
        grant: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: user.id },
      include: {
        grant: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      reminders,
      auditLogs,
      preferences: {
        emailAlerts: user.emailAlerts,
        inAppAlerts: user.inAppAlerts,
        advanceReminderDays: user.advanceReminderDays,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, dueDate, urgency = 'MEDIUM', grantId, type = 'CUSTOM' } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Title and due date are required' }, { status: 400 });
    }

    const reminder = await prisma.actionReminder.create({
      data: {
        userId: user.id,
        grantId: grantId || null,
        type,
        title,
        description,
        dueDate: new Date(dueDate),
        urgency,
        status: 'PENDING',
      },
      include: {
        grant: { include: { company: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        grantId: grantId || null,
        action: 'REMINDER_CREATED',
        details: `Created task: "${title}" (Due: ${new Date(dueDate).toLocaleDateString()})`,
      },
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { emailAlerts, inAppAlerts, advanceReminderDays } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailAlerts: typeof emailAlerts === 'boolean' ? emailAlerts : undefined,
        inAppAlerts: typeof inAppAlerts === 'boolean' ? inAppAlerts : undefined,
        advanceReminderDays: typeof advanceReminderDays === 'number' ? advanceReminderDays : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        emailAlerts: updatedUser.emailAlerts,
        inAppAlerts: updatedUser.inAppAlerts,
        advanceReminderDays: updatedUser.advanceReminderDays,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

