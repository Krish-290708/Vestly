import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const grant = await prisma.grant.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    if (!grant.documentPath) {
      return NextResponse.json({ error: 'No document attached to this grant' }, { status: 404 });
    }

    const filePath = path.resolve(process.cwd(), grant.documentPath);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Document file not found on storage' }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(grant.documentName || grant.documentPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const safeFilename = encodeURIComponent(grant.documentName || 'grant_document');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Download document error:', error);
    return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
  }
}

