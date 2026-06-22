import { zohoFetch } from "./client";

/**
 * Convert a quotation to a Sales Order
 */
export async function convertQuotationToSO(quotationId) {
  // First get the quotation to construct the SO payload
  const quoteData = await zohoFetch(`/estimates/${quotationId}`);
  if (!quoteData || !quoteData.estimate) {
    throw new Error("Quotation not found");
  }
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
  let allSalesOrders = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const currentParams = { ...params, page };
    const data = await zohoFetch("/salesorders", { params: currentParams });
    
    if (data.salesorders && data.salesorders.length > 0) {
      allSalesOrders = [...allSalesOrders, ...data.salesorders];
    }
    
    if (data.page_context && data.page_context.has_more_page) {
      page++;
    } else {
      hasMore = false;
    }
  }

  return allSalesOrders;
}

/**
 * Get a single Sales Order
 */
export async function getSalesOrder(id) {
  const data = await zohoFetch(`/salesorders/${id}`);
  return data.salesorder || null;
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

/**
 * Update a Sales Order
 */
export async function updateSalesOrder(id, soData) {
  const data = await zohoFetch(`/salesorders/${id}`, {
    method: "PUT",
    body: soData,
  });
  return data;
}

/**
 * Delete a Sales Order
 */
export async function deleteSalesOrder(id) {
  const data = await zohoFetch(`/salesorders/${id}`, {
    method: "DELETE",
  });
  return data;
}

/**
 * Download Sales Order PDF
 */
export async function downloadSOPDF(id) {
  const response = await zohoFetch(`/salesorders/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/pdf"
    }
  });
  return response;
}

/**
 * Send Sales Order via Email
 */
export async function sendSOEmail(id, emailData) {
  const data = await zohoFetch(`/salesorders/${id}/email`, {
    method: "POST",
    body: emailData,
  });
  return data;
}

/**
 * Update Sales Order Status
 */
export async function updateSOStatus(id, status) {
  // Zoho provides specific endpoints to change status like /status/confirmed
  const data = await zohoFetch(`/salesorders/${id}/status/${status}`, {
    method: "POST",
  });
  return data;
}
