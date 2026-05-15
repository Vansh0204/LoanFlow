'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth';

const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password') || '';

  // Calculate password strength
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strength = calculateStrength(password);
  
  const getStrengthText = () => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const response = await api.post('/auth/signup', {
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully!');
      login(response.data.token, response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account.');
    }
  };

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h2>
        <p className="text-slate-500">Sign up to apply for a loan in minutes.</p>
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
              placeholder="Create a password"
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
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1 h-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={clsx(
                      'h-full flex-1 rounded-full transition-colors',
                      strength >= level ? getStrengthColor() : 'bg-slate-200'
                    )}
                  />
                ))}
              </div>
              <span className={clsx('text-xs font-medium', 
                strength <= 1 ? 'text-red-500' : 
                strength <= 2 ? 'text-yellow-600' : 'text-emerald-600'
              )}>
                {getStrengthText()}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
