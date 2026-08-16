import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'futsar-app.zip');
    const rootPath = path.join(process.cwd(), 'futsar-app.zip');

    let finalPath = '';
    if (fs.existsSync(publicPath)) {
      finalPath = publicPath;
    } else if (fs.existsSync(rootPath)) {
      finalPath = rootPath;
    }

    if (!finalPath) {
      return new NextResponse('File zip sumber kode belum ditemukan.', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(finalPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="futsar-app-source.zip"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Error downloading source zip:', err);
    return new NextResponse('Terjadi kesalahan pada server saat mengunduh file.', { status: 500 });
  }
}
