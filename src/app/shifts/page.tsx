import { getEmployees } from '@/app/actions'
import ShiftManager from '@/components/shifts/ShiftManager'
import Link from 'next/link'

export default async function ShiftsPage() {
  const result = await getEmployees()
  const employees = result.success ? result.data : []

  if (!employees) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* ヘッダー部分 */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">シフト管理</h1>
            <p className="text-sm text-gray-500">カレンダーから従業員のシフトを登録・編集します</p>
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
        {employees.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">従業員が登録されていません</h2>
            <p className="text-gray-500 mb-6">シフトを管理する前に、まず従業員を登録してください</p>
            <Link 
              href="/employees/new" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              従業員を登録する
            </Link>
          </div>
        ) : (
          <ShiftManager employees={employees} />
        )}
      </div>
    </main>
  )
}
