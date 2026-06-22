import { NextResponse } from 'next/server';
import { syncSalesOrders, syncSingleSalesOrder } from '@/lib/zoho-sync/syncSalesOrders';

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const isIncremental = searchParams.get('incremental') === 'true';

    // Can also accept type from body if preferred
    let body = {};
    try { body = await req.json(); } catch(e) {}
    
    const syncType = isIncremental || body.type === 'incremental' ? 'incremental' : 'manual';
    
    if (id || body.id) {
      const targetId = id || body.id;
      const result = await syncSingleSalesOrder(targetId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
      }
      return NextResponse.json(result);
    }
    
    const result = await syncSalesOrders(syncType);
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('SalesOrders Sync API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
