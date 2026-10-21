import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      filingStatus: true,
      stateCode: true,
      annualIncome: true,
      emailAlerts: true,
      inAppAlerts: true,
      advanceReminderDays: true,
      createdAt: true,
    },
  });

  if (!fullUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      createdAt: fullUser.createdAt.toISOString(),
    },
    taxDefaults: {
      filingStatus: fullUser.filingStatus || 'SINGLE',
      stateCode: fullUser.stateCode || 'CA',
      annualIncome: fullUser.annualIncome ?? 150000,
    },
    notifications: {
      emailAlerts: fullUser.emailAlerts,
      inAppAlerts: fullUser.inAppAlerts,
      advanceReminderDays: fullUser.advanceReminderDays,
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: any = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      updateData.name = body.name.trim();
    }

    if (typeof body.filingStatus === 'string') {
      const allowed = ['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD'];
      if (allowed.includes(body.filingStatus.toUpperCase())) {
        updateData.filingStatus = body.filingStatus.toUpperCase();
      }
    }

    if (typeof body.stateCode === 'string') {
      updateData.stateCode = body.stateCode.trim().toUpperCase().substring(0, 2);
    }

    if (body.annualIncome !== undefined && body.annualIncome !== null) {
      const num = Number(body.annualIncome);
      if (!isNaN(num) && num >= 0) {
        updateData.annualIncome = num;
      }
    }

    if (typeof body.emailAlerts === 'boolean') {
      updateData.emailAlerts = body.emailAlerts;
    }

    if (typeof body.inAppAlerts === 'boolean') {
      updateData.inAppAlerts = body.inAppAlerts;
    }

    if (typeof body.advanceReminderDays === 'number' && body.advanceReminderDays > 0) {
      updateData.advanceReminderDays = Math.min(365, Math.max(1, Math.round(body.advanceReminderDays)));
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        filingStatus: true,
        stateCode: true,
        annualIncome: true,
        emailAlerts: true,
        inAppAlerts: true,
        advanceReminderDays: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt.toISOString(),
      },
      taxDefaults: {
        filingStatus: updated.filingStatus || 'SINGLE',
        stateCode: updated.stateCode || 'CA',
        annualIncome: updated.annualIncome ?? 150000,
      },
      notifications: {
        emailAlerts: updated.emailAlerts,
        inAppAlerts: updated.inAppAlerts,
        advanceReminderDays: updated.advanceReminderDays,
      },
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

