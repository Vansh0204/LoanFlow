'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Banknote,
  Calendar,
  Percent,
  Wallet
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import { SkeletonTable, EmptyState } from '@/components/ui/feedback';
import clsx from 'clsx';

export default function BorrowerDashboard() {
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const { data } = await api.get('/borrower/my-loan');
        setLoan(data);
      } catch (error) {
        console.error('Failed to fetch loan status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, []);

  const getStatusInfo = (status: string) => {
    const map: any = {
      applied: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Clock, label: 'Under Review', desc: 'Our team is verifying your documents.' },
      sanctioned: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Approved', desc: 'Your loan is ready for disbursement.' },
      disbursed: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Banknote, label: 'Disbursed', desc: 'Funds have been sent to your account.' },
      active: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: Wallet, label: 'Active', desc: 'Repayments are currently ongoing.' },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, label: 'Declined', desc: 'Please check the rejection reason below.' },
      closed: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: CheckCircle2, label: 'Closed', desc: 'Loan successfully repaid in full.' },
    };
    return map[status] || map.applied;
  };

  if (loading) return <div className="space-y-6">
    <div className="h-32 bg-white rounded-2xl animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-40 bg-white rounded-2xl animate-pulse" />
      <div className="h-40 bg-white rounded-2xl animate-pulse" />
      <div className="h-40 bg-white rounded-2xl animate-pulse" />
    </div>
  </div>;

  if (!loan) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="No Active Loans"
        subtitle="You haven't applied for a loan yet. Get started in minutes."
        action={
          <Link 
            href="/apply"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Start New Application <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
    );
  }

  const status = getStatusInfo(loan.status);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Status Header */}
      <div className={clsx("p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center gap-8", status.bg, status.border)}>
        <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm shrink-0", status.color)}>
          <status.icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">Current Status: {status.label}</h2>
            <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-white", status.color)}>
              {loan.status}
            </span>
          </div>
          <p className="text-slate-600 font-medium">{status.desc}</p>
        </div>
        <Link 
          href="/apply/status"
          className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-center"
        >
          View Full Details
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Loan Amount</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatINR(loan.loanAmount)}</div>
          <div className="mt-2 text-xs font-medium text-slate-400">Tenure: {loan.tenure} days</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Total Repayment</span>
          </div>
          <div className="text-3xl font-bold text-amber-600">{formatINR(loan.totalRepayment)}</div>
          <div className="mt-2 text-xs font-medium text-slate-400">Interest: {loan.interestRate}% p.a.</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500">Applied Date</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatDate(loan.createdAt)}</div>
          <div className="mt-2 text-xs font-medium text-slate-400">ID: {loan._id.slice(-8).toUpperCase()}</div>
        </div>
      </div>

      {/* Progress Card */}
      {(loan.status === 'disbursed' || loan.status === 'active') && (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Repayment Progress
              <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-widest">Active</span>
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-200 font-medium">Balance Paid</span>
                  <span className="font-bold">{Math.round((loan.totalAmountPaid / loan.totalRepayment) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(loan.totalAmountPaid / loan.totalRepayment) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Paid So Far</p>
                  <p className="text-2xl font-bold">{formatINR(loan.totalAmountPaid)}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-amber-400">{formatINR(loan.outstandingBalance)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>
      )}
    </div>
  );
}
