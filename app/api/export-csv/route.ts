import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { users } = await req.json();
    if (!Array.isArray(users)) {
      return new NextResponse('Invalid user data', { status: 400 });
    }

    const headers = ['Nama', 'ID Member', 'Posisi', 'No Punggung', 'WhatsApp', 'Status Akun', 'Status Kas', 'Poin', 'Bio / Motto'];
    const rows = users.map((u: any) => [
      `"${(u.nama || '').replace(/"/g, '""')}"`,
      `"${(u.id || '').replace(/"/g, '""')}"`,
      `"${(u.posisi || '').replace(/"/g, '""')}"`,
      `"${(u.jerseyNumber ? '#' + u.jerseyNumber : '-').replace(/"/g, '""')}"`,
      `"${(u.wa || '').replace(/"/g, '""')}"`,
      `"${(u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Menunggu' : 'Ditolak')}"`,
      `"${(u.isPaid ? 'Lunas' : 'Belum Lunas')}"`,
      `"${(u.points || 0)}"`,
      `"${(u.bio || '-').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rekap_futsar_${dateStr}.csv"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return new NextResponse('Internal error exporting CSV', { status: 500 });
  }
}
