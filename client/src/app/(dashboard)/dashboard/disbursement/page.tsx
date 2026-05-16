'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  Banknote, 
  Loader2, 
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/format';

interface Loan {
  _id: string;
  loanAmount: number;
  tenure: number;
  totalRepayment: number;
  sanctionedAt: string;
  borrowerProfile: {
    fullName: string;
  };
}


export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [disburseModal, setDisburseModal] = useState<Loan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/dashboard/disbursement');
      setLoans(data);
    } catch (error) {
      console.error('Error fetching sanctioned loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async () => {
    if (!disburseModal) return;
    
    setSubmitting(true);
    try {
      await api.put(`/dashboard/disbursement/${disburseModal._id}`);
      toast.success('Loan marked as disbursed!');
      setDisburseModal(null);
      fetchLoans();
    } catch (error) {
      toast.error('Failed to mark loan as disbursed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disbursement Queue</h1>
        <p className="text-slate-500">Sanctioned loans ready for fund transfer.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-slate-500">Loading loans...</p>
          </div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenure</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Repayment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sanctioned On</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{loan.borrowerProfile.fullName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{formatINR(loan.loanAmount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{loan.tenure} days</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatINR(loan.totalRepayment)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(loan.sanctionedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setDisburseModal(loan)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-100"
                      >
                        <Banknote className="w-4 h-4" />
                        Mark as Disbursed
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
              <Banknote className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-semibold">No loans ready for disbursement</h3>
            <p className="text-slate-500 text-sm mt-1">Wait for applications to be sanctioned.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {disburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDisburseModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirm Disbursement</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to disburse <span className="font-bold text-indigo-600">{formatINR(disburseModal.loanAmount)}</span> to <span className="font-bold text-slate-900">{disburseModal.borrowerProfile.fullName}</span>?
              This action will mark the loan as active and start the repayment cycle.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDisburseModal(null)}
                className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={submitting}
                onClick={handleDisburse}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
