'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  History, 
  PlusCircle, 
  LogOut, 
  Hexagon,
  Menu,
  X,
  User
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { name: 'Overview', href: '/borrower', icon: LayoutDashboard },
  { name: 'My Loans', href: '/borrower/loans', icon: History },
  { name: 'New Application', href: '/apply', icon: PlusCircle },
];

export default function BorrowerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/borrower" className="flex items-center gap-2 group">
                <Hexagon className="w-8 h-8 fill-indigo-600 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold tracking-tight text-slate-900">LoanFlow</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        isActive 
                          ? "text-indigo-600 bg-indigo-50" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900">{user?.email}</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Borrower</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <User className="w-5 h-5" />
              </div>
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button 
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 animate-in slide-in-from-top duration-200">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold",
                    pathname === item.href 
                      ? "text-indigo-600 bg-indigo-50" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
