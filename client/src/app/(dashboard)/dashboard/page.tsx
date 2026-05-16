'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/axios';
import { 
  Users, 
  FileCheck, 
  Banknote, 
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Stats {
  totalLeads: number;
  pendingApps: number;
  activeLoans: number;
  closedThisMonth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role && user.role !== 'borrower') {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const cards = [
    { 
      title: 'Total Leads', 
      value: stats?.totalLeads || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      href: '/dashboard/sales',
      desc: 'Registered borrowers without apps'
    },
    { 
      title: 'Pending Apps', 
      value: stats?.pendingApps || 0, 
      icon: FileCheck, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      href: '/dashboard/sanction',
      desc: 'Applications awaiting review'
    },
    { 
      title: 'Active Loans', 
      value: stats?.activeLoans || 0, 
      icon: Banknote, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      href: '/dashboard/disbursement',
      desc: 'Loans disbursed & in repayment'
    },
    { 
      title: 'Closed (MTD)', 
      value: stats?.closedThisMonth || 0, 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      href: '/dashboard/collection',
      desc: 'Loans closed this month'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500">Key performance indicators for the current period.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.title} 
            href={card.href}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
            <p className="text-xs text-slate-400 mt-2">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
