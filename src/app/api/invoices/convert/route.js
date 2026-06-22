import { NextResponse } from 'next/server';
import { convertSOToInvoice } from '@/lib/zoho/invoices';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import SalesOrder from '@/models/SalesOrder';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { salesOrderId } = body;

    if (!salesOrderId) {
      return NextResponse.json({ error: 'Sales Order ID is required' }, { status: 400 });
    }

    const zohoRes = await convertSOToInvoice(salesOrderId);

    if (zohoRes.code === 0 && zohoRes.invoice) {
      const inv = zohoRes.invoice;
      
      await dbConnect();
      
      const newInvoice = new Invoice({
        zohoInvoiceId: inv.invoice_id,
        invoiceNumber: inv.invoice_number,
        referenceNumber: inv.reference_number,
        salesOrderId: salesOrderId,
        customerId: inv.customer_id,
        customerName: inv.customer_name,
        date: inv.date,
        dueDate: inv.due_date,
        status: inv.status,
        subtotal: inv.sub_total,
        taxTotal: inv.tax_total,
        total: inv.total,
        balance: inv.balance,
        amountPaid: inv.total - inv.balance,
        lineItems: inv.line_items,
        createdBy: session.user.id,
        rawZohoData: inv
      });
      await newInvoice.save();

      // Update local Sales Order to reflect invoiced status
      await SalesOrder.findOneAndUpdate(
        { zohoSalesOrderId: salesOrderId },
        { status: 'invoiced' }
      );

      await ActivityLog.create({
        user: session.user.id,
        action: 'CONVERT_SO_TO_INVOICE',
        module: 'Invoice',
        description: `Converted Sales Order to Invoice ${inv.invoice_number}`,
        metadata: { invoiceId: inv.invoice_id, salesOrderId }
      });

      return NextResponse.json({ success: true, data: inv });
    } else {
      return NextResponse.json({ success: false, error: zohoRes.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error converting SO to invoice:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
