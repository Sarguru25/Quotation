// "use client";

// export default function Filters({ filters, onChange }) {
//   return (
//     <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
//       <input
//         type="text"
//         name="search"
//         placeholder="Search customer or ID..."
//         value={filters.search}
//         onChange={onChange}
//         className="border p-2 rounded"
//       />
//       <select
//         name="status"
//         value={filters.status}
//         onChange={onChange}
//         className="border p-2 rounded"
//       >
//         <option value="">All Statuses</option>
//         <option value="Draft">Draft</option>
//         <option value="Sent">Sent</option>
//         <option value="Approved">Approved</option>
//       </select>
//       <input
//         type="text"
//         name="customer"
//         placeholder="Customer name"
//         value={filters.customer}
//         onChange={onChange}
//         className="border p-2 rounded"
//       />
//       <input
//         type="date"
//         name="startDate"
//         value={filters.startDate}
//         onChange={onChange}
//         className="border p-2 rounded"
//       />
//       <input
//         type="date"
//         name="endDate"
//         value={filters.endDate}
//         onChange={onChange}
//         className="border p-2 rounded"
//       />
//     </div>
//   );
// }