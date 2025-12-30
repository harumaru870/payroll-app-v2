import LoginForm from '@/components/login-form';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen bg-gray-50">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex w-full items-end rounded-t-2xl bg-blue-600 p-3 md:h-36">
          <div className="w-full text-white">
            <div className="flex items-center mb-2">
               <ShieldCheck className="w-10 h-10 mr-2" />
               <h1 className="text-3xl font-black">Admin Login</h1>
            </div>
            <p className="text-blue-100 font-bold text-sm">給与管理システムへようこそ</p>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl p-8 shadow-md border-x border-b border-gray-100">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
