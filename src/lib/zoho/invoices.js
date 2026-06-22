import { zohoFetch } from "./client";

/**
 * Get all Invoices
 */
export async function getInvoices(params = {}) {
  let allInvoices = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const currentParams = { ...params, page };
    const data = await zohoFetch("/invoices", { params: currentParams });
    
    if (data.invoices && data.invoices.length > 0) {
      allInvoices = [...allInvoices, ...data.invoices];
    }
    
    if (data.page_context && data.page_context.has_more_page) {
      page++;
    } else {
      hasMore = false;
    }
  }

  return allInvoices;
}

/**
 * Get a single Invoice
 */
export async function getInvoice(id) {
  const data = await zohoFetch(`/invoices/${id}`);
  return data.invoice || null;
}

/**
 * Create a new Invoice manually
 */
export async function createInvoice(invoiceData) {
  const data = await zohoFetch("/invoices", {
    method: "POST",
    body: invoiceData,
  });
  return data;
}

/**
 * Update an Invoice
 */
export async function updateInvoice(id, invoiceData) {
  const data = await zohoFetch(`/invoices/${id}`, {
    method: "PUT",
    body: invoiceData,
  });
  return data;
}

/**
 * Delete an Invoice
 */
export async function deleteInvoice(id) {
  const data = await zohoFetch(`/invoices/${id}`, {
    method: "DELETE",
  });
  return data;
}

/**
 * Convert a Sales Order to an Invoice
 */
export async function convertSOToInvoice(salesOrderId) {
  const soData = await zohoFetch(`/salesorders/${salesOrderId}`);
  if (!soData || !soData.salesorder) {
    throw new Error("Sales Order not found");
  }
  const so = soData.salesorder;

  const invoicePayload = {
    customer_id: so.customer_id,
    reference_number: so.reference_number || so.salesorder_number,
    date: new Date().toISOString().split("T")[0],
    line_items: so.line_items.map((item) => ({
      item_id: item.item_id,
      name: item.name,
      description: item.description,
      rate: item.rate,
      quantity: item.quantity,
      tax_id: item.tax_id,
    })),
    notes: so.notes,
    terms: so.terms,
    is_discount_before_tax: so.is_discount_before_tax,
    discount: so.discount,
    discount_type: so.discount_type,
    adjustment: so.adjustment,
    salesorder_id: salesOrderId, // Links the Invoice back to the SO in Zoho
  };

  const data = await zohoFetch("/invoices", {
    method: "POST",
    body: invoicePayload,
  });

  return data;
}

/**
 * Download Invoice PDF
 */
export async function downloadInvoicePDF(id) {
  const response = await zohoFetch(`/invoices/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/pdf"
    }
  });
  return response;
}

/**
 * Send Invoice via Email
 */
export async function sendInvoiceEmail(id, emailData) {
  const data = await zohoFetch(`/invoices/${id}/email`, {
    method: "POST",
    body: emailData,
  });
  return data;
}

/**
 * Record a Payment for an Invoice
 */
export async function recordPayment(paymentData) {
  const data = await zohoFetch("/customerpayments", {
    method: "POST",
    body: paymentData,
  });
  return data;
}

/**
 * Update Invoice Status
 */
export async function updateInvoiceStatus(id, status) {
  const data = await zohoFetch(`/invoices/${id}/status/${status}`, {
    method: "POST",
  });
  return data;
}
