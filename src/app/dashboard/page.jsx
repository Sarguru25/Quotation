// app/dashboard/page.jsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    approved: 0,
  });

  async function fetchQuotes() {
    try {
      setLoading(true);

      const res = await fetch("/api/zoho/quotes", {
        cache: "no-store",
      });

      const data = await res.json();

      const quotesArray = Array.isArray(data) ? data : [];

      setQuotes(quotesArray);

      // ✅ Stats Calculation
      setStats({
        total: quotesArray.length,
        draft: quotesArray.filter((q) => q.status === "draft").length,
        sent: quotesArray.filter((q) => q.status === "sent").length,
        approved: quotesArray.filter((q) => q.status === "accepted").length,
      });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };

  if (loading) {
    return <p className="p-6">Loading live data from Zoho...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}
        </h1>

        <p className="mt-2 text-gray-500">
          Here's what's happening with your quotations today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Quotations",
            value: stats.total,
            color: "border-gray-200",
            text: "text-gray-900",
          },
          {
            label: "Drafts",
            value: stats.draft,
            color: "border-yellow-200 bg-yellow-50",
            text: "text-yellow-700",
          },
          {
            label: "Sent",
            value: stats.sent,
            color: "border-blue-200 bg-blue-50",
            text: "text-blue-700",
          },
          {
            label: "Approved",
            value: stats.approved,
            color: "border-green-200 bg-green-50",
            text: "text-green-700",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border shadow-sm ${stat.color}`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>

            <p className={`mt-2 text-3xl font-bold ${stat.text}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Quotations */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-5  flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Quotations
          </h2>

          <button
            onClick={fetchQuotes}
            className="btn-press flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Quote No</th>
                <th className="px-4 py-3 text-left">Ref No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {quotes.length > 0 ? (
                quotes.map((q) => (
                  <tr
                    key={q.estimate_id}
                    className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      {formatDate(q.date)}
                    </td>

                    <td className="px-4 py-3 font-medium text-blue-600">
                      <Link
                        href={`/dashboard/quotations/${q.estimate_id}`}
                      >
                        {q.estimate_number}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      {q.reference_number || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {q.customer_name}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          q.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(q.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500"
                  >
                    No quotations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}