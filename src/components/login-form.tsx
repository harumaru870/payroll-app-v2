'use client';

import { loginWithAuth0 } from '@/app/login/actions';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <>
          Auth0でログイン <ArrowRight className="ml-2 w-5 h-5" />
        </>
      )}
    </button>
  );
}

export default function LoginForm() {
  return (
    <form action={loginWithAuth0} className="space-y-4">
      <div className="mt-8">
        <LoginButton />
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>組織のアカウントでログインしてください。</p>
      </div>
    </form>
  );
}