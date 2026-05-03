"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Plus, X, Trash2, Edit, Users, Search, AlertCircle, Mail, Phone, Building2 } from "lucide-react";

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    contact_name: "",
    company_name: "",
    email: "",
    phone: "",
  };

  const [form, setForm] = useState(initialFormState);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchCustomers() {
    try {
      setLoading(true);
      const res = await fetch("/api/zoho/customers", { cache: "no-store" });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCustomers(); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveCustomer() {
    if (!form.contact_name.trim()) { showToast("Contact name is required", "error"); return; }
    try {
      setSaving(true);
      const url = editingId ? `/api/zoho/customers/${editingId}` : "/api/zoho/customers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) { showToast(data.error || "Failed to save", "error"); return; }
      showToast(`Customer ${editingId ? "updated" : "created"} successfully!`);
      setOpen(false);
      setEditingId(null);
      setForm(initialFormState);
      fetchCustomers();
    } catch { showToast("Something went wrong", "error"); }
    finally { setSaving(false); }
  }

  async function deleteCustomer(id) {
    if (!window.confirm("Delete this customer? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/zoho/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) { showToast(data.error || "Failed to delete", "error"); return; }
      showToast("Customer deleted successfully");
      fetchCustomers();
    } catch { showToast("Something went wrong", "error"); }
  }

  async function openEditModal(customer) {
    setEditingId(customer.contact_id);
    try {
      const res = await fetch(`/api/zoho/customers/${customer.contact_id}`);
      const full = await res.json();
      if (full) setForm({ contact_name: full.contact_name || "", company_name: full.company_name || "", email: full.email || "", phone: full.phone || "" });
    } catch (error) { console.error(error); }
    setOpen(true);
  }

  const filtered = customers.filter(
    (c) =>
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getInitials(name) {
    return (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  const AVATAR_COLORS = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
    "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
  ];
  function avatarColor(name) {
    const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="shimmer h-8 w-40 rounded-lg" />
          <div className="shimmer h-8 w-28 rounded-lg ml-auto" />
        </div>
        <div className="shimmer h-12 w-full rounded-xl mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer h-16 w-full rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : "✓"}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} from Zoho
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingId(null); setForm(initialFormState); setOpen(true); }}
            className="btn-press flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
          >
            <Plus size={16} /> New Customer
          </button>
          <button
            onClick={fetchCustomers}
            className="btn-press flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, company or email..."
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
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.contact_id} className="table-row-hover hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColor(c.contact_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(c.contact_name)}
                        </div>
                        <span className="font-medium text-slate-800">{c.contact_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.company_name ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Building2 size={13} className="text-slate-400" />
                          {c.company_name}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800">
                          <Mail size={13} />
                          {c.email}
                        </a>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.phone ? (
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={13} className="text-slate-400" />
                          {c.phone}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.contact_id)}
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
                  <td colSpan="5" className="py-16 text-center">
                    <Users size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No customers found</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your search or add a new customer</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="modal-backdrop fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Customer" : "New Customer"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {editingId ? "Update the contact details" : "Add a new Zoho contact"}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-7 py-6 grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <InputField label="Contact Name *" type="text" name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="e.g. John Doe" required />
              </div>
              <div className="col-span-2">
                <InputField label="Company Name" type="text" name="company_name" value={form.company_name} onChange={handleChange} placeholder="e.g. Acme Corp" />
              </div>
              <InputField label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. john@example.com" />
              <InputField label="Phone" type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" />
            </div>

            <div className="flex justify-end gap-3 px-7 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <button onClick={() => setOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                disabled={saving}
                className="btn-press px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
              >
                {saving ? "Saving…" : editingId ? "Update Customer" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
