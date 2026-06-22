import { NextResponse } from 'next/server';
import { sendSOEmail } from '@/lib/zoho/salesOrders';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ActivityLog from '@/models/ActivityLog';
import dbConnect from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const zohoRes = await sendSOEmail(id, body);

    if (zohoRes.code === 0) {
      await dbConnect();
      await ActivityLog.create({
        user: session.user.id,
        action: 'SEND_SALES_ORDER',
        module: 'SalesOrder',
        description: `Sent Sales Order ${id} to customer`,
        metadata: { salesOrderId: id, to_mail_ids: body.to_mail_ids }
      });

      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ success: false, error: zohoRes.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
