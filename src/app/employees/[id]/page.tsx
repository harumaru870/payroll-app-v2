'use client'

import { useState, useEffect } from 'react'
import { getEmployee, updateEmployee, addWageSetting } from '@/app/actions'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type WageSetting = {
  id: string
  hourlyWage: number
  transportation: number
  isMonthlyTransport: boolean
  effectiveFrom: Date
}

type Employee = {
  id: string
  name: string
  email: string
  wages: WageSetting[]
}

export default function EmployeeEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddingWage, setIsAddingWage] = useState(false)
  
  // フォーム状態
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function load() {
      const result = await getEmployee(id)
      if (result.success && result.data) {
        const emp = result.data as any
        setEmployee(emp)
        setName(emp.name)
        setEmail(emp.email)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleUpdateProfile = async (formData: FormData) => {
    setIsUpdating(true)
    formData.append('id', id)
    const result = await updateEmployee(formData)
    if (result.success) {
      router.refresh()
      alert('基本情報を更新しました')
    } else {
      alert(result.error)
    }
    setIsUpdating(false)
  }

  const handleAddWage = async (formData: FormData) => {
    setIsAddingWage(true)
    formData.append('userId', id)
    const result = await addWageSetting(formData)
    if (result.success) {
      // データを再取得して画面更新
      const updated = await getEmployee(id)
      if (updated.success && updated.data) {
        setEmployee(updated.data as any)
      }
      // フォームリセットは簡易的にreloadするか、controlled formにする
      (document.getElementById('wageForm') as HTMLFormElement).reset()
    } else {
      alert(result.error)
    }
    setIsAddingWage(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-500 font-bold">読み込み中...</div>
  if (!employee) return <div className="text-center py-20 text-red-500 font-bold">従業員が見つかりません</div>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900">従業員詳細・編集</h1>
          <Link href="/employees" className="text-blue-600 hover:text-blue-800 font-bold">
            ← 一覧へ戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左カラム: 基本情報 */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2">👤</span>
              基本情報
            </h2>
            <form action={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">氏名</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-900 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-900 focus:border-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                {isUpdating ? '更新中...' : '基本情報を更新'}
              </button>
            </form>
          </section>

          {/* 右カラム: 時給設定の追加 */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-2">💰</span>
              時給改定・設定追加
            </h2>
            <form id="wageForm" action={handleAddWage} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">適用開始日</label>
                <input
                  name="effectiveFrom"
                  type="date"
                  required
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-900 focus:border-green-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">新しい時給</label>
                  <input
                    name="hourlyWage"
                    type="number"
                    required
                    min="0"
                    placeholder="1200"
                    className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-900 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">交通費</label>
                  <input
                    name="transportation"
                    type="number"
                    min="0"
                    placeholder="500"
                    className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-900 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <input
                    id="isMonthlyTransport"
                    name="isMonthlyTransport"
                    type="checkbox"
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isMonthlyTransport" className="ml-3 block text-sm font-bold text-gray-700 cursor-pointer">
                    交通費は月額定期
                  </label>
                </div>
                <p className="mt-2 text-[10px] font-black text-red-600 leading-tight">
                  ⚠️月を跨いで設定すること！
                </p>
              </div>
              <button
                type="submit"
                disabled={isAddingWage}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                {isAddingWage ? '追加中...' : '新しい時給を追加'}
              </button>
            </form>
          </section>
        </div>

        {/* 下段: 時給履歴リスト */}
        <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6">時給・待遇の履歴</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase">
                  <th className="pb-3 font-bold">適用開始日</th>
                  <th className="pb-3 font-bold">時給</th>
                  <th className="pb-3 font-bold">交通費</th>
                  <th className="pb-3 font-bold">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  // 1. 日付の降順でソート
                  const sortedWages = [...employee.wages].sort((a, b) => 
                    new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
                  );

                  // 2. 「適用中」となるインデックスを探す（本日以前で最も新しいもの）
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const currentIndex = sortedWages.findIndex(wage => {
                    const effDate = new Date(wage.effectiveFrom);
                    effDate.setHours(0, 0, 0, 0);
                    return effDate <= today;
                  });

                  return sortedWages.map((wage, index) => {
                    let status = "";
                    let statusClass = "";

                    if (currentIndex === -1) {
                      // 全て未来の場合（通常ありえないが）
                      status = "適用予定";
                      statusClass = "bg-amber-100 text-amber-700";
                    } else if (index < currentIndex) {
                      status = "適用予定";
                      statusClass = "bg-amber-100 text-amber-700";
                    } else if (index === currentIndex) {
                      status = "適用中";
                      statusClass = "bg-blue-100 text-blue-700";
                    } else {
                      status = "過去";
                      statusClass = "bg-gray-100 text-gray-400";
                    }

                    return (
                      <tr key={wage.id} className={`group ${index === currentIndex ? 'bg-blue-50/50' : ''}`}>
                        <td className="py-4 font-bold text-gray-900">
                          {format(new Date(wage.effectiveFrom), 'yyyy年MM月dd日', { locale: ja })}
                        </td>
                        <td className="py-4 font-black text-lg text-gray-900">
                          ¥{wage.hourlyWage.toLocaleString()}
                        </td>
                        <td className="py-4 font-medium text-gray-600">
                          ¥{wage.transportation.toLocaleString()}
                          <span className="text-xs ml-1 text-gray-400">
                            {wage.isMonthlyTransport ? '(月額)' : '(日額)'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`${statusClass} px-3 py-1 rounded-full text-xs font-bold`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
