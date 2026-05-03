import { getZohoAccessToken } from "@/lib/zoho";

async function getQuotation(id) {
  try {
    const accessToken = await getZohoAccessToken();
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/estimates/${id}?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Zoho API Error");
    }

    return data.estimate;
  } catch (error) {
    console.error("Quotation Fetch Error:", error);
    throw new Error("Failed to fetch quotation");
  }
}

export default async function QuoteDetailsPage({ params }) {
  const { id } = await params;
  const quote = await getQuotation(id);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convert number to words (simple implementation or just fallback if not available)
  // For production, a dedicated library like `number-to-words` is better.
  const numberToWords = (amount) => {
    // simplified mock for visual purposes as requested by design
    return `Indian Rupee ${Math.floor(amount)} Only`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white w-full max-w-4xl shadow-xl border relative overflow-hidden print:shadow-none print:border-none print:p-0">

        {/* Ribbon for Status */}
        {quote.status && (
          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
            <div className={`absolute -left-8 top-6 w-48 text-center text-white font-bold py-1 shadow-md transform -rotate-45 uppercase tracking-wider text-sm
                ${quote.status === "accepted" || quote.status === "approved" || quote.status === "sent" ? "bg-blue-500" : "bg-yellow-500"}
              `}>
              {quote.status}
            </div>
          </div>
        )}

        {/* Top Header Section */}
        <div className="p-10 pb-0">
          <div className="flex justify-between items-start">
            <div className="ml-12 mt-4">
              {/* TRUFLOW Logo text */}
              <h1 className="text-4xl tracking-tighter">
                <span className="text-red-600 font-extrabold">TRU</span>
                <span className="text-gray-600 font-bold bg-gray-200 px-1">FLOW</span>
              </h1>
            </div>

            <div className="text-right text-sm text-gray-700 leading-relaxed">
              <p className="font-bold text-black">TruFlow Solutions Pvt Ltd</p>
              <p>S.F.No.617/2H2, Vadakku Thottam, L&T Road,</p>
              <p>Malumichampatti Post Office, Madukkarai Taluk,</p>
              <p>Coimbatore Tamil Nadu 641050</p>
              <p>India</p>
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

          <div className="mt-8 flex justify-between items-start gap-8">
            {/* Customer Details */}
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
              {quote.gst_no && <p className="mt-1">GSTIN {quote.gst_no}</p>}
            </div>

            {/* Quotation Info Table */}
            <div className="w-72 flex-shrink-0">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Quotation No</td>
                    <td className="py-2 px-3 font-medium">{quote.estimate_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Quotation Date</td>
                    <td className="py-2 px-3">{formatDate(quote.date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Expiry Date</td>
                    <td className="py-2 px-3">{formatDate(quote.expiry_date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Customer Ref</td>
                    <td className="py-2 px-3">{quote.reference_number || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 bg-gray-50 border-r border-gray-200 text-gray-600">Sales person</td>
                    <td className="py-2 px-3">{quote.salesperson_name || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {quote.subject && (
            <div className="mt-8 text-sm text-gray-800">
              <p className="mb-2">Subject :</p>
              <p>{quote.subject}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mt-8 px-10">
          <table className="w-full text-sm border border-gray-200">
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
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && (
                      <p className="mt-1 text-gray-500 whitespace-pre-wrap">{item.description}</p>
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

        {/* Totals Section */}
        <div className="px-10 mt-6 flex justify-between items-start">
          <div className="text-sm text-gray-600">
            <p>We thank you for your enquiry and look forward for your confirmation of order.</p>
          </div>

          <div className="w-72 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-800">{formatCurrency(quote.sub_total)}</span>
            </div>

            {quote.taxes?.map((tax) => (
              <div key={tax.tax_id} className="flex justify-between py-2">
                <span className="text-gray-600">{tax.tax_name} ({tax.tax_percentage}%)</span>
                <span className="text-gray-800">{formatCurrency(tax.tax_amount)}</span>
              </div>
            ))}

            <div className="flex justify-between py-3 border-t border-b border-gray-200 mt-2">
              <span className="font-bold text-black">Total</span>
              <span className="font-bold text-black text-base">₹{formatCurrency(quote.total)}</span>
            </div>

            <div className="flex gap-2 py-4 text-xs">
              <span className="text-gray-600 whitespace-nowrap">Total In Words:</span>
              <span className="font-bold text-gray-800 italic">{numberToWords(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Terms */}
        <div className="px-10 py-8 text-sm text-gray-800">
          <p className="font-medium mb-3 text-base">Terms & Conditions:</p>
          {quote.terms ? (
            <p className="whitespace-pre-wrap text-gray-600 mb-6 leading-relaxed">{quote.terms}</p>
          ) : (
            <p className="text-gray-600 mb-6">All our transactions are governed by TruFlow Solutions Pvt Ltd's General Terms and Conditions for Sale which shall be made available upon request.</p>
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