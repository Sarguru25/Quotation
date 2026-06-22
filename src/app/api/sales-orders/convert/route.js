import { NextResponse } from 'next/server';
import { convertQuotationToSO } from '@/lib/zoho/salesOrders';
import dbConnect from '@/lib/db';
import SalesOrder from '@/models/SalesOrder';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { quotationId } = body;

    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }

    const zohoRes = await convertQuotationToSO(quotationId);

    if (zohoRes.code === 0 && zohoRes.salesorder) {
      const so = zohoRes.salesorder;
      
      // Save to local MongoDB
      await dbConnect();
      
      const newSo = new SalesOrder({
        zohoSalesOrderId: so.salesorder_id,
        salesOrderNumber: so.salesorder_number,
        referenceNumber: so.reference_number,
        quotationId: quotationId,
        customerId: so.customer_id,
        customerName: so.customer_name,
        date: so.date,
        status: so.status,
        subtotal: so.sub_total,
        taxTotal: so.tax_total,
        total: so.total,
        lineItems: so.line_items,
        createdBy: session.user.id,
        rawZohoData: so
      });
      await newSo.save();

      await ActivityLog.create({
        user: session.user.id,
        action: 'CONVERT_QUOTATION_TO_SO',
        module: 'SalesOrder',
        description: `Converted Quotation to Sales Order ${so.salesorder_number}`,
        metadata: { salesOrderId: so.salesorder_id, quotationId }
      });

      return NextResponse.json({ success: true, data: so });
    } else {
      return NextResponse.json({ success: false, error: zohoRes.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error converting quotation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
