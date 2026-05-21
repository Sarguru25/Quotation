import { ZOHO_BASE_URL, ZOHO_CONFIG } from "./config";
import { getZohoAccessToken } from "./auth";

/**
 * Custom Error class for Zoho API requests
 */
export class ZohoApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ZohoApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Core fetch wrapper for Zoho APIs.
 * Handles token injection, organization_id, retries, and error formatting.
 *
 * @param {string} endpoint - API endpoint (e.g. "/estimates")
 * @param {object} options - Fetch options (method, body, headers, params)
 * @returns {Promise<any>} - JSON response data
 */
export async function zohoFetch(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, params = {}, ...restOptions } = options;
  
  let accessToken = await getZohoAccessToken();
  
  // Prepare URL with query parameters
  const urlParams = new URLSearchParams({
    organization_id: ZOHO_CONFIG.organizationId,
    ...params
  });
  
  const url = `${ZOHO_BASE_URL}${endpoint}?${urlParams.toString()}`;

  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...headers,
    },
    ...restOptions,
  };

  if (body) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    let response = await fetch(url, fetchOptions);

    // If unauthorized (token expired), forcefully refresh and retry ONCE
    if (response.status === 401) {
      console.log("[ZOHO CLIENT] Token expired. Retrying with fresh token...");
      accessToken = await getZohoAccessToken(true); // force refresh
      fetchOptions.headers.Authorization = `Zoho-oauthtoken ${accessToken}`;
      response = await fetch(url, fetchOptions);
    }

    // Special handling for PDF downloads (returns binary/blob)
    if (headers.Accept === "application/pdf" || endpoint.endsWith("/pdf")) {
       if (!response.ok) {
           const errorText = await response.text();
           throw new ZohoApiError(`Failed to download PDF`, response.status, errorText);
       }
       // Note: the service layer expects the caller to handle the arrayBuffer/blob
       return response;
    }

    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new ZohoApiError(
        data.message || "Zoho API request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ZohoApiError) throw error;
    
    console.error("[ZOHO CLIENT UNEXPECTED ERROR]", error);
    throw new ZohoApiError(error.message || "Network request failed", 500);
  }
}
