import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Database, RefreshCw, X, Search, Filter } from "lucide-react";

export default function ZreqmTab({ canManage }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const [formData, setFormData] = useState({
    category: "",
    sr_no: "",
    model: "",
    torque_nm: "",
    list_price_inr: "",
    list_price_usd: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/zreqm-prices");
      const json = await res.json();
      if (json.success) setData(json.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/zreqm-prices/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchData();
      } else {
        alert("Failed to seed: " + json.error);
      }
    } catch (error) {
      console.error("Failed to seed data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/zreqm-prices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setData(data.filter(item => item._id !== id));
      } else {
        alert("Delete failed: " + json.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || "",
        sr_no: item.sr_no || "",
        model: item.model || "",
        torque_nm: item.torque_nm || "",
        list_price_inr: item.list_price_inr || "",
        list_price_usd: item.list_price_usd || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: "Switch Type",
        sr_no: "",
        model: "",
        torque_nm: "",
        list_price_inr: "",
        list_price_usd: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sr_no: Number(formData.sr_no),
      torque_nm: Number(formData.torque_nm),
      list_price_inr: Number(formData.list_price_inr),
      list_price_usd: Number(formData.list_price_usd),
    };

    try {
      const url = editingItem ? `/api/zreqm-prices/${editingItem._id}` : `/api/zreqm-prices`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      if (json.success) {
        closeModal();
        fetchData();
      } else {
        alert("Operation failed: " + json.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uniqueCategories = ["All", ...new Set((data || []).map(item => item?.category).filter(Boolean))];

  const filteredData = (data || []).filter((item) => {
    const matchesSearch = (item.model || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-[calc(100vh-12rem)] bg-gray-50/50 rounded-2xl shadow-sm border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">ZREQM Actuators</h2>
          <p className="text-sm text-gray-500 mt-1">Manage ZREQM Series pricing and configurations</p>
        </div>
        <div className="flex space-x-3">
          {canManage && (
            <button onClick={handleSeed} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-200 shadow-sm">
              <Database className="w-4 h-4 mr-2" /> Seed DB
            </button>
          )}
          <button onClick={fetchData} className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-200 shadow-sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {canManage && (
            <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-md hover:shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input type="text" placeholder="Search by model..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white">
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider text-xs sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Sr No</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4 text-center">Torque (Nm)</th>
                <th className="px-6 py-4 text-right">List Price (INR)</th>
                <th className="px-6 py-4 text-right">List Price (USD)</th>
                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (data?.length || 0) === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mb-2" />
                      <p>Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : (filteredData?.length || 0) === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No data found. Click "Seed DB" to load from JSON.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 font-medium">{item.sr_no}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{item.model}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">{item.torque_nm}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">₹{item.list_price_inr?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">${item.list_price_usd?.toLocaleString()}</td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(item)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? `Edit Model` : `Add New Model`}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sr No</label>
                  <input type="number" name="sr_no" value={formData.sr_no} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Torque (Nm)</label>
                  <input type="number" name="torque_nm" value={formData.torque_nm} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Price (INR)</label>
                  <input type="number" name="list_price_inr" value={formData.list_price_inr} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Price (USD)</label>
                  <input type="number" name="list_price_usd" value={formData.list_price_usd} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-md">
                  {editingItem ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
