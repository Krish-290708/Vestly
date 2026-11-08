import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '../src/app/api/grants/[id]/document/route';
import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/db';
import { createToken, SESSION_COOKIE_NAME, hashPassword } from '../src/lib/auth';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';

describe('Document Access Authorization (GET /api/grants/[id]/document)', () => {
  let userA: any;
  let userB: any;
  let grantA: any;
  const testStorageDir = path.join(process.cwd(), 'storage', 'uploads');

  beforeAll(async () => {
    const passwordHash = await hashPassword('TestPass123!');

    // Create User A
    userA = await prisma.user.create({
      data: {
        name: 'User A',
        email: `usera_${Date.now()}@test.vestly.app`,
        passwordHash,
      },
    });

    // Create User B
    userB = await prisma.user.create({
      data: {
        name: 'User B',
        email: `userb_${Date.now()}@test.vestly.app`,
        passwordHash,
      },
    });

    // Company
    const company = await prisma.company.findFirst() || await prisma.company.create({
      data: {
        name: `TestCo_${Date.now()}`,
        latestFmvPerShare: 20,
      },
    });

    // Create file on disk
    const userADir = path.join(testStorageDir, userA.id);
    await mkdir(userADir, { recursive: true });
    const testDocPath = path.join(userADir, 'test_agreement.pdf');
    await writeFile(testDocPath, Buffer.from('%PDF-1.4 test content'));

    // Create Grant for User A
    grantA = await prisma.grant.create({
      data: {
        userId: userA.id,
        companyId: company.id,
        grantIdentifier: 'TEST-ISO-A',
        grantType: 'ISO',
        unitsGranted: 1000,
        strikePrice: 2,
        grantDate: new Date(),
        vestingStartDate: new Date(),
        expirationDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        documentName: 'test_agreement.pdf',
        documentPath: `storage/uploads/${userA.id}/test_agreement.pdf`,
      },
    });
  });

  afterAll(async () => {
    if (grantA) {
      await prisma.grant.deleteMany({ where: { id: grantA.id } });
    }
    if (userA) {
      await prisma.user.deleteMany({ where: { id: userA.id } });
      await rm(path.join(testStorageDir, userA.id), { recursive: true, force: true }).catch(() => {});
    }
    if (userB) {
      await prisma.user.deleteMany({ where: { id: userB.id } });
    }
  });

  it('returns 401 when request is logged out (no session cookie)', async () => {
    const req = new NextRequest(`http://localhost:3000/api/grants/${grantA.id}/document`);
    const res = await GET(req, { params: { id: grantA.id } });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 404 when request is from another user (User B attempting to view User A grant)', async () => {
    const tokenB = createToken({ userId: userB.id, email: userB.email, name: userB.name });
    const req = new NextRequest(`http://localhost:3000/api/grants/${grantA.id}/document`);
    req.cookies.set(SESSION_COOKIE_NAME, tokenB);
    const res = await GET(req, { params: { id: grantA.id } });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Grant not found');
  });

  it('returns 200 with file content when grant owner requests document', async () => {
    const tokenA = createToken({ userId: userA.id, email: userA.email, name: userA.name });
    const req = new NextRequest(`http://localhost:3000/api/grants/${grantA.id}/document`);
    req.cookies.set(SESSION_COOKIE_NAME, tokenA);
    const res = await GET(req, { params: { id: grantA.id } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    const bytes = await res.arrayBuffer();
    expect(Buffer.from(bytes).toString()).toContain('%PDF-1.4 test content');
  });
});
