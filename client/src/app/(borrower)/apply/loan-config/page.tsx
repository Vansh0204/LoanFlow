'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApplyStore } from '@/store/useApplyStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const formatIN = (num: number) => new Intl.NumberFormat('en-IN').format(num);

export default function LoanConfigPage() {
  const router = useRouter();
  const { loanConfig, setLoanConfig } = useApplyStore();
  
  const [loanAmount, setLoanAmount] = useState(loanConfig?.loanAmount || 100000);
  const [tenure, setTenure] = useState(loanConfig?.tenure || 90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SI = (P × R × T) / (365 × 100)
  const calculateSI = (p: number, t: number) => {
    return Math.round((p * 12 * t) / (365 * 100));
  };

  const si = calculateSI(loanAmount, tenure);
  const totalRepayment = loanAmount + si;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { loanAmount, tenure };
      await api.post('/borrower/apply', payload);
      setLoanConfig(payload);
      toast.success('Loan application submitted!');
      router.push('/apply/status');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-1">Configure Your Loan</h3>
        <p className="text-slate-500 text-sm">Select the amount and duration that works best for you.</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-medium text-slate-700">Loan Amount</label>
            <div className="text-2xl font-bold text-indigo-600">₹{formatIN(loanAmount)}</div>
          </div>
          <input
            type="range"
            min="50000"
            max="500000"
            step="5000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          />
          <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
            <span>₹50,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-medium text-slate-700">Tenure</label>
            <div className="text-2xl font-bold text-indigo-600">{tenure} <span className="text-sm font-medium text-slate-500">days</span></div>
          </div>
          <input
            type="range"
            min="30"
            max="365"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          />
          <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
            <span>30 days</span>
            <span>365 days</span>
          </div>
        </div>
      </div>

      {/* Live Calculation Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Repayment Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Loan Amount</span>
            <span className="font-medium text-slate-900">₹{formatIN(loanAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tenure</span>
            <span className="font-medium text-slate-900">{tenure} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Interest Rate</span>
            <span className="font-medium text-slate-900">12% p.a.</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Simple Interest</span>
            <span className="font-medium text-amber-600">+ ₹{formatIN(si)}</span>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="font-semibold text-slate-900">Total Repayment</span>
            <span className="text-xl font-bold text-indigo-600">₹{formatIN(totalRepayment)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-4">
        <button
          type="button"
          onClick={() => router.push('/apply/upload-documents')}
          className="w-1/3 py-3 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-2/3 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply Now'}
        </button>
      </div>
    </div>
  );
}
