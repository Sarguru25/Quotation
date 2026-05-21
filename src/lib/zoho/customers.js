import { zohoFetch } from "./client";

/**
 * Get all customers (contacts)
 */
export async function getCustomers(params = {}) {
  const data = await zohoFetch("/contacts", { params });
  return data.contacts || [];
}

/**
 * Get a specific customer by ID
 */
export async function getCustomerById(id) {
  const data = await zohoFetch(`/contacts/${id}`);
  return data.contact;
}


/**
 * Create a new customer
 */
export async function createCustomer(customerData) {
  const data = await zohoFetch("/contacts", {
    method: "POST",
    body: customerData,
  });
  return data;
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id, customerData) {
  const data = await zohoFetch(`/contacts/${id}`, {
    method: "PUT",
    body: customerData,
  });
  return data;
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id) {
  const data = await zohoFetch(`/contacts/${id}`, {
    method: "DELETE",
  });
  return data;
}