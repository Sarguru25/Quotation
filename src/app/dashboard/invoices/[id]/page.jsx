"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, DownloadCloud, Send, Edit, CreditCard, Mail } from "lucide-react";
import AttachmentManager from "@/components/attachments/AttachmentManager";

export default function InvoiceDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    payment_mode: "Bank Transfer",
    reference_number: "",
    description: ""
  });

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchInvoice() {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setInvoice(data.data);
        setPaymentForm(prev => ({ ...prev, amount: data.data.balance }));
      } else {
        showToast("Failed to load Invoice", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  async function handleDownloadPDF() {
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoice?.invoice_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Could not download PDF", "error");
    }
  }

  async function handleSendEmail() {
    const toEmail = prompt("Enter customer email address:");
    if (!toEmail) return;

    try {
      showToast("Sending email...", "success");
      const res = await fetch(`/api/invoices/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_mail_ids: [toEmail] })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Email sent successfully");
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    try {
      showToast("Recording payment...", "success");
      const res = await fetch(`/api/invoices/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          customer_id: invoice.customer_id
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Payment recorded successfully");
        setIsPaymentModalOpen(false);
        fetchInvoice();
      } else {
        showToast(data.error || "Failed to record payment", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
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

  if (!invoice) {
    return <div className="p-8 text-center text-slate-500">Invoice not found</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center relative">
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
            <Link href="/dashboard/invoices" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-2">
              <ArrowLeft size={18} />
            </Link>
            <span className="text-sm font-semibold text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  invoice.status === 'partially paid' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-blue-100 text-blue-700'}`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <DownloadCloud size={16} />
              Download PDF
            </button>
            <button onClick={handleSendEmail} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Mail size={16} />
              Email Invoice
            </button>
            {invoice.status !== 'paid' && invoice.status !== 'void' && (
              <Link href={`/dashboard/invoices/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit size={16} />
                Edit
              </Link>
            )}
            {invoice.balance > 0 && invoice.status !== 'void' && (
              <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium shadow-sm transition-colors">
                <CreditCard size={16} />
                Record Payment
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mb-6 print:hidden">
        <AttachmentManager module="invoices" recordId={id} />
      </div>


      {/* Paper UI */}
      <div className="bg-white w-full max-w-4xl shadow-xl border relative overflow-hidden print:shadow-none print:border-none print:p-0 mb-6">
        {invoice.status && (
          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
            <div className={`absolute -left-12 top-10 w-50 text-center text-white font-bold py-1 shadow-md transform -rotate-45 uppercase tracking-wider text-sm
                ${invoice.status === "paid" ? "bg-green-500" :
                invoice.status === "overdue" ? "bg-red-500" :
                  invoice.status === "partially paid" ? "bg-indigo-500" :
                    "bg-blue-500"}
              `}>
              {invoice.status}
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
              Tax Invoice
            </span>
          </div>

          <div className="mt-8 flex justify-between items-start gap-8">
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              <p className="mb-1 text-gray-800">Customer:</p>
              <p className="font-bold text-blue-600 uppercase text-base">{invoice.customer_name}</p>
              {invoice.billing_address ? (
                <>
                  <p>{invoice.billing_address.address}</p>
                  <p>{invoice.billing_address.city} {invoice.billing_address.state}</p>
                  <p>{invoice.billing_address.zip} {invoice.billing_address.country}</p>
                </>
              ) : (
                <p>Address details not provided</p>
              )}
            </div>

            <div className="w-72 flex-shrink-0">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Invoice No</td>
                    <td className="py-2 px-3 font-medium">{invoice.invoice_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Invoice Date</td>
                    <td className="py-2 px-3">{formatDate(invoice.date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Due Date</td>
                    <td className="py-2 px-3">{formatDate(invoice.due_date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Customer Ref</td>
                    <td className="py-2 px-3">{invoice.reference_number || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Sales person</td>
                    <td className="py-2 px-3">{invoice.salesperson_name || "-"}</td>
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
              {invoice.line_items?.map((item, index) => (
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
              <span className="text-gray-800">{formatCurrency(invoice.sub_total)}</span>
            </div>

            {invoice.discount_amount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount{invoice.discount ? ` (${invoice.discount}%)` : ''}</span>
                <span className="text-red-500">-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}

            {invoice.taxes?.map((tax, index) => (
              <div key={`${tax.tax_id}-${index}`} className="flex justify-between py-2">
                <span className="text-gray-600">{tax.tax_name} ({tax.tax_percentage}%)</span>
                <span className="text-gray-800">{formatCurrency(tax.tax_amount)}</span>
              </div>
            ))}

            {invoice.adjustment > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Adjustment</span>
                <span className="text-gray-800">{formatCurrency(invoice.adjustment)}</span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t border-b border-gray-200 mt-2">
              <span className="font-bold text-black">Total</span>
              <span className="font-bold text-black text-base">₹{formatCurrency(invoice.total)}</span>
            </div>

            <div className="flex justify-between py-2 mt-1">
              <span className="text-emerald-700 font-medium">Payment Made</span>
              <span className="text-emerald-700 font-medium">(-) ₹{formatCurrency(invoice.total - invoice.balance)}</span>
            </div>

            <div className="flex justify-between py-3 border-t border-b border-gray-200 mt-1 bg-red-50/50 -mx-2 px-2">
              <span className="font-bold text-red-700">Balance Due</span>
              <span className="font-bold text-red-700 text-lg">₹{formatCurrency(invoice.balance)}</span>
            </div>

            <div className="flex gap-2 py-4 text-xs">
              <span className="text-gray-600 whitespace-nowrap">Total In Words:</span>
              <span className="font-bold text-gray-800 italic">{numberToWords(invoice.total)}</span>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 text-sm text-gray-800">
          <p className="font-medium mb-3 text-base">Notes & Terms:</p>
          {invoice.notes && <p className="whitespace-pre-wrap text-gray-600 mb-2 leading-relaxed">{invoice.notes}</p>}
          {invoice.terms ? (
            <p className="whitespace-pre-wrap text-gray-600 mb-6 leading-relaxed">{invoice.terms}</p>
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


      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount Received *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    max={invoice.balance}
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Balance Due: {formatCurrency(invoice.balance)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Mode *</label>
                  <select
                    required
                    value={paymentForm.payment_mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction ID"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
