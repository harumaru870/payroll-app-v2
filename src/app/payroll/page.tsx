import PayrollList from '@/components/payroll/PayrollList'
import Link from 'next/link'

export default function PayrollPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* ヘッダー部分 */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">給与計算</h1>
            <p className="text-sm text-gray-500">月ごとの勤務実績から給与を自動計算します</p>
          </div>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium"
          >
            ← ホームへ戻る
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <PayrollList />
      </div>
    </main>
  )
}
