"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Download, CheckCircle, XCircle, MessageSquare, AlertCircle } from "lucide-react";

export default function PublicQuotationView({ params }) {
  const { token } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [linkData, setLinkData] = useState(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  
  const [rejectReason, setRejectReason] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await fetch(`/api/public-quotations/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to load quotation");
        }
        
        setQuote(data.quote);
        setLinkData(data.link);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [token]);

  const handleAction = async (action, bodyData = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/public-quotations/${token}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...bodyData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      
      setLinkData(data.link);
      setIsRejectModalOpen(false);
      setIsFeedbackModalOpen(false);
      setIsAcceptModalOpen(false);
      setRejectReason("");
      setFeedbackMessage("");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/public-quotations/${token}/pdf`);
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation_${quote.estimate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 max-w-md">{error}</p>
      </div>
    );
  }

  const isAccepted = linkData?.status === "Accepted";
  const isRejected = linkData?.status === "Rejected";
  const isExpired = linkData?.status === "Expired";
  const canAct = !isAccepted && !isRejected && !isExpired;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-8">
      {/* Action Bar */}
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl text-gray-800 hidden sm:block">TruFlow Quotes</div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider
            ${linkData?.status === 'Accepted' ? 'bg-green-100 text-green-700' : ''}
            ${linkData?.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
            ${linkData?.status === 'Expired' ? 'bg-orange-100 text-orange-700' : ''}
            ${['Generated', 'Viewed', 'Revision Requested'].includes(linkData?.status) ? 'bg-blue-100 text-blue-700' : ''}
          `}>
            {linkData?.status || "Pending"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>

          {canAct && (
            <>
              <button 
                onClick={() => setIsFeedbackModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" /> Feedback
              </button>
              <button 
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button 
                onClick={() => setIsAcceptModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 border border-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Accept Quotation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quotation Document Body */}
      <div className="w-full max-w-5xl bg-white shadow-xl border border-gray-200 overflow-hidden mb-8">
        {/* Same UI layout as the dashboard view for consistency */}
        <div className="p-10 pb-0">
          <div className="flex justify-between items-start">
            <div className="ml-0 md:ml-12 mt-4">
              <h1 className="text-4xl font-bold text-gray-800">TRUFLOW</h1>
            </div>
            <div className="text-right text-sm text-gray-700 leading-relaxed">
              <p className="font-bold text-black">TruFlow Solutions Pvt Ltd</p>
              <p>S.F.No.617/2H2, Vadakku Thottam, L&T Road,</p>
              <p>Malumichampatti Post Office, Madukkarai Taluk,</p>
              <p>Coimbatore Tamil Nadu 641050, India</p>
              <p>GSTIN 33AAJCR6720N1Z1</p>
            </div>
          </div>

          <div className="mt-8 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <span className="relative bg-white px-4 text-xl tracking-widest text-gray-700 uppercase">
              Sales Quotation
            </span>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              <p className="mb-1 text-gray-800">Customer:</p>
              <p className="font-bold text-blue-600 uppercase text-base">{quote.customer_name}</p>
              {quote.billing_address ? (
                <>
                  <p>{quote.billing_address.address}</p>
                  <p>{quote.billing_address.city} {quote.billing_address.state}</p>
                  <p>{quote.billing_address.zip} {quote.billing_address.country}</p>
                </>
              ) : (
                <p>Address details not provided</p>
              )}
            </div>

            <div className="w-full md:w-72 flex-shrink-0">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Quotation No</td>
                    <td className="py-2 px-3 font-medium">{quote.estimate_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Date</td>
                    <td className="py-2 px-3">{quote.date}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Expiry Date</td>
                    <td className="py-2 px-3">{quote.expiry_date}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 md:px-10 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 min-w-[600px]">
            <thead className="bg-gray-50 text-gray-600 text-center border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-normal w-12 border-r border-gray-200">S.No</th>
                <th className="py-3 px-4 font-normal text-left border-r border-gray-200">Item & Description</th>
                <th className="py-3 px-4 font-normal w-20 border-r border-gray-200">Qty</th>
                <th className="py-3 px-4 font-normal w-32 border-r border-gray-200">Unit Price</th>
                <th className="py-3 px-4 font-normal w-32">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {quote.line_items?.map((item, index) => (
                <tr key={item.line_item_id || index} className="border-b border-gray-100 text-gray-700">
                  <td className="py-4 px-4 text-center align-top border-r border-gray-200">{index + 1}</td>
                  <td className="py-4 px-4 align-top border-r border-gray-200">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && (
                      <p className="mt-1 text-gray-500 text-sm whitespace-pre-wrap">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center align-top border-r border-gray-200">{item.quantity}</td>
                  <td className="py-4 px-4 text-right align-top border-r border-gray-200">{formatCurrency(item.rate)}</td>
                  <td className="py-4 px-4 text-right align-top">{formatCurrency(item.item_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 md:px-10 mt-6 flex justify-end">
          <div className="w-full md:w-72 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-800">{formatCurrency(quote.sub_total)}</span>
            </div>
            {quote.taxes?.map((tax) => (
              <div key={tax.tax_id} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{tax.tax_name} ({tax.tax_percentage}%)</span>
                <span className="text-gray-800">{formatCurrency(tax.tax_amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 border-t-2 border-black mt-2 bg-gray-50 px-2 rounded">
              <span className="font-bold text-black">Total</span>
              <span className="font-bold text-black text-base">₹{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 py-8 text-sm text-gray-800">
          <p className="font-medium mb-3 text-base">Terms & Conditions:</p>
          <p className="whitespace-pre-wrap text-gray-600 mb-6 leading-relaxed">
            {quote.terms || "All our transactions are governed by TruFlow Solutions Pvt Ltd's General Terms and Conditions for Sale."}
          </p>
        </div>
      </div>

      {/* Accept Modal */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Accept Quotation</h3>
            <p className="text-gray-600 text-sm mb-6">By accepting this quotation, you agree to the stated terms and conditions. We will be notified and will process your order shortly.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAcceptModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button 
                onClick={() => handleAction("accept")} 
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <CheckCircle className="w-4 h-4"/>}
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Decline Quotation</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Please provide a reason (optional):</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Price too high, chose another vendor..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button 
                onClick={() => handleAction("reject", { reason: rejectReason })} 
                disabled={actionLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {actionLoading ? "Processing..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Request Corrections</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Optional):</label>
              <input 
                type="text"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">What needs to be changed?</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                rows="4"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="e.g. Can we get an extra 5% discount? / We need the AC220V model instead."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsFeedbackModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button 
                onClick={() => handleAction("feedback", { message: feedbackMessage, customerName })} 
                disabled={actionLoading || !feedbackMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
