import { zohoFetch } from "./client";

/**
 * Get all quotations (estimates)
 */
export async function getQuotations(params = {}) {
  const data = await zohoFetch("/estimates", { params });
  return data.estimates || [];
}

/**
 * Get a specific quotation by ID
 */
export async function getQuotationById(id) {
  const data = await zohoFetch(`/estimates/${id}`);
  return data.estimate;
}

/**
 * Create a new quotation
 */
export async function createQuotation(quotationData) {
  const data = await zohoFetch("/estimates", {
    method: "POST",
    body: quotationData,
  });
  return data;
}

/**
 * Update an existing quotation
 */
export async function updateQuotation(id, quotationData) {
  const data = await zohoFetch(`/estimates/${id}`, {
    method: "PUT",
    body: quotationData,
  });
  return data;
}

/**
 * Delete a quotation
 */
export async function deleteQuotation(id) {
  const data = await zohoFetch(`/estimates/${id}`, {
    method: "DELETE",
  });
  return data;
}

/**
 * Mark a quotation as sent
 */
export async function markQuotationAsSent(id) {
  const data = await zohoFetch(`/estimates/${id}/status/sent`, {
    method: "POST",
  });
  return data;
}

/**
 * Mark a quotation as accepted
 */
export async function markQuotationAsAccepted(id) {
  const data = await zohoFetch(`/estimates/${id}/status/accepted`, {
    method: "POST",
  });
  return data;
}

/**
 * Email a quotation
 */
export async function sendQuotationEmail(id, emailParams) {
  const data = await zohoFetch(`/estimates/${id}/email`, {
    method: "POST",
    body: emailParams,
  });
  return data;
}

/**
 * Download Quotation PDF
 * Returns the raw Fetch response to be handled as a stream or blob
 */
export async function downloadQuotationPDF(id) {
  const response = await zohoFetch(`/estimates/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/pdf"
    }
  });
  return response;
}
