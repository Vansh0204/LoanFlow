'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Check, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  { id: 1, name: 'Personal Details', path: '/apply/personal-details' },
  { id: 2, name: 'Upload Documents', path: '/apply/upload-documents' },
  { id: 3, name: 'Loan Config', path: '/apply/loan-config' },
  { id: 4, name: 'Status', path: '/apply/status' },
];

export default function ApplyLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentStep = STEPS.find(s => s.path === pathname)?.id || 1;

  return (
    <div className="min-h-screen">
      {/* Header for Application Wizard */}
      <header className="bg-white border-b border-slate-200 h-16 mb-8">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LoanFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-slate-500">Application Wizard</span>
            <Link
              href="/borrower"
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-8">
      {/* Step Indicator */}
      <div className="mb-12 px-4 sm:px-0">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute left-0 top-[18px] w-full h-0.5 bg-slate-200 -z-10"></div>
          
          {/* Dynamic Progress Line */}
          <div 
            className="absolute left-0 top-[18px] h-0.5 bg-indigo-600 -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex items-center justify-between">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={clsx(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-3 transition-all duration-500",
                      isCompleted ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : 
                      isCurrent ? "bg-white border-2 border-indigo-600 text-indigo-600 shadow-sm" : 
                      "bg-white border-2 border-slate-200 text-slate-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3px] animate-in zoom-in duration-300" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className={clsx(
                    "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center",
                    isCurrent || isCompleted ? "text-indigo-900" : "text-slate-400"
                  )}>
                    {step.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-sm">
        {children}
      </div>
      </div>
    </div>
  );
}
