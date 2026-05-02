"use client";

import { useState } from "react";
import QuotationItemsFields from "./QuotationItemsFields";

export default function QuotationForm({ initialData, onSubmit, saving }) {
  const [customerName, setCustomerName] = useState(initialData.customerName || "");
  const [items, setItems] = useState(
    initialData.items || [{ name: "", quantity: 1, rate: 0 }]
  );
  const [notes, setNotes] = useState(initialData.notes || "");
  const [status, setStatus] = useState(initialData.status || "Draft");

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.rate),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ customerName, items, notes, status });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8"
    >
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Create Quotation
        </h2>
        <p className="text-sm text-gray-500">
          Fill in the details below to generate a quotation.
        </p>
      </div>

      {/* Customer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          placeholder="Enter customer name"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Items
        </label>
        <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
          <QuotationItemsFields items={items} onChange={setItems} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add any additional notes..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4 border-t">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {/* Total */}
        <div className="bg-blue-50 border border-blue-100 px-5 py-3 rounded-xl">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-700">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? "Saving..." : "Save Quotation"}
        </button>
      </div>
    </form>
  );
}