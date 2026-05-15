import { ReactNode } from 'react';
import { Hexagon } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-white text-slate-900">
      {/* Left side: branding/gradient */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <Hexagon className="w-8 h-8 fill-indigo-400 text-white" />
            <span className="text-2xl font-bold tracking-tight">LoanFlow</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">
              Powering smarter lending decisions
            </h1>
            <p className="text-indigo-100 text-lg">
              Streamline your loan origination process, automate underwriting, and disburse funds faster than ever before.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-indigo-200 text-sm">
          &copy; {new Date().getFullYear()} LoanFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <Hexagon className="w-8 h-8 fill-indigo-600 text-indigo-600" />
            <span className="text-2xl font-bold text-slate-900">LoanFlow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
