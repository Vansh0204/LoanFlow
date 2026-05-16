'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  FileCheck, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { SkeletonTable, EmptyState } from '@/components/ui/feedback';
import { LmsButton } from '@/components/ui/button';
import { formatINR, formatDate } from '@/lib/format';

interface Application {
  _id: string;
  loanAmount: number;
  tenure: number;
  status: string;
  createdAt: string;
  borrowerProfile: {
    fullName: string;
    pan: string;
    monthlySalary: number;
    employmentMode: string;
    salarySlipUrl: string;
  };
}

export default function SanctionPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      const { data } = await api.get('/dashboard/sanction');
      setApps(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAction = async (loanId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason) {
      toast.error('Rejection reason is required');
      return;
    }

    setSubmitting(loanId + action);
    try {
      await api.put(`/dashboard/sanction/${loanId}`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      });
      toast.success(action === 'approve' ? 'Loan sanctioned!' : 'Loan rejected');
      setRejectionModal(null);
      setRejectionReason('');
      fetchApps();
    } catch (error) {
      // Interceptor handles status toast
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sanction Queue</h1>
        <p className="text-slate-500">Review and approve pending loan applications.</p>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : apps.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PAN</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {apps.map((app) => (
                  <React.Fragment key={app._id}>
                    <tr 
                      className={clsx(
                        "hover:bg-slate-50 transition-colors cursor-pointer group",
                        expandedRow === app._id && "bg-slate-50"
                      )}
                      onClick={() => setExpandedRow(expandedRow === app._id ? null : app._id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{app.borrowerProfile.fullName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{app.borrowerProfile.employmentMode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono tracking-tighter">{app.borrowerProfile.pan}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatINR(app.borrowerProfile.monthlySalary)}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{formatINR(app.loanAmount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(app.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                          <LmsButton 
                            size="sm"
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 px-2"
                            onClick={() => handleAction(app._id, 'approve')}
                            isLoading={submitting === app._id + 'approve'}
                          >
                            Approve
                          </LmsButton>
                          <button 
                            onClick={() => setRejectionModal({ id: app._id })}
                            className="text-xs font-bold text-red-500 hover:text-red-700 underline"
                          >
                            Reject
                          </button>
                          {expandedRow === app._id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === app._id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 bg-slate-50/30 border-b border-slate-200 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                Documents
                              </h4>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-900">
                                  <FileCheck className="w-5 h-5 text-indigo-600" />
                                  Salary Slip
                                </div>
                                <a 
                                  href={process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${app.borrowerProfile.salarySlipUrl}` : `http://localhost:5000${app.borrowerProfile.salarySlipUrl}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                                >
                                  Open <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                Loan Terms
                              </h4>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Tenure</span>
                                  <span className="font-bold text-slate-900">{app.tenure} days</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Interest</span>
                                  <span className="font-bold text-amber-600">{formatINR(Math.round((app.loanAmount * 12 * app.tenure) / (365 * 100)))}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-200">
                              <h4 className="font-bold mb-1">Underwriting Action</h4>
                              <p className="text-slate-400 text-xs mb-4">Validate that the income proof matches the claimed monthly salary.</p>
                              <div className="flex gap-2">
                                <LmsButton 
                                  className="flex-1"
                                  onClick={() => handleAction(app._id, 'approve')}
                                  isLoading={submitting === app._id + 'approve'}
                                >
                                  Sanction
                                </LmsButton>
                                <LmsButton 
                                  variant="danger" 
                                  onClick={() => setRejectionModal({ id: app._id })}
                                >
                                  X
                                </LmsButton>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
          icon={Briefcase} 
          title="No pending applications" 
          subtitle="Applications awaiting review will appear here automatically." 
        />
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRejectionModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Reject Application</h2>
            <p className="text-slate-500 text-sm mb-6 text-center">
              Please specify why this loan application was declined.
            </p>
            <textarea
              className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none mb-6 text-sm"
              placeholder="e.g. Income insufficient, documents blurred..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <LmsButton 
                variant="outline" 
                className="flex-1" 
                onClick={() => setRejectionModal(null)}
              >
                Cancel
              </LmsButton>
              <LmsButton 
                variant="danger" 
                className="flex-1"
                disabled={!rejectionReason}
                onClick={() => handleAction(rejectionModal.id, 'reject')}
                isLoading={submitting === rejectionModal.id + 'reject'}
              >
                Confirm Reject
              </LmsButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
