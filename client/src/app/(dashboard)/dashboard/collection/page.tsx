'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  Coins, 
  Loader2, 
  RefreshCw,
  Plus,
  X,
  History,
  Calendar,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { formatINR } from '@/lib/format';

interface Loan {
  _id: string;
  loanAmount: number;
  totalRepayment: number;
  totalAmountPaid: number;
  outstandingBalance: number;
  status: string;
  borrowerProfile: {
    fullName: string;
  };
}

interface Payment {
  _id: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
}


export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  // Payment Form State
  const [utrNumber, setUtrNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/dashboard/collection');
      setLoans(data);
    } catch (error) {
      console.error('Error fetching collection loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (loanId: string) => {
    setLoadingPayments(true);
    try {
      const { data } = await api.get(`/dashboard/collection/${loanId}/payments`);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const openPaymentPanel = (loan: Loan) => {
    setSelectedLoan(loan);
    setUtrNumber('');
    setAmount('');
    fetchPayments(loan._id);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    if (Number(amount) > selectedLoan.outstandingBalance) {
      toast.error('Amount cannot exceed outstanding balance');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/dashboard/collection/${selectedLoan._id}/payment`, {
        utrNumber,
        amount: Number(amount),
        paymentDate
      });
      toast.success('Payment recorded successfully!');
      setUtrNumber('');
      setAmount('');
      fetchPayments(selectedLoan._id);
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 relative min-h-[80vh]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
        <p className="text-slate-500">Manage active loans and record incoming payments.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-slate-500">Loading active loans...</p>
          </div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Repayment Progress</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loans.map((loan) => {
                  const progress = (loan.totalAmountPaid / loan.totalRepayment) * 100;
                  const isClosed = loan.status === 'closed';

                  return (
                    <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{loan.borrowerProfile.fullName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-500">
                          <span>Principal: {formatINR(loan.loanAmount)}</span>
                          <span>Total: {formatINR(loan.totalRepayment)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-emerald-600">{formatINR(loan.totalAmountPaid)} paid</span>
                            <span className="text-slate-400">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-1000" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{formatINR(loan.outstandingBalance)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isClosed ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Closed
                            </span>
                            <button 
                              onClick={() => openPaymentPanel(loan)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="View History"
                            >
                              <History className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openPaymentPanel(loan)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Record Payment
                            </button>
                            <button 
                              onClick={() => openPaymentPanel(loan)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="View History"
                            >
                              <History className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-semibold">No active loans</h3>
            <p className="text-slate-500 text-sm mt-1">Disbursed loans will appear here for collection.</p>
          </div>
        )}
      </div>

      {/* Record Payment Slide-over */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLoan(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Record Payment</h2>
                  <p className="text-xs text-slate-400">Borrower: {selectedLoan.borrowerProfile.fullName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Form Section */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <form onSubmit={handleRecordPayment} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">UTR Number / Ref</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900 bg-white"
                          placeholder="Unique transaction reference"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹)</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900 bg-white font-bold"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        max={selectedLoan.outstandingBalance}
                      />
                      <p className="mt-1.5 text-[10px] font-bold text-amber-600 uppercase">Max: {formatINR(selectedLoan.outstandingBalance)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Payment Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-slate-900 bg-white"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Confirm Payment
                  </button>
                </form>
              </div>

              {/* History Section */}
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    Payment History
                  </h3>
                  <button 
                    onClick={() => fetchPayments(selectedLoan._id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                  >
                    <RefreshCw className={clsx("w-4 h-4", loadingPayments && "animate-spin")} />
                  </button>
                </div>

                {loadingPayments ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                  </div>
                ) : payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{formatINR(p.amount)}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.utrNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(p.paymentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">No payments recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
