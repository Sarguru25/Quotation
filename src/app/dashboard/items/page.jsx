"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DataTable from "@/app/components/DataTable";
import {
  Plus,
  Image as ImageIcon,
  X,
  RefreshCcw,
  Edit2,
  Trash2,
  Package,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";

export default function ItemsPage() {
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];
  const canCreate = hasPermission(userPermissions, PERMISSIONS.PRODUCT.CREATE);
  const canEdit = hasPermission(userPermissions, PERMISSIONS.PRODUCT.EDIT);
  const canDelete = hasPermission(userPermissions, PERMISSIONS.PRODUCT.DELETE);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Form state
  const initialFormState = {
    name: "",
    product_type: "goods",
    unit: "",
    sku: "",
    rate: "",
    description: "",
    purchase_rate: "",
    purchase_description: "",
  };
  const [form, setForm] = useState(initialFormState);

  const unitOptions = [
    "", "box", "cm", "dz", "ft", "g", "in", "kg", "km", "lb",
    "mg", "ml", "m", "nos", "pcs", "qty", "set",
  ];

  // Debounced search input handler
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput !== search) {
        if (searchInput) params.set("search", searchInput);
        else params.delete("search");
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, pathname, router, searchParams, search]);

  // Handle URL param 'new=true' to auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("new") === "true") {
      openCreateModal();
      window.history.replaceState({}, '', '/dashboard/items');
    }
  }, []);

  const updateUrlParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: queryData, isLoading: loading, refetch: fetchItems } = useQuery({
    queryKey: ['items', page, limit, search],
    queryFn: async () => {
      const res = await fetch(`/api/zoho/items?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    placeholderData: keepPreviousData
  });

  const items = queryData?.data || [];
  const pagination = queryData?.pagination || queryData?.meta || { total: 0, page: 1, limit: 20 };

  function showToast(message, type = "success") {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }

  function openCreateModal() {
    setEditingItemId(null);
    setForm(initialFormState);
    setModalOpen(true);
  }

  async function openEditModal(item) {
    const id = item.item_id || item.zoho_item_id || item._id;
    setEditingItemId(id);
    try {
      const res = await fetch(`/api/zoho/items/${id}`);
      const fullItem = await res.json();
      if (fullItem) {
        setForm({
          name: fullItem.name || "",
          product_type: fullItem.product_type || "goods",
          unit: fullItem.unit || "",
          sku: fullItem.sku || "",
          rate: fullItem.rate || "",
          description: fullItem.description || "",
          purchase_rate: fullItem.purchase_rate || "",
          purchase_description: fullItem.purchase_description || "",
        });
      }
    } catch (e) {
      setForm({
        name: item.name || "",
        product_type: item.product_type || "goods",
        unit: item.unit || "",
        sku: item.sku || "",
        rate: item.rate || "",
        description: item.description || "",
        purchase_rate: item.purchase_rate || "",
        purchase_description: item.purchase_description || "",
      });
    }
    setModalOpen(true);
  }

  async function handleSaveItem() {
    if (!form.name.trim()) {
      showToast("Item name is required", "error");
      return;
    }
    try {
      setSaving(true);
      const url = editingItemId
        ? `/api/zoho/items/${editingItemId}`
        : "/api/zoho/items/create";
      const method = editingItemId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        showToast(
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to save item",
          "error"
        );
        return;
      }
      showToast(`Item ${editingItemId ? "updated" : "created"} successfully!`);
      setModalOpen(false);
      setEditingItemId(null);
      setForm(initialFormState);
      fetchItems();
    } catch (error) {
      showToast("An error occurred while saving", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/zoho/items/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        showToast(
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to delete item",
          "error"
        );
        return;
      }
      showToast("Item deleted successfully");
      fetchItems();
    } catch (error) {
      showToast("An error occurred while deleting", "error");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm shadow-blue-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Items</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {pagination.total || items.length} items synced with Zoho Books
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={openCreateModal}
              className="btn-press flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus size={16} />
              New Item
            </button>
          )}
          <button
            onClick={() => fetchItems()}
            className="btn-press flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="h-[600px]">
        <DataTable
          columns={[
            { label: "", className: "w-14" },
            { label: "Name" },
            { label: "Type" },
            { label: "SKU" },
            { label: "Description" },
            { label: "Selling Price", className: "text-right" },
            { label: "Purchase Rate", className: "text-right" },
            { label: "Actions", className: "text-center" }
          ]}
          data={items}
          loading={loading}
          page={page}
          limit={limit}
          total={pagination.total}
          onPageChange={(p) => updateUrlParams({ page: p })}
          onLimitChange={(l) => updateUrlParams({ limit: l, page: 1 })}
          onSearch={(v) => setSearchInput(v)}
          searchValue={searchInput}
          emptyStateText="No items found"
          emptyStateSubtext="Try adjusting your search criteria or create a new item"
          renderRow={(item, idx) => {
            const id = item.item_id || item.zoho_item_id || item._id;
            return (
              <tr key={id || idx} className="table-row-hover hover:bg-slate-50/70 group">
                <td className="px-5 py-4">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5 opacity-60" />
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                  <Link
                    href={`/dashboard/items/${id}`}
                    className="hover:underline hover:text-blue-800"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 capitalize">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.product_type === "service"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-sky-100 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {item.product_type || "goods"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700">
                  {item.sku || "—"}
                </td>
                <td
                  className="px-5 py-4 text-sm text-slate-600 truncate max-w-[240px]"
                  title={item.description}
                >
                  {item.description || "—"}
                </td>
                <td className="px-5 py-4 text-sm text-slate-800 text-right font-semibold whitespace-nowrap">
                  ₹{formatCurrency(item.rate)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-800 text-right font-semibold whitespace-nowrap">
                  ₹{formatCurrency(item.purchase_rate)}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteItem(id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start overflow-auto z-[100] pt-8 pb-8">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative animate-fade-in mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingItemId ? "Edit Item" : "New Item"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItemId(null);
                  setForm(initialFormState);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-red-500 mb-1.5">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Item name"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Type
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="product_type"
                        value="goods"
                        checked={form.product_type === "goods"}
                        onChange={handleChange}
                        className="accent-blue-600"
                      />
                      Goods
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="product_type"
                        value="service"
                        checked={form.product_type === "service"}
                        onChange={handleChange}
                        className="accent-blue-600"
                      />
                      Service
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u ? u : "Select unit"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="SKU code"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="rate"
                    value={form.rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Sales Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Description for sales transactions"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purchase Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="purchase_rate"
                    value={form.purchase_rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purchase Description
                  </label>
                  <textarea
                    name="purchase_description"
                    value={form.purchase_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Description for purchase transactions"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingItemId(null);
                  setForm(initialFormState);
                }}
                className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
