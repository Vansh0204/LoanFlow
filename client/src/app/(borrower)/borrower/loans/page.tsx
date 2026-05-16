'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import { SkeletonTable, EmptyState } from '@/components/ui/feedback';
import Link from 'next/link';
import clsx from 'clsx';

export default function LoansHistoryPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const { data } = await api.get('/borrower/my-loan');
        // Since we currently only support one active loan per flow, 
        // we'll treat the response as a single item in an array for now.
        // In a real system, /my-loan might return an array.
        setLoans(data ? [data] : []);
      } catch (error) {
        console.error('Failed to fetch loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const getStatusBadge = (status: string) => {
    const map: any = {
      applied: 'bg-blue-100 text-blue-700',
      sanctioned: 'bg-emerald-100 text-emerald-700',
      disbursed: 'bg-indigo-100 text-indigo-700',
      active: 'bg-orange-100 text-orange-700',
      rejected: 'bg-red-100 text-red-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) return <SkeletonTable rows={5} />;

  if (loans.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Loan History"
        subtitle="You haven't applied for any loans yet."
        action={
          <Link href="/apply" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
            Apply Now
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Loan History</h1>
          <p className="text-slate-500 text-sm">Review your past and current loan applications.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Loan ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Applied On</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <tr key={loan._id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 uppercase">#{loan._id.slice(-8)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Personal Loan</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{formatINR(loan.loanAmount)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{loan.tenure} days @ {loan.interestRate}%</div>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusBadge(loan.status))}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {formatDate(loan.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href="/apply/status"
                    className="p-2 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all inline-block"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Total Borrowed</p>
            <p className="text-xl font-bold text-emerald-900">{formatINR(loans.reduce((acc, l) => acc + l.loanAmount, 0))}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-4 text-slate-400 grayscale opacity-70">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Loans Closed</p>
            <p className="text-xl font-bold text-slate-600">{loans.filter(l => l.status === 'closed').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
