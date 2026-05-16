'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      toast.success('Logged in successfully!');
      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleDemoClick = (email: string) => {
    setValue('email', email);
    const password = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) + '@123';
    setValue('password', password);
  };

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
        <p className="text-slate-500">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
              Remember me
            </label>
          </div>
          <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>

      {/* Demo Credentials Section */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors mx-auto"
        >
          View demo credentials {showDemo ? '▴' : '▾'}
        </button>
        
        {showDemo && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { role: 'Admin', email: 'admin@lms.com' },
                  { role: 'Sales', email: 'sales@lms.com' },
                  { role: 'Sanction', email: 'sanction@lms.com' },
                  { role: 'Disbursement', email: 'disbursement@lms.com' },
                  { role: 'Collection', email: 'collection@lms.com' },
                  { role: 'Borrower', email: 'borrower@lms.com' },
                ].map((item) => (
                  <tr key={item.role} className="hover:bg-white transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-700">{item.role}</td>
                    <td className="px-3 py-2 text-slate-500 font-mono">{item.email}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDemoClick(item.email)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
