import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/db-queries/getInvoiceById';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const inv = await getInvoiceById(id);
    return NextResponse.json({ success: true, data: inv });
  } catch (error) {
    if (error.message === 'Invoice not found') {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
