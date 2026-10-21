import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'json';

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
      grants: {
        select: {
          id: true,
          grantIdentifier: true,
          grantType: true,
          unitsGranted: true,
          strikePrice: true,
          grantDate: true,
          vestingStartDate: true,
          cliffMonths: true,
          vestingSchedule: true,
          expirationDate: true,
          notes: true,
          documentName: true,
          company: {
            select: {
              name: true,
              latestFmvPerShare: true,
              ticker: true,
            },
          },
          vestingEvents: {
            select: {
              id: true,
              vestDate: true,
              unitsVested: true,
              isVested: true,
            },
            orderBy: { vestDate: 'asc' },
          },
        },
        orderBy: { grantDate: 'desc' },
      },
      actions: {
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          dueDate: true,
          status: true,
        },
        orderBy: { dueDate: 'asc' },
      },
      watchlist: {
        select: {
          id: true,
          note: true,
          company: {
            select: {
              name: true,
              ticker: true,
            },
          },
        },
      },
      savedScenarios: {
        select: {
          id: true,
          name: true,
          kind: true,
          inputs: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!fullUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (format.toLowerCase() === 'csv') {
    // Generate CSV of grants
    const headers = [
      'Grant ID',
      'Identifier',
      'Company',
      'Grant Type',
      'Total Units',
      'Strike Price',
      'Current FMV',
      'Grant Date',
      'Vesting Start Date',
      'Cliff Months',
      'Expiration Date',
      'Notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = fullUser.grants.map((g) => [
      escapeCsv(g.id),
      escapeCsv(g.grantIdentifier),
      escapeCsv(g.company.name),
      escapeCsv(g.grantType),
      escapeCsv(g.unitsGranted),
      escapeCsv(g.strikePrice),
      escapeCsv(g.company.latestFmvPerShare),
      escapeCsv(g.grantDate.toISOString().split('T')[0]),
      escapeCsv(g.vestingStartDate.toISOString().split('T')[0]),
      escapeCsv(g.cliffMonths),
      escapeCsv(g.expirationDate.toISOString().split('T')[0]),
      escapeCsv(g.notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vestly-grants-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  // Default: JSON export
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    profile: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      createdAt: fullUser.createdAt.toISOString(),
      filingStatus: fullUser.filingStatus,
      stateCode: fullUser.stateCode,
      annualIncome: fullUser.annualIncome,
    },
    notifications: {
      emailAlerts: fullUser.emailAlerts,
      inAppAlerts: fullUser.inAppAlerts,
      advanceReminderDays: fullUser.advanceReminderDays,
    },
    grants: fullUser.grants.map((g) => ({
      id: g.id,
      identifier: g.grantIdentifier,
      companyName: g.company.name,
      grantType: g.grantType,
      sharesTotal: g.unitsGranted,
      strikePrice: g.strikePrice,
      currentFmv: g.company.latestFmvPerShare,
      grantDate: g.grantDate.toISOString(),
      vestingStartDate: g.vestingStartDate.toISOString(),
      cliffMonths: g.cliffMonths,
      expirationDate: g.expirationDate.toISOString(),
      notes: g.notes,
      documentName: g.documentName,
      vestingEvents: g.vestingEvents.map((ve) => ({
        id: ve.id,
        vestDate: ve.vestDate.toISOString(),
        unitsVested: ve.unitsVested,
        isVested: ve.isVested,
      })),
    })),
    actions: fullUser.actions.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      dueDate: a.dueDate?.toISOString() || null,
      status: a.status,
    })),
    watchlist: fullUser.watchlist.map((w) => ({
      id: w.id,
      companyName: w.company.name,
      ticker: w.company.ticker,
      note: w.note,
    })),
    savedScenarios: fullUser.savedScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      kind: s.kind,
      inputs: s.inputs,
      createdAt: s.createdAt.toISOString(),
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="vestly-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}

