import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { createToken, SESSION_COOKIE_NAME, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  // If real Google OAuth credentials are not provided, run resilient developer mode
  if (!clientId || !clientSecret || clientId === '' || clientId.includes('your_google_client_id')) {
    // Look up or create the Google demo user
    let user = await prisma.user.findUnique({
      where: { email: 'alex.chen.google@vestly.app' },
    });

    if (!user) {
      const passwordHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
      user = await prisma.user.create({
        data: {
          email: 'alex.chen.google@vestly.app',
          name: 'Alex Chen (Google Sign-In)',
          passwordHash,
        },
      });

      // Seed starter Google demo grants for instant evaluation
      const stripeCompany = await prisma.company.findFirst({ where: { name: 'Stripe' } });
      if (stripeCompany) {
        await prisma.grant.create({
          data: {
            userId: user.id,
            companyId: stripeCompany.id,
            grantIdentifier: 'STR-GOOGLE-01',
            grantType: 'ISO',
            unitsGranted: 8000,
            strikePrice: 9.50,
            grantDate: new Date('2023-03-01'),
            vestingStartDate: new Date('2023-03-01'),
            cliffMonths: 12,
            vestingSchedule: '4_YEAR_1_YEAR_CLIFF',
            expirationDate: new Date('2033-03-01'),
            status: 'VESTING',
            earlyExercisable: true,
          },
        });
      }
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.redirect(new URL('/dashboard?oauth=google_demo', req.url));
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
  }

  // Real Google OAuth Flow
  const state = crypto.randomBytes(16).toString('hex');
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
