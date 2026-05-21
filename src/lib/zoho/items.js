import { zohoFetch } from "./client";

/**
 * Get all items (products/services)
 */
export async function getItems(params = {}) {
  const data = await zohoFetch("/items", { params });
  return data.items || [];
}

/**
 * Get a specific item by ID
 */
export async function getItemById(id) {
  const data = await zohoFetch(`/items/${id}`);
  return data.item;
}

/**
 * Update an item by ID
 */
export async function updateItem(id, itemData) {
  const data = await zohoFetch(`/items/${id}`, {
    method: "PUT",
    body: itemData,
  });
  return data;
}

/**
 * Delete an item by ID
 */
export async function deleteItem(id) {
  const data = await zohoFetch(`/items/${id}`, {
    method: "DELETE",
  });
  return data;
}

/**
 * Create a new item
 */
export async function createItem(itemData) {
  const data = await zohoFetch("/items", {
    method: "POST",
    body: itemData,
  });
  return data;
}
