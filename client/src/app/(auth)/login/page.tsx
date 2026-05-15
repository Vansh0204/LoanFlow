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

      {/* Demo Credentials */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="w-full text-left text-sm font-medium text-slate-600 hover:text-slate-900 flex justify-between items-center"
        >
          <span>Demo credentials</span>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded">Click to expand</span>
        </button>
        
        {showDemo && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {['admin', 'sales', 'sanction', 'disbursement', 'collection', 'borrower'].map((role) => (
              <button
                key={role}
                onClick={() => handleDemoClick(`${role}@lms.com`)}
                className="text-left px-3 py-2 border border-slate-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div className="font-semibold text-slate-800 capitalize">{role}</div>
                <div className="text-slate-500">{role}@lms.com</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
