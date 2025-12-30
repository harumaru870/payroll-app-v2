import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            給与管理システム v2
          </h1>
          <p className="text-xl text-gray-600">
            従業員の勤怠管理から給与計算、明細発行までを効率化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 従業員管理カード */}
          <Link 
            href="/employees"
            className="group block p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              従業員管理
            </h2>
            <p className="mt-2 text-gray-500">
              従業員の登録、情報の確認、時給設定などを行います。
            </p>
          </Link>

          {/* シフト管理カード */}
          <Link 
            href="/shifts"
            className="group block p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              シフト管理
            </h2>
            <p className="mt-2 text-gray-500">
              カレンダー形式で従業員のシフトを登録・編集します。
            </p>
          </Link>

          {/* 給与計算カード */}
          <Link 
            href="/payroll"
            className="group block p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-amber-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
              給与計算
            </h2>
            <p className="mt-2 text-gray-500">
              月ごとの給与計算を行い、明細書を作成します。
            </p>
          </Link>

          {/* 設定カード */}
          <Link 
            href="/settings"
            className="group block p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-gray-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
              設定
            </h2>
            <p className="mt-2 text-gray-500">
              会社名の設定やデフォルト値の管理を行います。
            </p>
          </Link>
        </div>

        <div className="mt-16 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            システム稼働状況
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Database (Supabase): 接続済み
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              ORM (Prisma): 設定済み
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              機能実装: 従業員・シフト・給与・PDF・設定 (完了)
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}