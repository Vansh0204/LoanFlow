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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredItems = SIDEBAR_ITEMS.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-2 mb-4">
        <Hexagon className="w-8 h-8 fill-indigo-600 text-indigo-600" />
        <span className="text-xl font-bold tracking-tight">LoanFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-slate-900 text-white flex-col fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[240px] bg-slate-900 text-white flex flex-col animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
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

        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
