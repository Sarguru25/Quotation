"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function NewItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveItem(e) {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/zoho/items/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        toast.error(
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to save item"
        );
        return;
      }
      toast.success("Item created successfully!");
      router.push("/dashboard/items");
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/items")}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="p-2 bg-blue-600 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">New Item</h1>
            <p className="text-xs text-slate-500">Create a new product or service in Zoho Books</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveItem} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              required
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

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dashboard/items")}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
