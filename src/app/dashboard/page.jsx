// app/dashboard/page.jsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [quotes, setQuotes] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalQuotes: 0,
    approvedQuotes: 0,
    totalVisits: 0,
    completedVisits: 0,
  });

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const [quotesRes, visitsRes] = await Promise.all([
        fetch("/api/zoho/quotes?limit=40", { cache: "no-store" }),
        fetch("/api/visits?limit=40", { cache: "no-store" })
      ]);

      const quotesData = await quotesRes.json();
      const visitsData = await visitsRes.json();

      const quotesArray = Array.isArray(quotesData) ? quotesData : [];
      const visitsArray = visitsData.visits || [];

      setQuotes(quotesArray);
      setVisits(visitsArray);

      setStats({
        totalQuotes: quotesArray.length,
        approvedQuotes: quotesArray.filter((q) => q.status === "accepted").length,
        totalVisits: visitsArray.length,
        completedVisits: visitsArray.filter((v) => v.status === "Completed").length,
      });
    } catch (err) {
      console.error("Frontend Error:", err);
      setQuotes([]);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
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
          { label: "Recent Quotations", value: stats.totalQuotes, color: "border-gray-200 bg-white", text: "text-gray-900" },
          { label: "Approved Quotes", value: stats.approvedQuotes, color: "border-green-200 bg-green-50", text: "text-green-700" },
          { label: "Recent Visits", value: stats.totalVisits, color: "border-blue-200 bg-blue-50", text: "text-blue-700" },
          { label: "Completed Visits", value: stats.completedVisits, color: "border-purple-200 bg-purple-50", text: "text-purple-700" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border shadow-sm ${stat.color}`}>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Quotations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
            <button
              onClick={fetchDashboardData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all shadow-sm"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5 text-left">Quote</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.length > 0 ? (
                  quotes.slice(0, 10).map((q) => (
                    <tr key={q.estimate_id || q._id} className="hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => window.location.href = `/dashboard/quotations/${q.estimate_id || q._id}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-blue-600 hover:underline">{q.estimate_number}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(q.date || q.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 line-clamp-1">{q.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            q.status === "draft" ? "bg-yellow-100 text-yellow-700" : 
                            q.status === "accepted" ? "bg-green-100 text-green-700" :
                            "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(q.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">No quotations found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-center">
            <Link href="/dashboard/quotations" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Quotations &rarr;</Link>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
            <Link
              href="/dashboard/visits/new"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              + Log Visit
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5 text-left">Date & Rep</th>
                  <th className="px-6 py-3.5 text-left">Customer</th>
                  <th className="px-6 py-3.5 text-center">Type</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visits.length > 0 ? (
                  visits.slice(0, 10).map((v) => (
                    <tr key={v._id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{formatDate(v.visitDate)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{v.salesPersonName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 line-clamp-1">{v.customerName}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            v.visitType === "Meeting" ? "bg-blue-100 text-blue-700" :
                            v.visitType === "Site Visit" ? "bg-purple-100 text-purple-700" :
                            "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {v.visitType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            v.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">No visits logged recently</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-center">
            <Link href="/dashboard/visits" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Visits &rarr;</Link>
          </div>
        </div>

      </div>
    </div>
  );
}