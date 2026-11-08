import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    const grantId = searchParams.get('grantId');

    const where: any = { userId: user.id };
    if (kind) where.kind = kind;
    if (grantId) where.grantId = grantId;

    const scenarios = await prisma.savedScenario.findMany({
      where,
      include: {
        grant: {
          select: {
            id: true,
            grantIdentifier: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedScenarios = scenarios.map((s) => {
      let parsedInputs = {};
      try {
        parsedInputs = JSON.parse(s.inputs);
      } catch {
        parsedInputs = {};
      }
      return {
        ...s,
        parsedInputs,
      };
    });

    return NextResponse.json({ scenarios: parsedScenarios });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, kind, grantId, inputs } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Scenario name is required' }, { status: 400 });
    }

    const inputsStr = typeof inputs === 'string' ? inputs : JSON.stringify(inputs || {});

    const scenario = await prisma.savedScenario.create({
      data: {
        userId: user.id,
        name: name.trim(),
        kind: kind || 'CALCULATOR',
        grantId: grantId || null,
        inputs: inputsStr,
      },
      include: {
        grant: {
          select: {
            id: true,
            grantIdentifier: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json({ error: 'Failed to create scenario' }, { status: 500 });
  }
}

