import { NextResponse } from 'next/server';
import { getSalesOrderById } from '@/lib/db-queries/getSalesOrderById';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const so = await getSalesOrderById(id);
    return NextResponse.json({ success: true, data: so });
  } catch (error) {
    if (error.message === 'Sales Order not found') {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    }
    console.error('Error fetching sales order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
