"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Plus, Search, ChevronRight, FileText, DownloadCloud, AlertCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import { useSession } from "next-auth/react";
import { PERMISSIONS, hasPermission } from "@/lib/rbac/permissions";

const STATUS_STYLES = {
  draft: "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  processing: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  completed: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
  closed: "bg-slate-100 text-slate-600 border border-slate-200",
  open: "bg-blue-100 text-blue-700 border border-blue-200", // Zoho default for some states
};

export default function SalesOrdersPage() {
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];
  // Replace with proper RBAC check
  const canCreate = hasPermission(userPermissions, PERMISSIONS.SALES_ORDER.CREATE);
  const canEdit = hasPermission(userPermissions, PERMISSIONS.SALES_ORDER.EDIT);
  const canDelete = hasPermission(userPermissions, PERMISSIONS.SALES_ORDER.DELETE);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "all";

  const [searchInput, setSearchInput] = useState(search);

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

  const updateUrlParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: queryData, isLoading: loading, refetch: fetchOrders } = useQuery({
    queryKey: ['sales-orders', page, limit, search, statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${statusFilter}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    placeholderData: keepPreviousData
  });

  const orders = queryData?.data || [];
  const pagination = queryData?.pagination || { total: 0, page: 1, limit: 20 };

  function showToast(message, type = "success") {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }

  const formatDate = (date) => {
    if (!date) return "—";
    const dateStr = date.split("T")[0];
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);

  async function deleteOrder(id) {
    if (!window.confirm("Delete this sales order? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/zoho/sales-orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) { showToast(data.error || "Failed to delete", "error"); return; }
      showToast("Sales Order deleted successfully");
      fetchOrders();
    } catch { showToast("Something went wrong", "error"); }
  }



  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {orders.length} order{orders.length !== 1 ? "s" : ""} from Zoho
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Link
              href="/dashboard/sales-orders/create"
              className="btn-press flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-200 transition-colors"
            >
              <Plus size={16} />
              New Order
            </Link>
          )}
          <button
            onClick={() => fetchOrders()}
            className="btn-press flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => updateUrlParams({ status: e.target.value, page: 1 })}
          className="w-full sm:w-48 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="h-[600px]">
        <DataTable
          columns={[
            { label: "Date" },
            { label: "SO No." },
            { label: "Ref No." },
            { label: "Customer" },
            { label: "Status" },
            { label: "Amount", className: "text-right" },
            { label: "Actions", className: "text-center" }
          ]}
          data={orders}
          loading={loading}
          page={page}
          limit={limit}
          total={pagination.total}
          onPageChange={(p) => updateUrlParams({ page: p })}
          onLimitChange={(l) => updateUrlParams({ limit: l, page: 1 })}
          onSearch={(v) => setSearchInput(v)}
          searchValue={searchInput}
          emptyStateText="No sales orders found"
          emptyStateSubtext="Try adjusting your search or create a new order"
          renderRow={(o) => {
            const id = o.zoho_salesorder_id || o._id;
            return (
              <tr key={id} className="table-row-hover hover:bg-slate-50/70 group">
                <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(o.date)}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/sales-orders/${id}`}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 group-hover:underline"
                  >
                    <FileText size={13} className="flex-shrink-0" />
                    {o.salesorder_number}
                    <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-600">{o.reference_number || "—"}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">{o.customer_name}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[o.status] || STATUS_STYLES.draft}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-slate-800">
                  {formatCurrency(o.total)}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {canEdit && (
                      <Link
                        href={`/dashboard/sales-orders/${id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteOrder(id)}
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
    </div>
  );
}
