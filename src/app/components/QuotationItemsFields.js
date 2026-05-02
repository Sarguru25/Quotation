"use client";

export default function QuotationItemsFields({ items, onChange }) {
  const addItem = () => {
    onChange([...items, { name: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Item name"
            value={item.name}
            onChange={(e) => updateItem(idx, "name", e.target.value)}
            required
            className="flex-1 border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
            min={1}
            required
            className="w-20 border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Rate"
            value={item.rate}
            onChange={(e) => updateItem(idx, "rate", e.target.value)}
            min={0}
            step="0.01"
            required
            className="w-28 border p-2 rounded"
          />
          <div className="w-24 text-right font-medium">
            ${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
          </div>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-blue-600 hover:underline text-sm"
      >
        + Add item
      </button>
    </div>
  );
}