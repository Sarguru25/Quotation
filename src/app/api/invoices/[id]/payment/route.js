import { NextResponse } from 'next/server';
import { recordPayment } from '@/lib/zoho/invoices';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ActivityLog from '@/models/ActivityLog';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params; // invoice id
    const body = await req.json();
    
    // Zoho Payment payload expects customer_id and invoices array
    const zohoRes = await recordPayment({
      customer_id: body.customer_id,
      payment_mode: body.payment_mode,
      amount: body.amount,
      date: body.date,
      reference_number: body.reference_number,
      description: body.description,
      invoices: [
        {
          invoice_id: id,
          amount_applied: body.amount
        }
      ]
    });

    if (zohoRes.code === 0) {
      await dbConnect();
      
      const paymentData = {
        payment_id: zohoRes.payment.payment_id,
        date: body.date,
        amount: body.amount,
        payment_mode: body.payment_mode,
        reference_number: body.reference_number,
        description: body.description
      };

      // Update local db
      await Invoice.findOneAndUpdate(
        { zohoInvoiceId: id },
        { 
          $push: { payments: paymentData },
          $inc: { amountPaid: body.amount, balance: -body.amount }
        }
      );

      await ActivityLog.create({
        user: session.user.id,
        action: 'RECORD_PAYMENT',
        module: 'Invoice',
        description: `Recorded payment of ${body.amount} for Invoice ${id}`,
        metadata: { invoiceId: id, paymentId: zohoRes.payment.payment_id, amount: body.amount }
      });

      return NextResponse.json({ success: true, data: zohoRes.payment, message: 'Payment recorded successfully' });
    } else {
      return NextResponse.json({ success: false, error: zohoRes.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
