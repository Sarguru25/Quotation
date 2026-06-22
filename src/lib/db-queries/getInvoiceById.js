import dbConnect from '../db';
import Invoice from '../../models/Invoice';

import { syncSingleInvoice } from '../zoho-sync/syncInvoices';

export async function getInvoiceById(id) {
  await dbConnect();

  // Support both Mongo _id and Zoho ID
  const query = id.match(/^[0-9a-fA-F]{24}$/) 
    ? { _id: id } 
    : { zoho_invoice_id: id };

  const invoice = await Invoice.findOne(query).lean();
  
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (!invoice.line_items || invoice.line_items.length === 0) {
    try {
      const zohoId = invoice.zoho_invoice_id || id;
      await syncSingleInvoice(zohoId);
      const updatedInvoice = await Invoice.findOne(query).lean();
      return updatedInvoice || invoice;
    } catch (e) {
      console.error('Failed to lazy load line items:', e);
    }
  }

  return invoice;
}
