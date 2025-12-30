'use client'

import { createEmployee } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    
    const result = await createEmployee(formData)
    
    if (result.success) {
      router.push('/employees')
      router.refresh()
    } else {
      setError(result.error || 'エラーが発生しました')
      setIsPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">従業員新規登録</h1>
          <p className="text-gray-700">新しい従業員の情報を入力してください</p>
        </div>

        <form action={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">氏名 *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">メールアドレス *</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="yamada@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">基本時給 *</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">¥</span>
                <input
                  name="hourlyWage"
                  type="number"
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-xl p-3 pl-9 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 font-bold"
                  placeholder="1100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">交通費</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">¥</span>
                <input
                  name="transportation"
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-xl p-3 pl-9 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 font-bold"
                  placeholder="500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <input
                id="isMonthlyTransport"
                name="isMonthlyTransport"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="isMonthlyTransport" className="ml-3 block text-sm font-medium text-gray-800 cursor-pointer">
                交通費は月額（定期代）として支給する
              </label>
            </div>
            <p className="mt-2 text-[10px] font-black text-red-600 leading-tight">
              ⚠️月を跨いで設定すること！
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Link
              href="/employees"
              className="flex-1 text-center py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-200 ${
                isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isPending ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
