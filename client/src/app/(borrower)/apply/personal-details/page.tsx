'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Briefcase, Building2, UserX, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/axios';
import { useApplyStore } from '@/store/useApplyStore';

const personalSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  monthlySalary: z.number().min(0, 'Salary cannot be negative'),
  employmentMode: z.enum(['salaried', 'self-employed', 'unemployed']),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { personalDetails, setPersonalDetails } = useApplyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breErrors, setBreErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: personalDetails || {
      fullName: '',
      pan: '',
      dateOfBirth: '',
      monthlySalary: 30000,
      employmentMode: 'salaried',
    },
  });

  const employmentMode = watch('employmentMode');

  const onSubmit = async (data: PersonalFormValues) => {
    setIsSubmitting(true);
    setBreErrors([]);
    try {
      await api.post('/borrower/profile', data);
      setPersonalDetails(data);
      router.push('/apply/upload-documents');
    } catch (error: any) {
      if (error.response?.status === 422) {
        setBreErrors(error.response.data.reasons || ['Application rejected based on business rules.']);
      } else {
        setBreErrors([error.response?.data?.message || 'Something went wrong.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-1">Personal Details</h3>
        <p className="text-slate-500 text-sm">Please provide your basic information as per your PAN.</p>
      </div>

      {breErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-1">Eligibility Check Failed</h4>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {breErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            {...register('fullName')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
            <input
              {...register('pan')}
              onChange={(e) => {
                const upper = e.target.value.toUpperCase();
                setValue('pan', upper, { shouldValidate: true });
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none uppercase"
              placeholder="ABCDE1234F"
            />
            <p className="mt-1 text-xs text-slate-500">Format: ABCDE1234F</p>
            {errors.pan && <p className="mt-1 text-sm text-red-600">{errors.pan.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            />
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
            <input
              {...register('monthlySalary', { valueAsNumber: true })}
              type="number"
              className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>
          {errors.monthlySalary && <p className="mt-1 text-sm text-red-600">{errors.monthlySalary.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Employment Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => setValue('employmentMode', 'salaried')}
              className={clsx(
                "cursor-pointer border rounded-lg p-4 flex flex-col items-center text-center gap-2 transition-all",
                employmentMode === 'salaried' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600"
              )}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-medium">Salaried</span>
            </div>
            <div 
              onClick={() => setValue('employmentMode', 'self-employed')}
              className={clsx(
                "cursor-pointer border rounded-lg p-4 flex flex-col items-center text-center gap-2 transition-all",
                employmentMode === 'self-employed' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600"
              )}
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-sm font-medium">Self-Employed</span>
            </div>
            <div 
              onClick={() => setValue('employmentMode', 'unemployed')}
              className={clsx(
                "cursor-pointer border rounded-lg p-4 flex flex-col items-center text-center gap-2 transition-all",
                employmentMode === 'unemployed' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600"
              )}
            >
              <UserX className="w-6 h-6" />
              <span className="text-sm font-medium">Unemployed</span>
            </div>
          </div>
          {/* Hidden input to register the value */}
          <input type="hidden" {...register('employmentMode')} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
        </button>
      </form>
    </div>
  );
}
