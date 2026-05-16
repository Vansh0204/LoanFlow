'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/axios';

import { formatINR } from '@/lib/format';

export default function StatusPage() {
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLoan = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const { data } = await api.get('/borrower/my-loan');
      setLoan(data);
    } catch (error) {
      console.error('Failed to fetch loan status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoan();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLoan(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sanctioned': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'disbursed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'active': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">Fetching latest status...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Application Found</h3>
        <p className="text-slate-500">You don't have any active loan applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">Application Status</h3>
          <p className="text-slate-500 text-sm">Track your loan application progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/borrower"
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
          >
            Go to Dashboard
          </Link>
          <button 
            onClick={() => fetchLoan(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-200 shadow-sm">
          {loan.status === 'rejected' ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : loan.status === 'closed' ? (
            <CheckCircle2 className="w-8 h-8 text-slate-500" />
          ) : loan.status === 'sanctioned' || loan.status === 'disbursed' || loan.status === 'active' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          ) : (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <h4 className="text-lg font-semibold text-slate-900">Current Status</h4>
            <span className={clsx(
              "px-2.5 py-1 text-xs font-semibold rounded-full border capitalize",
              getStatusColor(loan.status)
            )}>
              {loan.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            {loan.status === 'applied' && 'Your application is currently under review by our sanctioning team.'}
            {loan.status === 'sanctioned' && 'Congratulations! Your loan has been approved and is pending disbursement.'}
            {loan.status === 'disbursed' && 'Funds have been disbursed to your account. Your loan is now active.'}
            {loan.status === 'active' && 'Your loan is active. Please ensure timely repayments.'}
            {loan.status === 'rejected' && `Your application was declined. Reason: ${loan.rejectionReason || 'Not specified'}.`}
            {loan.status === 'closed' && 'Your loan has been fully repaid and closed.'}
          </p>
        </div>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h4 className="font-semibold text-slate-900">Loan Summary</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Application ID</p>
              <p className="font-medium text-slate-900 uppercase">{loan._id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Applied On</p>
              <p className="font-medium text-slate-900">{new Date(loan.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="sm:col-span-2 my-2 border-t border-slate-100"></div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Principal Amount</p>
              <p className="font-medium text-slate-900 text-lg">{formatINR(loan.loanAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Repayment Amount</p>
              <p className="font-medium text-indigo-600 text-lg">{formatINR(loan.totalRepayment)}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Tenure</p>
              <p className="font-medium text-slate-900">{loan.tenure} days</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Interest Rate</p>
              <p className="font-medium text-slate-900">{loan.interestRate}% p.a.</p>
            </div>

            {loan.status === 'active' && (
              <>
                <div className="sm:col-span-2 my-2 border-t border-slate-100"></div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Paid</p>
                  <p className="font-medium text-emerald-600">{formatINR(loan.totalAmountPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Outstanding Balance</p>
                  <p className="font-medium text-amber-600">{formatINR(loan.outstandingBalance)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
