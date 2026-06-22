import { NextResponse } from 'next/server';
import { updateSOStatus } from '@/lib/zoho/salesOrders';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ActivityLog from '@/models/ActivityLog';
import dbConnect from '@/lib/db';
import SalesOrder from '@/models/SalesOrder';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const zohoRes = await updateSOStatus(id, status);

    if (zohoRes.code === 0) {
      await dbConnect();
      
      // Update local db
      await SalesOrder.findOneAndUpdate(
        { zohoSalesOrderId: id },
        { status: status }
      );

      await ActivityLog.create({
        user: session.user.id,
        action: 'UPDATE_SALES_ORDER_STATUS',
        module: 'SalesOrder',
        description: `Updated Sales Order status to ${status}`,
        metadata: { salesOrderId: id, status }
      });

      return NextResponse.json({ success: true, message: 'Status updated successfully' });
    } else {
      return NextResponse.json({ success: false, error: zohoRes.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
