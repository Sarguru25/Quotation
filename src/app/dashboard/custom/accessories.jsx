import React, { useState, useEffect } from 'react';
import { PackagePlus, Plus, CheckCircle2, ChevronDown } from 'lucide-react';
import accessoriesData from "@/data/accessories.json";

const categoryMap = {
  AFR: [
    "ZOFR", "ZOFR-02-S3RP0", "ZOFR-02-D3RP0", "ZOFR-01-S3RP0", "ZOFR-01-D3RP0", "ZOFR-02-S3RP0F", "ZOFR-02-D3RP0F"
  ],
  SOV: [
    "ZLV310F3C0A", "ZLV31030A + ZOFR Mini", "ZLV610F3C0B", "ZLV320F3C0D", "ZLV310F02C0D", "ZLV320F02C0D", "ZLV310F3C5"
  ],
  LS: [
    "ZLS100P2", "ZLS210M2", "ZLS220", "ZLS230", "ZLS500M4", "ZLS500M2", "ZLS910P2", "ZLS910M2"
  ],
  QEV: [
    "ZLQE-02"
  ],
  sc: [
    "ZSCDA-N", "ZSCSR-N"
  ]
};

export default function Accessories({ onSave, editProduct, onCancel }) {
  const [accessoryType, setAccessoryType] = useState("AFR");
  const [model, setModel] = useState(categoryMap["AFR"][0]);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Populate from editProduct
  useEffect(() => {
    if (editProduct && editProduct.productCategory === 'Accessories') {
      const prodType = Object.keys(categoryMap).find(type => categoryMap[type].includes(editProduct.model)) || "AFR";
      setAccessoryType(prodType);
      setModel(editProduct.model || categoryMap[prodType][0]);
      setQuantity(editProduct.quantity || 1);
      setDiscount(editProduct.discount || 0);
    }
  }, [editProduct]);

  // Derived values
  const availableModels = categoryMap[accessoryType] || [];
  const selectedAccessory = accessoriesData.find(a => a.model === model) || accessoriesData.find(a => a.model === availableModels[0]);
  
  const unitPriceTotal = selectedAccessory?.price_inr || 0;
  const discountAmount = (unitPriceTotal * (parseFloat(discount) || 0)) / 100;
  const discountedUnitPrice = unitPriceTotal - discountAmount;
  const amountInINR = quantity * discountedUnitPrice;

  const getFormattedSpec = (spec) => {
    if (!spec) return "";
    if (typeof spec === 'string') return spec;
    return Object.entries(spec).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(", ");
  };

  const addToQuotation = () => {
    if (!selectedAccessory) return;

    const formattedSpec = getFormattedSpec(selectedAccessory.specification);
    const fullDescription = `${selectedAccessory.description || ""}${formattedSpec ? `\nSpecs: ${formattedSpec}` : ""}`;

    const newProduct = {
      id: editProduct ? editProduct.id : Date.now(),
      productCategory: 'Accessories',
      description: `Accessory Model = ${model}\nType = ${accessoryType}\nDescription = ${fullDescription}`,
      detailsSummary: `Accessory: ${model}\n${selectedAccessory.description || ""}`,
      model,
      accessoryType,
      quantity,
      discount: parseFloat(discount) || 0,
      discountAmount,
      discountedUnitPrice,
      unitPriceTotal,
      amountInINR,
    };

    onSave(newProduct);
    
    if (!editProduct) {
      setQuantity(1);
      setDiscount(0);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
  const selectClass = "appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="bg-transparent font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <PackagePlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Accessory Details</h2>
          {editProduct && (
            <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              Editing Mode
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Accessory Type</label>
            <div className="relative">
              <select 
                value={accessoryType} 
                onChange={(e) => { 
                  setAccessoryType(e.target.value); 
                  setModel(categoryMap[e.target.value][0]); 
                }} 
                className={selectClass}
              >
                {Object.keys(categoryMap).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Select Model</label>
            <div className="relative">
              <select value={model} onChange={(e) => setModel(e.target.value)} className={selectClass}>
                {availableModels.map((m, idx) => {
                  const accData = accessoriesData.find(a => a.model === m);
                  const price = accData?.price_inr || 0;
                  return (
                    <option key={idx} value={m}>{m} - ₹{price}</option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Quantity</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className={inputClass} />
          </div>
          
          <div>
            <label className={labelClass}>Discount (%)</label>
            <input type="number" min="0" step="any" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className={inputClass} placeholder="0" />
          </div>

          {selectedAccessory && (
            <div className="md:col-span-2 bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2">
              <h3 className="font-semibold text-blue-800 text-sm mb-1">{selectedAccessory.description}</h3>
              <p className="text-sm text-blue-600/80 mb-0 capitalize">
                {getFormattedSpec(selectedAccessory.specification) || "No specifications available."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between items-center px-2 text-sm">
            <span className="font-medium text-gray-600">Unit Price:</span>
            <span className="font-semibold text-gray-800">₹ {unitPriceTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center px-2 text-sm">
            <span className="font-medium text-gray-600">Total Amount (INR):</span>
            <span className="font-bold text-emerald-600">₹ {amountInINR.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <button onClick={addToQuotation} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all text-sm py-3">
            {editProduct ? <><CheckCircle2 className="w-5 h-5" /> Save Changes</> : <><Plus className="w-5 h-5" /> Add to Quotation</>}
          </button>
          {editProduct && (
            <button onClick={onCancel} className="flex-none flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all text-sm">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}