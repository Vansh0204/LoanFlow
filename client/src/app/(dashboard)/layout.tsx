'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Banknote, 
  Coins, 
  LogOut, 
  Hexagon,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'sanction', 'disbursement', 'collection'] },
  { name: 'Sales', href: '/dashboard/sales', icon: Users, roles: ['admin', 'sales'] },
  { name: 'Sanction', href: '/dashboard/sanction', icon: FileCheck, roles: ['admin', 'sanction'] },
  { name: 'Disbursement', href: '/dashboard/disbursement', icon: Banknote, roles: ['admin', 'disbursement'] },
  { name: 'Collection', href: '/dashboard/collection', icon: Coins, roles: ['admin', 'collection'] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredItems = SIDEBAR_ITEMS.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hexagon className="w-8 h-8 fill-indigo-600 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">LoanFlow</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (Fixed) & Mobile (Slide-over) */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="hidden sm:inline">Dashboard</span>
              {pathname !== '/dashboard' && (
                <>
                  <ChevronRight className="w-4 h-4 hidden sm:block" />
                  <span className="font-medium text-slate-900 capitalize">
                    {pathname.split('/').pop()}
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
