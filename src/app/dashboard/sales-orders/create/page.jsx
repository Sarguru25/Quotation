"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [toast, setToast] = useState(null);

  const initialForm = {
    customer_id: "",
    salesorder_number: "",
    reference_number: "",
    date: new Date().toISOString().split("T")[0],
    shipment_date: "",
    line_items: [{ item_id: "", name: "", description: "", quantity: 1, rate: 0, tax_id: "" }],
    notes: "",
    terms: "",
    discount: 0,
    adjustment: 0
  };

  const [form, setForm] = useState(initialForm);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, itemsRes, taxesRes] = await Promise.all([
          fetch("/api/zoho/customers"),
          fetch("/api/zoho/items"),
          fetch("/api/zoho/taxes")
        ]);
        
        const custData = await custRes.json();
        const itemsData = await itemsRes.json();
        const taxesData = await taxesRes.json();

        if (custData.data) setCustomers(custData.data);
        if (itemsData.data) setItems(itemsData.data);
        if (taxesData.data) setTaxes(taxesData.data);
      } catch (err) {
        console.error("Failed to load reference data", err);
      }
    }
    fetchData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleItemChange(index, field, value) {
    const updated = [...form.line_items];
    updated[index][field] = (field === "quantity" || field === "rate") ? Number(value) : value;
    
    // Auto populate item details if item_id changes
    if (field === "item_id") {
      const selectedItem = items.find(i => (i.item_id || i.zoho_item_id || i._id) === value);
      if (selectedItem) {
        updated[index].name = selectedItem.name;
        updated[index].description = selectedItem.description || "";
        updated[index].rate = selectedItem.rate || 0;
        updated[index].tax_id = selectedItem.tax_id || selectedItem.zoho_tax_id || "";
      }
    }
    
    setForm(prev => ({ ...prev, line_items: updated }));
  }

  function addRow() {
    setForm(prev => ({
      ...prev,
      line_items: [...prev.line_items, { item_id: "", name: "", description: "", quantity: 1, rate: 0, tax_id: "" }]
    }));
  }

  function removeRow(index) {
    if (form.line_items.length <= 1) return;
    setForm(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  }

  function getTaxPercentage(taxId) {
    if (!taxId) return 0;
    const tax = taxes.find(t => (t.zoho_tax_id || t.tax_id || t._id) === taxId);
    return tax ? tax.tax_percentage : 0;
  }

  const subTotal = form.line_items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const discountAmount = parseFloat(form.discount) || 0;
  const afterDiscount = subTotal - discountAmount;
  const taxTotal = form.line_items.reduce((acc, item) => {
    const lineAmount = item.quantity * item.rate;
    const taxPct = getTaxPercentage(item.tax_id);
    return acc + (lineAmount * taxPct) / 100;
  }, 0);
  const adjustment = parseFloat(form.adjustment) || 0;
  const total = afterDiscount + taxTotal + adjustment;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_id) {
      showToast("Please select a customer", "error");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/zoho/sales-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        showToast("Sales Order created successfully");
        setTimeout(() => {
          router.push("/dashboard/sales-orders");
        }, 1500);
      } else {
        showToast(data.error || "Failed to create", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium transition-all duration-300
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales-orders" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">New Sales Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer *</label>
              <select
                name="customer_id"
                value={form.customer_id}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customer_id || c.zoho_customer_id || c._id} value={c.customer_id || c.zoho_customer_id || c._id}>
                    {c.customer_name || c.contact_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sales Order #</label>
              <input
                type="text"
                name="salesorder_number"
                value={form.salesorder_number}
                onChange={handleChange}
                placeholder="Leave blank to auto-generate"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference #</label>
              <input
                type="text"
                name="reference_number"
                value={form.reference_number}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Shipment Date</label>
                <input
                  type="date"
                  name="shipment_date"
                  value={form.shipment_date}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium w-1/3">Item Details</th>
                  <th className="px-5 py-3 font-medium w-24">Qty</th>
                  <th className="px-5 py-3 font-medium w-32">Rate</th>
                  <th className="px-5 py-3 font-medium w-40">Tax</th>
                  <th className="px-5 py-3 font-medium w-32 text-right">Amount</th>
                  <th className="px-3 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {form.line_items.map((item, index) => {
                   const itemTaxPct = getTaxPercentage(item.tax_id);
                   const amount = item.quantity * item.rate;
                   
                   return (
                  <tr key={index}>
                    <td className="px-5 py-4">
                      <select
                        value={item.item_id}
                        onChange={(e) => handleItemChange(index, "item_id", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2 bg-slate-50 focus:bg-white outline-none"
                      >
                        <option value="">Select an Item</option>
                        {items.map(i => (
                          <option key={i.item_id || i.zoho_item_id || i._id} value={i.item_id || i.zoho_item_id || i._id}>{i.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2 bg-slate-50 focus:bg-white outline-none"
                      />
                      <textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white outline-none resize-none h-16"
                      />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white outline-none text-center"
                      />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white outline-none text-right"
                      />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <select
                        value={item.tax_id}
                        onChange={(e) => handleItemChange(index, "tax_id", e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white outline-none"
                      >
                        <option value="">Non-Taxable</option>
                        {taxes.map(t => (
                          <option key={t.tax_id || t.zoho_tax_id || t._id} value={t.tax_id || t.zoho_tax_id || t._id}>
                            {t.tax_name} ({t.tax_percentage}%)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 align-top text-right font-medium text-slate-800 pt-6">
                      {amount.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 align-top pt-6">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={form.line_items.length <= 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Plus size={16} />
              Add another line
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Will be displayed on the sales order"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:border-indigo-500 outline-none resize-none h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Terms & Conditions</label>
              <textarea
                name="terms"
                value={form.terms}
                onChange={handleChange}
                placeholder="Enter the terms and conditions"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:border-indigo-500 outline-none resize-none h-24"
              />
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 self-start">
             <div className="space-y-4 text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-slate-600">Subtotal</span>
                 <span className="font-medium text-slate-800">{subTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <span className="text-slate-600">Discount Amount</span>
                 </div>
                 <input
                   type="number"
                   name="discount"
                   value={form.discount}
                   onChange={handleChange}
                   className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-right outline-none focus:border-indigo-500"
                 />
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600">Tax</span>
                 <span className="font-medium text-slate-800">{taxTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600">Adjustment</span>
                 <input
                   type="number"
                   name="adjustment"
                   value={form.adjustment}
                   onChange={handleChange}
                   className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-right outline-none focus:border-indigo-500"
                 />
               </div>
               <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                 <span className="font-bold text-slate-900">Total (INR)</span>
                 <span className="font-bold text-xl text-indigo-700">{total.toFixed(2)}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/dashboard/sales-orders"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" />
            ) : (
              <Save size={16} />
            )}
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
}
