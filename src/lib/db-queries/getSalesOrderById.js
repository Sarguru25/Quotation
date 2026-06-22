import dbConnect from '../db';
import SalesOrder from '../../models/SalesOrder';

import { syncSingleSalesOrder } from '../zoho-sync/syncSalesOrders';

export async function getSalesOrderById(id) {
  await dbConnect();

  // Support both Mongo _id and Zoho ID
  const query = id.match(/^[0-9a-fA-F]{24}$/) 
    ? { _id: id } 
    : { zoho_salesorder_id: id };

  const salesOrder = await SalesOrder.findOne(query).lean();
  
  if (!salesOrder) {
    throw new Error('Sales Order not found');
  }

  if (!salesOrder.line_items || salesOrder.line_items.length === 0) {
    try {
      const zohoId = salesOrder.zoho_salesorder_id || id;
      await syncSingleSalesOrder(zohoId);
      const updatedOrder = await SalesOrder.findOne(query).lean();
      return updatedOrder || salesOrder;
    } catch (e) {
      console.error('Failed to lazy load line items:', e);
    }
  }

  return salesOrder;
}
