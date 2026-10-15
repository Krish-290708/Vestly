import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const grantId = formData.get('grantId') as string | null;

    if (!file || !grantId) {
      return NextResponse.json({ error: 'File and grantId are required' }, { status: 400 });
    }

    const grant = await prisma.grant.findFirst({
      where: { id: grantId, userId: user.id },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const sanitizedFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, sanitizedFilename);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/${sanitizedFilename}`;

    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: {
        documentName: file.name,
        documentPath: relativePath,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        grantId: grant.id,
        action: 'DOCUMENT_UPLOADED',
        details: `Uploaded agreement document: ${file.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      documentName: file.name,
      documentPath: relativePath,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

