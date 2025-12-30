'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/login/actions';
import { ArrowRight, Loader2, KeyRound, Mail } from 'lucide-react';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          className="mb-3 mt-5 block text-xs font-bold text-gray-900 uppercase"
          htmlFor="email"
        >
          メールアドレス
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-900"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            required
          />
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
      </div>
      <div className="mt-4">
        <label
          className="mb-3 mt-5 block text-xs font-bold text-gray-900 uppercase"
          htmlFor="password"
        >
          パスワード
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-900"
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            required
            minLength={6}
          />
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
      </div>
      
      <div className="mt-8">
        <button
          className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          aria-disabled={isPending}
        >
          {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <>
              ログイン <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>
      
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <p className="text-sm text-red-500 font-bold">
            ⚠ {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
