import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { createToken, SESSION_COOKIE_NAME, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state')?.value;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=Google+authorization+declined', req.url));
  }

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=Invalid+OAuth+state', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error('Google token exchange error:', errData);
      return NextResponse.redirect(new URL('/login?error=Token+exchange+failed', req.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=Failed+to+fetch+user+profile', req.url));
    }

    const googleUser = await userRes.json();
    const email = googleUser.email?.toLowerCase().trim();
    const name = googleUser.name || googleUser.given_name || 'Google User';

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=No+email+provided+by+Google', req.url));
    }

    // Look up or create user in Prisma database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = await hashPassword(randomPassword);
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.redirect(new URL('/dashboard?oauth=google_success', req.url));
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete('oauth_state');

    return response;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=Google+authentication+failed', req.url));
  }
}
