import { getEmployees, deleteEmployee } from '@/app/actions'
import Link from 'next/link'

export default async function EmployeesPage() {
  const result = await getEmployees()
  const employees = result.success ? result.data : []

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">従業員管理</h1>
          <Link 
            href="/employees/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            新規登録
          </Link>
        </div>

        {employees?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-600 shadow-sm">
            従業員がまだ登録されていません
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">名前</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">メールアドレス</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">現在の時給</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {employees?.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ¥{employee.wages[0]?.hourlyWage?.toLocaleString() ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/employees/${employee.id}`}
                      className="text-blue-600 hover:text-blue-900 font-bold mr-4"
                    >
                      編集
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteEmployee(employee.id)
                    }} className="inline">
                      <button className="text-red-600 hover:text-red-800 font-bold">
                        削除
                      </button>
                    </form>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-8">
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium flex items-center">
            ← ホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
