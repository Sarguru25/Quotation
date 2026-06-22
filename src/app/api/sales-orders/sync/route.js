import { NextResponse } from 'next/server';
import { syncSingleSalesOrder } from '@/lib/zoho-sync/syncSalesOrders';
export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const result = await syncSingleSalesOrder(id);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Webhook sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
