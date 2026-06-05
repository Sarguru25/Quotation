"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : "");

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={() => {
          setIsOpen(true);
          setSearch("");
        }}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered.length > 0 ? filtered.map((o, idx) => (
            <div
              key={`${o.value}-${idx}`}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700 text-left"
              onClick={() => {
                onChange(o.value);
                setIsOpen(false);
                setSearch("");
              }}
            >
              {o.label}
            </div>
          )) : (
            <div className="px-3 py-2 text-sm text-gray-500 text-left">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

function VisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCustomerId = searchParams.get('customerId');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/zoho/customers?limit=1000");
        const response = await res.json();
        const fetchedCustomers = response.data && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        setCustomers(fetchedCustomers);
        
        if (prefillCustomerId) {
          const cust = fetchedCustomers.find(c => (c.zoho_customer_id || c._id) === prefillCustomerId);
          if (cust) {
            const custName = cust.customer_name || cust.contact_name || "";
            setFormData(prev => ({ ...prev, customerName: custName + (cust.company_name && cust.company_name !== custName ? ` (${cust.company_name})` : "") }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    fetchCustomers();
  }, [prefillCustomerId]);
  
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    customerId: prefillCustomerId || '',
    customerName: '', // ideally fetched based on ID
    salesPersonName: session?.user?.name || 'Current User', 
    salesPersonId: session?.user?.id || '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    visitType: 'Meeting',
    status: 'Pending',
    location: { address: '' },
    reportDetails: '',
    nextFollowUpDate: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        salesPersonName: session.user.name,
        salesPersonId: session.user.id
      }));
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name.split('.')[1]]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (prefillCustomerId) {
          router.push(`/dashboard/customers/${prefillCustomerId}`);
        } else {
          router.push('/dashboard/visits');
        }
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Visit Details</h2>
          <p className="text-sm text-gray-500">Enter the primary information about this visit.</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Customer *</label>
            <SearchableSelect 
              options={customers.map((c) => {
                const name = c.customer_name || c.contact_name || "";
                return {
                  value: c.zoho_customer_id || c._id,
                  label: name + (c.company_name && c.company_name !== name ? ` (${c.company_name})` : "")
                };
              })}
              value={formData.customerId}
              onChange={(val) => {
                const selected = customers.find((c) => (c.zoho_customer_id || c._id) === val);
                const selName = selected?.customer_name || selected?.contact_name || "";
                setFormData((prev) => ({
                  ...prev,
                  customerId: val,
                  customerName: selName + (selected?.company_name && selected?.company_name !== selName ? ` (${selected?.company_name})` : ""),
                }));
              }}
              placeholder="Search and select a customer..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Visit Date *</label>
            <input 
              type="date"
              required
              name="visitDate"
              value={formData.visitDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Visit Time</label>
            <input 
              type="time"
              name="visitTime"
              value={formData.visitTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Visit Type *</label>
            <select 
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Meeting">Meeting</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Support">Support</option>
              <option value="Collection">Collection</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status *</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Next Follow-up Date</label>
            <input 
              type="date"
              name="nextFollowUpDate"
              value={formData.nextFollowUpDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          <p className="text-sm text-gray-500">Location and report details.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location (Address)</label>
            <input 
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 123 Business Rd, City"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Report Details</label>
            <textarea 
              name="reportDetails"
              value={formData.reportDetails}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Summarize the discussion, outcomes, or next steps..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : <><Save size={18} /> Save Visit</>}
        </button>
      </div>
    </form>
  );
}

export default function NewVisitPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full pb-20">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/visits" className="p-2 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-sm">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Visit</h1>
          <p className="text-sm text-gray-500 mt-1">Log a new interaction with a customer</p>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading form...</div>}>
        <VisitForm />
      </Suspense>
    </div>
  );
}
