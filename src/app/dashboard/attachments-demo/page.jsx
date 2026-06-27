"use client";

import { useState } from "react";
import { Paperclip, Layers, Key, Database, FileText } from "lucide-react";
import AttachmentManager from "@/components/attachments/AttachmentManager";

export default function AttachmentsDemoPage() {
  const [module, setModule] = useState("estimates");
  const [recordId, setRecordId] = useState("");
  const [activeRecordId, setActiveRecordId] = useState("");

  function handleLoad(e) {
    e.preventDefault();
    if (!recordId.trim()) return;
    setActiveRecordId(recordId.trim());
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-5 flex items-center gap-4">
        <div className="p-3.5 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center">
          <Paperclip size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zoho Books Attachment Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Test and interact with the reusable OAuth 2.0 attachment service across Estimates, Sales Orders, and Invoices.
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Target Module & Record Selection
        </h3>

        <form onSubmit={handleLoad} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Zoho Books Module
            </label>
            <select
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setActiveRecordId("");
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-colors shadow-sm"
            >
              <option value="estimates">Estimates (Quotations)</option>
              <option value="salesorders">Sales Orders</option>
              <option value="invoices">Invoices</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-500" />
              Record ID (Zoho Books ID)
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              placeholder="e.g. 408794000000123456"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={!recordId.trim()}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Load Record
            </button>
          </div>
        </form>
      </div>

      {/* Attachment Manager Area */}
      {activeRecordId ? (
        <div className="animate-fade-in">
          <AttachmentManager
            module={module}
            recordId={activeRecordId}
            title={`Attachments for ${module.toUpperCase()} (${activeRecordId})`}
            subtext="Upload, view, replace, or delete files directly connected to this record in Zoho Books."
          />
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Paperclip className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Record Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select a Zoho Books module and enter a valid Record ID above to start managing attachments.
          </p>
        </div>
      )}
    </div>
  );
}
