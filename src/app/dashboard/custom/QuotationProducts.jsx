import React from 'react';
import { Box, FileText, PackagePlus, Edit2, Trash2 } from 'lucide-react';

export default function QuotationProducts({ products, onEdit, onRemove, onConvert, editProductId }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Quotation Products</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {products.length} Items
          </span>
          {products.length > 0 && (
            <button onClick={onConvert} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Convert to Quotation
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <PackagePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products added to the quotation yet.</p>
          <p className="text-sm text-gray-400 mt-1">Configure a product above and click 'Add to Quotation'</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                {["S.No", "Category", "Model", "Details", "Qty", "Unit Price (₹)", "Discount (%)", "Amount (₹)", "Actions"].map(h => (
                  <th key={h} className="p-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((prod, idx) => (
                <tr key={prod.id} className={`hover:bg-blue-50/50 transition-colors ${editProductId === prod.id ? 'bg-amber-50/50' : ''}`}>
                  <td className="p-4 text-center font-medium text-gray-500">{idx + 1}</td>
                  <td className="p-4 font-semibold text-gray-800">{prod.productCategory}</td>
                  <td className="p-4 font-semibold text-blue-600">{prod.model || "-"}</td>
                  <td className="p-4 text-xs text-gray-500 whitespace-pre-line">{prod.detailsSummary}</td>
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium text-gray-700">{prod.quantity}</span>
                  </td>
                  <td className="p-4 text-right text-gray-600 font-medium">₹ {prod.unitPriceTotal?.toFixed(2)}</td>
                  <td className="p-4 text-center text-red-500 font-medium">{prod.discount || 0}%</td>
                  <td className="p-4 text-right font-bold text-gray-800">₹ {prod.amountInINR?.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(prod)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onRemove(prod.id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
