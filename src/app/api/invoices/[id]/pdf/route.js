import { NextResponse } from 'next/server';
import { downloadInvoicePDF } from '@/lib/zoho/invoices';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const pdfBuffer = await downloadInvoicePDF(id);
    
    if (!pdfBuffer) {
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 400 });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${id}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error downloading Invoice PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
