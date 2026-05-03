"use client";

import { useEffect, useState } from "react";
import {
  RefreshCcw,
  Plus,
  X,
  Trash2,
  Edit,
  FileText,
  Search,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES = {
  draft:    "bg-amber-100 text-amber-700 border border-amber-200",
  sent:     "bg-blue-100 text-blue-700 border border-blue-200",
  accepted: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  declined: "bg-red-100 text-red-700 border border-red-200",
  expired:  "bg-slate-100 text-slate-600 border border-slate-200",
};

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        {...props}
        className="input-field w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <textarea
        {...props}
        className="input-field w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white resize-none"
        rows={3}
      />
    </div>
  );
}

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    customer_id: "",
    customer_name: "",
    reference_number: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    notes: "",
    terms: "",
    line_items: [{ name: "", quantity: 1, rate: 0 }],
  };

  const [form, setForm] = useState(initialFormState);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchQuotes() {
    try {
      setLoading(true);
      const res = await fetch("/api/zoho/quotes", { cache: "no-store" });
      const data = await res.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/zoho/customers", { cache: "no-store" });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  }

  useEffect(() => {
    fetchQuotes();
    fetchCustomers();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleItemChange(index, field, value) {
    const updated = [...form.line_items];
    updated[index][field] = field === "quantity" || field === "rate" ? Number(value) : value;
    setForm((prev) => ({ ...prev, line_items: updated }));
  }

  function addRow() {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { name: "", quantity: 1, rate: 0 }],
    }));
  }

  function removeRow(index) {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  }

  const total = form.line_items.reduce((acc, item) => acc + item.quantity * item.rate, 0);

  async function handleSaveQuotation() {
    if (!form.customer_id) { showToast("Please select a customer", "error"); return; }
    try {
      setSaving(true);
      const url = editingId ? `/api/zoho/quotes/${editingId}` : "/api/zoho/quotes/create";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        showToast(data.error || "Failed to save", "error");
        return;
      }
      showToast(`Quotation ${editingId ? "updated" : "created"} successfully!`);
      setOpen(false);
      setEditingId(null);
      setForm(initialFormState);
      fetchQuotes();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuotation(id) {
    if (!window.confirm("Delete this quotation? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/zoho/quotes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) { showToast(data.error || "Failed to delete", "error"); return; }
      showToast("Quotation deleted successfully");
      fetchQuotes();
    } catch { showToast("Something went wrong", "error"); }
  }

  async function openEditModal(quote) {
    setEditingId(quote.estimate_id);
    try {
      const res = await fetch(`/api/zoho/quotes/${quote.estimate_id}`);
      const fullQuote = await res.json();
      if (fullQuote) {
        setForm({
          customer_id: fullQuote.customer_id || "",
          customer_name: fullQuote.customer_name || "",
          reference_number: fullQuote.reference_number || "",
          subject: fullQuote.subject || "",
          date: fullQuote.date || new Date().toISOString().split("T")[0],
          expiry_date: fullQuote.expiry_date || "",
          notes: fullQuote.notes || "",
          terms: fullQuote.terms || "",
          line_items: fullQuote.line_items?.map((item) => ({
            line_item_id: item.line_item_id,
            item_id: item.item_id,
            name: item.name || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          })) || [{ name: "", quantity: 1, rate: 0 }],
        });
      }
    } catch (error) { console.error(error); }
    setOpen(true);
  }

  const filtered = quotes.filter(
    (q) =>
      q.estimate_number?.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.reference_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="shimmer h-8 w-48 rounded-lg" />
          <div className="shimmer h-8 w-24 rounded-lg ml-auto" />
        </div>
        <div className="shimmer h-12 w-full rounded-xl mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer h-14 w-full rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium transition-all duration-300
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : "✓"}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {quotes.length} quotation{quotes.length !== 1 ? "s" : ""} from Zoho
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingId(null); setForm(initialFormState); setOpen(true); }}
            className="btn-press flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
          >
            <Plus size={16} />
            New Quotation
          </button>
          <button
            onClick={fetchQuotes}
            className="btn-press flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by quote no., customer, or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote No.</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref No.</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((q) => (
                  <tr key={q.estimate_id} className="table-row-hover hover:bg-slate-50/70 group">
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(q.date)}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/quotations/${q.estimate_id}`}
                        className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 group-hover:underline"
                      >
                        <FileText size={13} className="flex-shrink-0" />
                        {q.estimate_number}
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{q.reference_number || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{q.customer_name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => deleteQuotation(q.estimate_id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No quotations found</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your search or create a new quotation</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {open && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/60 flex justify-center items-start overflow-auto z-50 p-4 md:p-10">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 my-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Quotation" : "New Quotation"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {editingId ? "Update the quotation details below" : "Fill in the details to create a new quotation"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-7 py-6 space-y-6">
              {/* Customer Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer *</label>
                <select
                  value={form.customer_id}
                  onChange={(e) => {
                    const selected = customers.find((c) => c.contact_id === e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      customer_id: e.target.value,
                      customer_name: selected?.contact_name || "",
                    }));
                  }}
                  className="input-field w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-slate-50 focus:bg-white"
                >
                  <option value="">— Select a customer —</option>
                  {customers.map((c) => (
                    <option key={c.contact_id} value={c.contact_id}>
                      {c.contact_name}{c.company_name && c.company_name !== c.contact_name ? ` (${c.company_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="Reference Number" type="text" name="reference_number" value={form.reference_number} onChange={handleChange} placeholder="e.g. REF-001" />
                <InputField label="Quote Date" type="date" name="date" value={form.date} onChange={handleChange} />
                <InputField label="Expiry Date" type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} />
                <InputField label="Subject" type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Sales Quote for XYZ" />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Line Items</h3>
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Qty</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Rate (₹)</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Amount</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {form.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input type="text" value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)}
                              className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" placeholder="Item description" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="input-field w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" min={1} />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                              className="input-field w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white" min={0} />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-700">
                            {formatCurrency(item.quantity * item.rate)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button onClick={() => removeRow(index)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end mt-3">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-3 flex items-center gap-6">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-xl font-bold text-indigo-700">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextAreaField label="Customer Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes for the customer..." />
                <TextAreaField label="Terms & Conditions" name="terms" value={form.terms} onChange={handleChange} placeholder="Payment terms, delivery conditions..." />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-7 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <button onClick={() => setOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveQuotation}
                disabled={saving}
                className="btn-press px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
              >
                {saving ? "Saving…" : editingId ? "Update Quotation" : "Create Quotation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}