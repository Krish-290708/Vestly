import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await prisma.watchlistItem.findMany({
      where: { userId: user.id },
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ watchlist: items });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { companyId } = await req.json();
    if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });

    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    });

    if (existing) {
      // Toggle off (remove)
      await prisma.watchlistItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isWatchlisted: false });
    }

    // Toggle on (add)
    const item = await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        companyId,
      },
      include: { company: true },
    });

    return NextResponse.json({ success: true, isWatchlisted: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
  }
}

