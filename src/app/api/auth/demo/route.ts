import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createToken, SESSION_COOKIE_NAME, hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@vestly.app' },
    });

    if (!demoUser) {
      const hash = await hashPassword('Password123!');
      demoUser = await prisma.user.create({
        data: {
          name: 'Alex Morgan (Demo)',
          email: 'demo@vestly.app',
          passwordHash: hash,
        },
      });
    }

    const token = createToken({
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate demo user' }, { status: 500 });
  }
}

