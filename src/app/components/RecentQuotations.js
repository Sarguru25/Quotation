"use client";

import { useEffect, useState } from "react";

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchQuotes() {
    try {
      setLoading(true);

      const res = await fetch("/api/zoho/quotes", {
        cache: "no-store", // 🔥 ensures live data
      });

      const data = await res.json();

      console.log("Frontend Data:", data);

      // ✅ always ensure array
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Frontend Error:", err);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
  }, []);

  if (loading) {
    return <p className="p-6">Loading live data from Zoho...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Live Zoho Quotations
        </h1>

        <button
          onClick={fetchQuotes}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-white text-black shadow rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {quotes.length > 0 ? (
              quotes.map((q) => (
                <tr key={q.estimate_id} className="border-b">
                  <td className="px-4 py-3">
                    {q.customer_name}
                  </td>

                  <td className="px-4 py-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {q.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    ₹ {q.total}
                  </td>

                  <td className="px-4 py-3">
                    {q.date
                      ? new Date(q.date).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  No data from Zoho or API error
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}