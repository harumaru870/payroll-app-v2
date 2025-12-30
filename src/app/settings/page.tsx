'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/app/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [settings, setSettings] = useState({ companyName: '', defaultBreakTime: 60, closingDate: 25 })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const result = await getSettings()
      if (result.success && result.data) {
        setSettings({
          companyName: result.data.companyName,
          defaultBreakTime: result.data.defaultBreakTime,
          closingDate: result.data.closingDate,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    
    const result = await updateSettings(formData)
    
    if (result.success) {
      setMessage('設定を保存しました')
      router.refresh()
    } else {
      alert(result.error)
    }
    setIsPending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-500 font-bold">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">システム設定</h1>
            <p className="text-gray-700 font-medium">アプリ全体の基本設定を変更します</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-bold">
            ← 戻る
          </Link>
        </div>

        <form action={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-8 border border-gray-100">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">会社名 / タイトル</label>
            <p className="text-xs text-gray-500 mb-2">給与明細書のヘッダーや画面タイトルに表示されます</p>
            <input
              name="companyName"
              type="text"
              required
              defaultValue={settings.companyName}
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-900 font-bold"
              placeholder="株式会社〇〇"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">デフォルト休憩時間 (分)</label>
              <input
                name="defaultBreakTime"
                type="number"
                required
                min="0"
                defaultValue={settings.defaultBreakTime}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">給与の締め日</label>
              <select
                name="closingDate"
                defaultValue={settings.closingDate}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 outline-none transition-all text-gray-900 font-bold bg-white"
              >
                <option value="0">末日締め</option>
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}日締め</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-4 rounded-xl text-white font-black text-lg transition-all shadow-lg active:scale-95 ${
                isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 shadow-gray-300'
              }`}
            >
              {isPending ? '保存中...' : '設定を保存する'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
