'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Hexagon, LogOut, User as UserIcon } from 'lucide-react';

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {children}
    </div>
  );
}
