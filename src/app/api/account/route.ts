import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = user.id;

    // 1. Delete user files from storage/uploads/<userId>
    const userStorageDir = path.resolve(process.cwd(), 'storage', 'uploads', userId);
    try {
      await fs.rm(userStorageDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Storage cleanup warning:', err);
    }

    // 2. Cascade delete in Prisma transaction
    await prisma.$transaction(async (tx) => {
      // Find grant IDs
      const grants = await tx.grant.findMany({
        where: { userId },
        select: { id: true },
      });
      const grantIds = grants.map((g) => g.id);

      // Delete grant vesting events & reminders
      if (grantIds.length > 0) {
        await tx.vestingEvent.deleteMany({
          where: { grantId: { in: grantIds } },
        });
        await tx.exerciseEvent.deleteMany({
          where: { grantId: { in: grantIds } },
        });
        await tx.grant.deleteMany({
          where: { id: { in: grantIds } },
        });
      }

      // Delete user actions/reminders
      await tx.actionReminder.deleteMany({
        where: { userId },
      });

      // Delete watchlist items
      await tx.watchlistItem.deleteMany({
        where: { userId },
      });

      // Delete saved scenarios
      await tx.savedScenario.deleteMany({
        where: { userId },
      });

      // Delete learn progress
      await tx.learnProgress.deleteMany({
        where: { userId },
      });

      // Delete audit logs
      await tx.auditLog.deleteMany({
        where: { userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    const response = NextResponse.json({ success: true, message: 'Account deleted' });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
