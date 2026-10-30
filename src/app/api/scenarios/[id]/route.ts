import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scenario = await prisma.savedScenario.findFirst({
      where: {
        id: params.id,
        userId: user.id,
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

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    let parsedInputs = {};
    try {
      parsedInputs = JSON.parse(scenario.inputs);
    } catch {
      parsedInputs = {};
    }

    return NextResponse.json({
      scenario: {
        ...scenario,
        parsedInputs,
      },
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    return NextResponse.json({ error: 'Failed to fetch scenario' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.savedScenario.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    await prisma.savedScenario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return NextResponse.json({ error: 'Failed to delete scenario' }, { status: 500 });
  }
}

