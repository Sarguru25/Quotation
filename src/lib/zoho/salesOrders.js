import { zohoFetch } from "./client";

/**
 * Convert a quotation to a Sales Order
 */
export async function convertQuotationToSO(quotationId) {
  // First get the quotation to construct the SO payload
  const quoteData = await zohoFetch(`/estimates/${quotationId}`);
  const quote = quoteData.estimate;

  const soPayload = {
    customer_id: quote.customer_id,
    reference_number: quote.reference_number || quote.estimate_number,
    date: new Date().toISOString().split("T")[0], // Today's date
    line_items: quote.line_items.map((item) => ({
      item_id: item.item_id,
      name: item.name,
      description: item.description,
      rate: item.rate,
      quantity: item.quantity,
      tax_id: item.tax_id,
    })),
    notes: quote.notes,
    terms: quote.terms,
    is_discount_before_tax: quote.is_discount_before_tax,
    discount: quote.discount,
    discount_type: quote.discount_type,
    adjustment: quote.adjustment,
    estimate_id: quotationId, // Links the SO back to the quotation in Zoho
  };

  const data = await zohoFetch("/salesorders", {
    method: "POST",
    body: soPayload,
  });

  return data;
}

/**
 * Get all Sales Orders
 */
export async function getSalesOrders(params = {}) {
  const data = await zohoFetch("/salesorders", { params });
  return data.salesorders || [];
}

/**
 * Create a new Sales Order manually
 */
export async function createSalesOrder(soData) {
  const data = await zohoFetch("/salesorders", {
    method: "POST",
    body: soData,
  });
  return data;
}
