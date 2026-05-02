"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, approved: 0 });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {session?.user?.name}</h1>
        <p className="mt-2 text-gray-500">Here's what's happening with your quotations today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Quotations", value: stats.total, color: "border-gray-200", text: "text-gray-900" },
          { label: "Drafts", value: stats.draft, color: "border-yellow-200 bg-yellow-50", text: "text-yellow-700" },
          { label: "Sent", value: stats.sent, color: "border-blue-200 bg-blue-50", text: "text-blue-700" },
          { label: "Approved", value: stats.approved, color: "border-green-200 bg-green-50", text: "text-green-700" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border bg-white shadow-sm transition-transform hover:scale-[1.02] duration-200 ${stat.color}`}>
            <p className={`text-sm font-medium text-gray-500`}>{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Quotations</h3>
          <Link href="/dashboard/quotations" className="text-sm font-medium text-red-600 hover:text-red-700">
            View all &rarr;
          </Link>
        </div>
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
      </div>
    </div>
  );
}