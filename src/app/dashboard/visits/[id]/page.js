"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function LeadVisitsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id;
  
  const [lead, setLead] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    const fetchData = async () => {
      setLoading(true);
      
      // Try to load visits from localStorage
      let allVisits = [];
      try {
        const stored = localStorage.getItem('visits_data');
        if (stored) {
          allVisits = JSON.parse(stored).map(v => ({...v, date: new Date(v.date)}));
        } else {
          allVisits = [
            {
              id: 'v1',
              date: new Date('2026-05-27T12:26:00'),
              leadId: 'c1',
              leadName: 'Nishanth',
              companyName: 'Nishanth&Co',
              salesperson: 'Admin User',
              feedback: 'positive',
              gpsCaptured: true
            }
          ];
        }
      } catch(e) {
        console.error(e);
      }
      
      const leadVisits = allVisits.filter(v => v.leadId === leadId || leadId === 'c1'); // fallback to show something for demo
      
      setVisits(leadVisits);
      
      // Mock Lead data based on screenshot
      setLead({
        id: leadId,
        name: leadVisits.length > 0 ? leadVisits[0].leadName : 'Nishanth',
        company: leadVisits.length > 0 ? leadVisits[0].companyName : 'Nishanth&Co',
        phone: '7010126911',
        email: 'sargurudurai25@gmail.com',
        address: 'Kidathuraiputhr, Palladam, Tiruppur',
        status: 'VISITED'
      });
      
      setLoading(false);
    };

    fetchData();
  }, [leadId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse bg-slate-200 h-8 w-48 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="animate-pulse bg-slate-200 h-80 rounded-2xl md:col-span-1"></div>
          <div className="animate-pulse bg-slate-200 h-80 rounded-2xl md:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans bg-slate-50/30 min-h-screen">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Leads Management</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link href="/dashboard/visits" className="flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} />
          {lead.name}
        </Link>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Edit size={16} /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Delete
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <MapPin size={16} /> Add Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Customer Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-slate-800 font-medium">{lead.company}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-slate-800 font-medium">{lead.phone}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-800 font-medium">{lead.email}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-slate-800 font-medium">{lead.address}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                  {lead.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visit History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Clock size={20} className="text-slate-400" />
                Visit History
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                {visits.length} records
              </span>
            </div>

            <div className="pl-4 border-l-2 border-slate-100 space-y-6 relative ml-2">
              {visits.map((visit, index) => (
                <div key={visit.id || index} className="relative">
                  <div className="absolute -left-[27px] top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white ring-4 ring-white"></div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 ml-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="font-bold text-slate-900">
                          {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(visit.date)} at {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(visit.date)}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          by {visit.salesperson}
                        </div>
                      </div>
                      
                      {visit.gpsCaptured && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium self-start">
                          <CheckCircle2 size={14} />
                          GPS Captured
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-700 text-sm mt-3">
                      {visit.feedback}
                    </p>
                  </div>
                </div>
              ))}
              
              {visits.length === 0 && (
                <div className="text-slate-500 py-8 text-center ml-4">
                  No visits recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
