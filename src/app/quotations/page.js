// "use client";

// import { useEffect, useState } from "react";

// export default function QuotationsPage() {
//   const [quotes, setQuotes] = useState([]);
//   const [loading, setLoading] = useState(true);

//   async function fetchQuotes() {
//     try {
//       const res = await fetch("/api/quotations");
//       const data = await res.json();
//       setQuotes(data);
//     } catch (err) {
//       console.error("Error fetching quotes:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchQuotes();
//   }, []);

//   if (loading) return <p className="p-6">Loading...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">All Quotations</h1>

//       <div className="overflow-x-auto bg-white shadow rounded-xl">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//             <tr>
//               <th className="px-4 py-3">Customer</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3">Amount</th>
//               <th className="px-4 py-3">Created</th>
//             </tr>
//           </thead>

//           <tbody>
//             {quotes.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="text-center py-6">
//                   No quotations found
//                 </td>
//               </tr>
//             ) : (
//               quotes.map((q) => (
//                 <tr
//                   key={q._id}
//                   className="border-b hover:bg-gray-50 transition"
//                 >
//                   <td className="px-4 py-3 font-medium">
//                     {q.customerName}
//                   </td>

//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-2 py-1 rounded text-xs font-semibold ${
//                         q.status === "Sent"
//                           ? "bg-blue-100 text-blue-600"
//                           : q.status === "Approved"
//                           ? "bg-green-100 text-green-600"
//                           : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                       {q.status}
//                     </span>
//                   </td>

//                   <td className="px-4 py-3">
//                     ₹ {q.totalAmount || q.total}
//                   </td>

//                   <td className="px-4 py-3">
//                     {new Date(q.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }