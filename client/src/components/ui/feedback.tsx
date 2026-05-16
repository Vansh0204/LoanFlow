import { ReactNode } from 'react';

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  subtitle 
}: { 
  icon: any; 
  title: string; 
  subtitle: string;
}) {
  return (
    <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-900 font-semibold">{title}</h3>
      <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
