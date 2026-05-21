import { getZohoAccessToken } from "@/lib/zoho";
import Link from "next/link";
import { 
  Link as LinkIcon, 
  ChevronDown, 
  X, 
  User, 
  Settings, 
  ChevronUp, 
  Plus, 
  MessageSquare,
  Monitor
} from "lucide-react";

async function getCustomer(id) {
  try {
    const accessToken = await getZohoAccessToken();
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/contacts/${id}?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`,
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

    return data.contact;
  } catch (error) {
    console.error("Customer Fetch Error:", error);
    throw new Error("Failed to fetch customer");
  }
}

export default async function CustomerDetailsPage({ params }) {
  const { id } = await params;
  const customer = await getCustomer(id);

  const billingAddr = customer.billing_address;
  const shippingAddr = customer.shipping_address;

  const hasBillingAddr =
    billingAddr &&
    (billingAddr.address || billingAddr.city || billingAddr.state || billingAddr.zip || billingAddr.country);

  const hasShippingAddr =
    shippingAddr &&
    (shippingAddr.address || shippingAddr.city || shippingAddr.state || shippingAddr.zip || shippingAddr.country);

  const contactPersons = customer.contact_persons || [];

  return (
    <div className="bg-white min-h-screen px-8 py-6 w-full max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-normal text-gray-900">{customer.contact_name}</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center gap-1 shadow-sm">
            Edit
          </button>
          <button className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-center shadow-sm">
            <LinkIcon size={16} />
          </button>
          <div className="flex shadow-sm rounded">
            <button className="px-3 py-1.5 border border-blue-500 rounded-l text-sm font-medium text-white bg-blue-500 hover:bg-blue-600">
              New Transaction
            </button>
            <button className="px-2 py-1.5 border border-blue-500 border-l-0 rounded-r text-sm text-white bg-blue-500 hover:bg-blue-600 flex items-center justify-center">
              <ChevronDown size={16} />
            </button>
          </div>
          <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center gap-1 shadow-sm ml-1">
            More <ChevronDown size={16} />
          </button>
          <Link href="/dashboard/customers" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded ml-2">
            <X size={20} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b text-sm font-medium">
        <button className="py-2 text-blue-600 border-b-2 border-blue-600 -mb-[1px]">Overview</button>
        <button className="py-2 text-gray-500 hover:text-gray-800">Comments</button>
        <button className="py-2 text-gray-500 hover:text-gray-800">Transactions</button>
        <button className="py-2 text-gray-500 hover:text-gray-800">Mails</button>
        <button className="py-2 text-gray-500 hover:text-gray-800">Statement</button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row mt-6 gap-8 pb-20">
        
        {/* Left Column */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          
          {/* Customer Summary Card */}
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded text-gray-400 flex items-center justify-center flex-shrink-0">
                <User size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{customer.contact_name}</p>
                <button className="text-xs text-blue-500 hover:underline">Invite to Portal</button>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings size={16} />
            </button>
          </div>

          {/* Address Accordion */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Address</h3>
              <ChevronUp size={14} className="text-blue-500 cursor-pointer" />
            </div>
            <div className="text-sm text-gray-700 space-y-5">
              <div>
                <p className="text-gray-800 font-medium mb-1">Billing Address</p>
                {hasBillingAddr ? (
                  <div className="text-gray-600 text-xs">
                    {billingAddr.attention && <p>{billingAddr.attention}</p>}
                    {billingAddr.address && <p>{billingAddr.address}</p>}
                    {(billingAddr.city || billingAddr.state) && (
                      <p>{[billingAddr.city, billingAddr.state].filter(Boolean).join(", ")}</p>
                    )}
                    {(billingAddr.zip || billingAddr.country) && (
                      <p>{[billingAddr.zip, billingAddr.country].filter(Boolean).join(" ")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No Billing Address - <button className="text-blue-500 hover:underline">New Address</button></p>
                )}
              </div>
              <div>
                <p className="text-gray-800 font-medium mb-1">Shipping Address</p>
                {hasShippingAddr ? (
                  <div className="text-gray-600 text-xs">
                    {shippingAddr.attention && <p>{shippingAddr.attention}</p>}
                    {shippingAddr.address && <p>{shippingAddr.address}</p>}
                    {(shippingAddr.city || shippingAddr.state) && (
                      <p>{[shippingAddr.city, shippingAddr.state].filter(Boolean).join(", ")}</p>
                    )}
                    {(shippingAddr.zip || shippingAddr.country) && (
                      <p>{[shippingAddr.zip, shippingAddr.country].filter(Boolean).join(" ")}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No Shipping Address - <button className="text-blue-500 hover:underline">New Address</button></p>
                )}
              </div>
            </div>
          </div>

          {/* Other Details Accordion */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Other Details</h3>
              <ChevronUp size={14} className="text-blue-500 cursor-pointer" />
            </div>
            <div className="text-xs text-gray-700 space-y-4">
              <div className="flex items-center">
                <span className="w-32 text-gray-500">Customer Type</span>
                <span className="text-gray-800">{customer.customer_sub_type || customer.contact_type || 'Business'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-500">Default Currency</span>
                <span className="text-gray-800">{customer.currency_code || 'INR'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-500">Portal Status</span>
                <span className="text-red-500 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Disabled
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-32 text-gray-500">Customer Language</span>
                <span className="text-gray-800">English</span>
              </div>
            </div>
          </div>

          {/* Contact Persons Accordion */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Contact Persons ({contactPersons.length || 1})</h3>
              <div className="flex items-center gap-3">
                <button className="text-blue-600 bg-blue-50 rounded-full p-0.5"><Plus size={14} strokeWidth={2.5}/></button>
                <ChevronUp size={14} className="text-blue-500 cursor-pointer" />
              </div>
            </div>
            
            <div className="space-y-4">
              {contactPersons.length > 0 ? (
                contactPersons.map(person => (
                  <div key={person.contact_person_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-800">{person.email}</p>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500">
                      <Settings size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-800">{customer.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500">
                    <Settings size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Portal Info Box */}
          <div className="bg-green-50/50 border border-green-100 rounded p-4 flex gap-3 text-xs">
            <div className="text-green-600 flex-shrink-0">
              <Monitor size={16} />
            </div>
            <div className="text-gray-800 leading-relaxed">
              <p>Customer Portal allows your customers to keep track of all the transactions between them and your business. <button className="text-blue-500 hover:underline ml-1">Learn More</button></p>
              <button className="mt-3 px-3 py-1.5 bg-white border border-gray-200 rounded shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Enable Portal
              </button>
            </div>
          </div>

        </div>
        
        {/* Right Column */}
        <div className="w-full md:w-2/3 flex flex-col pt-2">
          
          {/* Payment due period */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Payment due period</p>
            <p className="text-sm text-gray-800">{customer.payment_terms_label || 'Due on Receipt'}</p>
          </div>

          {/* Receivables */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Receivables</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 font-medium">Currency</th>
                  <th className="pb-2 font-medium text-right">Outstanding Receivables</th>
                  <th className="pb-2 font-medium text-right">Unused Credits</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-800 text-xs">{customer.currency_code || 'INR'}- Indian Rupee</td>
                  <td className="py-3 text-right text-gray-800 text-xs">₹0.00</td>
                  <td className="py-3 text-right text-gray-800 text-xs">₹0.00</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3">
              <button className="text-[13px] text-blue-500 hover:underline">Enter Opening Balance</button>
            </div>
          </div>

          {/* Income Chart */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">Income</h2>
                <span className="text-[11px] text-gray-500">This chart is displayed in the organization's base currency.</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-500 font-medium">
                <button className="flex items-center gap-1 hover:underline">Last 6 Months <ChevronDown size={14} /></button>
                <button className="flex items-center gap-1 hover:underline">Accrual <ChevronDown size={14} /></button>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-[200px] border-b border-gray-100 mt-6 relative flex">
               {/* Y-axis */}
               <div className="absolute left-0 bottom-0 top-0 w-8 flex flex-col justify-between text-[11px] text-gray-400 py-1 text-right pr-2 bg-white z-10">
                 <span>5 K</span>
                 <span>4 K</span>
                 <span>3 K</span>
                 <span>2 K</span>
                 <span>1 K</span>
                 <span>0</span>
               </div>
               
               {/* Grid & Bars Area */}
               <div className="ml-8 flex-1 h-full flex items-end justify-between px-8 border-l border-gray-100 relative">
                 {/* Horizontal grid lines */}
                 <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-[1px]">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="w-full border-t border-gray-50"></div>
                   ))}
                 </div>
                 
                 {/* X-axis labels */}
                 <div className="absolute -bottom-8 left-8 right-8 flex justify-between">
                   {['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026'].map(m => (
                     <div key={m} className="text-[10px] text-center text-gray-400 w-8 leading-tight">
                       {m.split(' ')[0]}<br/>{m.split(' ')[1]}
                     </div>
                   ))}
                 </div>
               </div>
            </div>
            
            <div className="mt-12 mb-2">
              <p className="text-xs font-semibold text-gray-800">Total Income ( Last 6 Months ) - ₹0.00</p>
            </div>
          </div>

          {/* Timeline Placeholder */}
          <div className="mt-8 border-t border-gray-100 pt-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-[92px] top-8 bottom-0 w-px bg-blue-300"></div>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-[80px] text-right text-[11px] text-gray-500 pt-1 leading-tight">
                  <p>05/05/2026</p>
                  <p>09:53 AM</p>
                </div>
                <div className="z-10 bg-white p-1 rounded border border-blue-300 text-blue-400 h-[22px] w-[22px] flex items-center justify-center -ml-[36px] mt-1 shadow-sm">
                  <MessageSquare size={12} className="opacity-80" />
                </div>
                <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ml-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Quote added</h4>
                  <p className="text-xs text-gray-600 mb-2">Quote QT-000006 of amount ₹150.00 created</p>
                  <p className="text-[11px] text-gray-500">by NISHNATH K R - <button className="text-blue-500 hover:underline">View Details</button></p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-[80px] text-right text-[11px] text-gray-500 pt-1 leading-tight">
                  <p>05/05/2026</p>
                  <p>09:34 AM</p>
                </div>
                <div className="z-10 bg-white p-1 rounded border border-blue-300 text-blue-400 h-[22px] w-[22px] flex items-center justify-center -ml-[36px] mt-1 shadow-sm">
                  <MessageSquare size={12} className="opacity-80" />
                </div>
                <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ml-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Quote updated</h4>
                  <p className="text-xs text-gray-600 mb-2">Quote QT-000005 updated</p>
                  <p className="text-[11px] text-gray-500">by NISHNATH K R - <button className="text-blue-500 hover:underline">View Details</button></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
