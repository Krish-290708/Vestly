import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

    // Size validation: 10 MB max
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10 MB maximum limit' }, { status: 400 });
    }

    // Extension & MIME validation
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || (file.type && !ALLOWED_MIME_TYPES.includes(file.type))) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed formats: PDF, PNG, JPG, DOCX' },
        { status: 400 }
      );
    }

    const grant = await prisma.grant.findFirst({
      where: { id: grantId, userId: user.id },
    });

    if (!grant) {
      return NextResponse.json({ error: 'Grant not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Secure storage: storage/uploads/<userId>/ (never public/)
    const uploadDir = path.join(process.cwd(), 'storage', 'uploads', user.id);
    await mkdir(uploadDir, { recursive: true });

    const sanitizedFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, sanitizedFilename);
    await writeFile(filePath, buffer);

    const relativeStoragePath = `storage/uploads/${user.id}/${sanitizedFilename}`;

    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: {
        documentName: file.name,
        documentPath: relativeStoragePath,
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
      documentPath: relativeStoragePath,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
