"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '', 
    salesPersonName: '',
    visitDate: '',
    visitTime: '',
    visitType: 'Meeting',
    status: 'Pending',
    location: { address: '' },
    reportDetails: '',
    nextFollowUpDate: ''
  });

  useEffect(() => {
    async function fetchVisit() {
      try {
        const res = await fetch(`/api/visits/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            ...data,
            visitDate: data.visitDate ? new Date(data.visitDate).toISOString().split('T')[0] : '',
            visitTime: data.visitTime || '',
            nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString().split('T')[0] : '',
            location: data.location || { address: '' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    }
    if (id) fetchVisit();
  }, [id]);

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
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/dashboard/visits');
      } else {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update visit');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full pb-20">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Visit</h1>
          <p className="text-sm text-gray-500 mt-1">Update interaction details for {formData.customerName}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Visit Details</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Customer Name *</label>
              <input 
                required
                name="customerName"
                value={formData.customerName || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Visit Date *</label>
              <input 
                type="date"
                required
                name="visitDate"
                value={formData.visitDate || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Visit Time</label>
              <input 
                type="time"
                name="visitTime"
                value={formData.visitTime || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Visit Type *</label>
              <select 
                name="visitType"
                value={formData.visitType || 'Meeting'}
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
                value={formData.status || 'Pending'}
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
                value={formData.nextFollowUpDate || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location (Address)</label>
              <input 
                name="location.address"
                value={formData.location?.address || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Report Details</label>
              <textarea 
                name="reportDetails"
                value={formData.reportDetails || ''}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
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
            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
