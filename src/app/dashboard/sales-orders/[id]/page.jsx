"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, DownloadCloud, Edit, CheckCircle, Truck } from "lucide-react";

export default function SalesOrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchOrder() {
    try {
      setLoading(true);
      const res = await fetch(`/api/sales-orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        showToast("Failed to load Sales Order", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function handleDownloadPDF() {
    try {
      const res = await fetch(`/api/sales-orders/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalesOrder_${order?.salesorder_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Could not download PDF", "error");
    }
  }

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`/api/sales-orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Status updated to ${newStatus}`);
        fetchOrder();
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    }
  }

  async function handleConvertToInvoice() {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesOrderId: id })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Converted to Invoice");
        router.push(`/dashboard/invoices/${data.data.invoice_id}`);
      } else {
        showToast(data.error || "Failed to convert", "error");
        setLoading(false);
      }
    } catch (error) {
      showToast("Something went wrong", "error");
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const dateStr = date.split("T")[0];
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const numberToWords = (amount) => {
    return `Indian Rupee ${Math.floor(amount)} Only`;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-slate-500">Sales Order not found</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium transition-all duration-300
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}>
          {toast.message}
        </div>
      )}

      {/* Action Bar */}
      <div className="w-full max-w-4xl mb-6 sticky top-0 z-10 print:hidden">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/sales-orders" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-2">
              <ArrowLeft size={18} />
            </Link>
            <span className="text-sm font-semibold text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${order.status === 'open' ? 'bg-blue-100 text-blue-700' : ''}
              ${order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' : ''}
              ${order.status === 'delivered' || order.status === 'invoiced' ? 'bg-green-100 text-green-700' : ''}
              ${order.status === 'closed' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              {order.status || "Unknown"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DownloadCloud size={16} />
              Download PDF
            </button>

            <Link
              href={`/dashboard/sales-orders/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit size={16} />
              Edit
            </Link>

            {order.status !== 'confirmed' && order.status !== 'open' && order.status !== 'invoiced' && (
               <button onClick={() => updateStatus('confirmed')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
                 <CheckCircle size={16} />
                 Mark Confirmed
               </button>
            )}
            {order.status !== 'delivered' && order.status !== 'closed' && order.status !== 'invoiced' && (
               <button onClick={() => updateStatus('delivered')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors">
                 <Truck size={16} />
                 Mark Delivered
               </button>
            )}
            {order.status !== 'invoiced' && order.status !== 'closed' && (
               <button onClick={handleConvertToInvoice} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm font-medium shadow-sm transition-colors">
                 <FileText size={16} />
                 Convert to Invoice
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Paper UI */}
      <div className="bg-white w-full max-w-4xl shadow-xl border relative overflow-hidden print:shadow-none print:border-none print:p-0 mb-6">
        {order.status && (
          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
            <div className={`absolute -left-12 top-10 w-50 text-center text-white font-bold py-1 shadow-md transform -rotate-45 uppercase tracking-wider text-sm
                ${order.status === "delivered" || order.status === "invoiced" ? "bg-green-500" : order.status === "confirmed" ? "bg-indigo-500" : "bg-blue-500"}
              `}>
              {order.status}
            </div>
          </div>
        )}

        <div className="p-10 pb-0">
          <div className="flex justify-between items-start">
            <div className="ml-12 mt-4">
              <Image src="/TF_logo.png" alt="TruFlow" width={300} height={40} priority />
            </div>

            <div className="text-right text-sm text-gray-700 leading-relaxed">
              <p className="font-bold text-black">Zeetork Automation & Control Private Limited</p>
              <p>Company ID : U27103TZ2024PTC032623</p>
              <p>S.F.No.610/1A, L&T Road Campus Road,</p>
              <p>Malumichampatti Post Office, Madukkarai Taluk,</p>
              <p>Coimbatore Tamil Nadu 641050</p>
              <p>India</p>
              <p>GSTIN 33AACCZ4754H1Z7</p>
            </div>
          </div>

          <div className="mt-8 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <span className="relative bg-white px-4 text-xl tracking-widest text-gray-700 uppercase">
              Sales Order
            </span>
          </div>

          <div className="mt-8 flex justify-between items-start gap-8">
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              <p className="mb-1 text-gray-800">Customer:</p>
              <p className="font-bold text-blue-600 uppercase text-base">{order.customer_name}</p>
              {order.billing_address ? (
                <>
                  <p>{order.billing_address.address}</p>
                  <p>{order.billing_address.city} {order.billing_address.state}</p>
                  <p>{order.billing_address.zip} {order.billing_address.country}</p>
                </>
              ) : (
                <p>Address details not provided</p>
              )}
            </div>

            <div className="w-72 flex-shrink-0">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Sales Order No</td>
                    <td className="py-2 px-3 font-medium">{order.salesorder_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Order Date</td>
                    <td className="py-2 px-3">{formatDate(order.date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Shipment Date</td>
                    <td className="py-2 px-3">{formatDate(order.shipment_date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Customer Ref</td>
                    <td className="py-2 px-3">{order.reference_number || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Sales person</td>
                    <td className="py-2 px-3">{order.salesperson_name || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 px-10">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-50 text-gray-600 text-center border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-normal w-12 border-r border-gray-200">S.No</th>
                <th className="py-3 px-4 font-normal text-left border-r border-gray-200">Item & Description</th>
                <th className="py-3 px-4 font-normal w-20 border-r border-gray-200">Qty</th>
                <th className="py-3 px-4 font-normal w-32 border-r border-gray-200">Unit Price</th>
                <th className="py-3 px-4 font-normal w-28 border-r border-gray-200">Tax</th>
                <th className="py-3 px-4 font-normal w-32">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.line_items?.map((item, index) => (
                <tr key={item.line_item_id || index} className="border-b border-gray-100 text-gray-700">
                  <td className="py-4 px-4 text-center align-top border-r border-gray-200">{index + 1}</td>
                  <td className="py-4 px-4 align-top border-r border-gray-200">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && (
                      <div className="mt-1 text-gray-500 text-sm leading-relaxed">
                        {item.description.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center align-top border-r border-gray-200">{item.quantity}</td>
                  <td className="py-4 px-4 text-right align-top border-r border-gray-200">{formatCurrency(item.rate)}</td>
                  <td className="py-4 px-4 text-center align-top border-r border-gray-200">
                    {item.tax_percentage ? (
                      <span className="text-green-700 text-xs font-medium">{item.tax_name || `GST`} ({item.tax_percentage}%)</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right align-top">{formatCurrency(item.item_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-10 mt-6 flex justify-between items-start">
          <div className="text-sm text-gray-600">
            <p>Thank you for your business.</p>
          </div>

          <div className="w-72 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-800">{formatCurrency(order.sub_total)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount{order.discount ? ` (${order.discount}%)` : ''}</span>
                <span className="text-red-500">-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}

            {order.taxes?.map((tax, index) => (
              <div key={`${tax.tax_id}-${index}`} className="flex justify-between py-2">
                <span className="text-gray-600">{tax.tax_name} ({tax.tax_percentage}%)</span>
                <span className="text-gray-800">{formatCurrency(tax.tax_amount)}</span>
              </div>
            ))} 

            {order.adjustment > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Adjustment</span>
                <span className="text-gray-800">{formatCurrency(order.adjustment)}</span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t border-b border-gray-200 mt-2">
              <span className="font-bold text-black">Total</span>
              <span className="font-bold text-black text-base">₹{formatCurrency(order.total)}</span>
            </div>

            <div className="flex gap-2 py-4 text-xs">
              <span className="text-gray-600 whitespace-nowrap">Total In Words:</span>
              <span className="font-bold text-gray-800 italic">{numberToWords(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 text-sm text-gray-800">
          <p className="font-medium mb-3 text-base">Notes & Terms:</p>
          {order.notes && <p className="whitespace-pre-wrap text-gray-600 mb-2 leading-relaxed">{order.notes}</p>}
          {order.terms ? (
            <p className="whitespace-pre-wrap text-gray-600 mb-6 leading-relaxed">{order.terms}</p>
          ) : (
            <p className="text-gray-600 mb-6">All our transactions are governed by Zeetork Automation & Control Private Limited's General Terms and Conditions.</p>
          )}

          <div className="mt-8 pt-8 pb-10">
            <div className="flex items-end">
              <p className="text-gray-700">This is a computer generated document and hence no signature is required.</p>
              <div className="flex-1 ml-4 border-b border-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
