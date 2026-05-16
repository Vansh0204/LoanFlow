'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  Users, 
  Loader2, 
  Search,
  Mail,
  Calendar,
  Eye,
  X
} from 'lucide-react';
import clsx from 'clsx';

interface Lead {
  _id: string;
  email: string;
  createdAt: string;
}

export default function SalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await api.get('/dashboard/sales');
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(l => 
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 relative min-h-[80vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Leads</h1>
          <p className="text-slate-500">Borrowers registered but haven't applied for a loan yet.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3">
          <div className="text-slate-400">Total Leads:</div>
          <div className="text-xl font-bold text-indigo-600">{leads.length}</div>
        </div>
      </div>

      {/* Filter/Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-slate-500">Loading leads...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        No application yet
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-semibold">No leads found</h3>
            <p className="text-slate-500 text-sm mt-1">All borrowers have submitted applications.</p>
          </div>
        )}
      </div>

      {/* Slide-over Panel (Simple version) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">User Details</h2>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {selectedLead.email[0].toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedLead.email}</h3>
                  <p className="text-slate-500 text-sm">Borrower ID: {selectedLead._id}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Registration Info</h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium text-amber-600">Lead</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Joined Date</span>
                      <span className="font-medium text-slate-900">{new Date(selectedLead.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <h4 className="text-indigo-900 font-bold mb-2">Next Steps</h4>
                  <p className="text-indigo-800 text-sm leading-relaxed">
                    This user has registered but hasn't started the loan application flow. Our sales team can reach out to help them complete their profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
