'use client'

import { useState, useEffect } from 'react'
import { calculateMonthlyPayroll, getSettings } from '@/app/actions'
import { PayrollResult } from '@/utils/payroll'
import { ChevronLeft, ChevronRight, FileText, Download, ChevronDown, ChevronUp, Moon } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { pdf } from '@react-pdf/renderer'
import PayslipDocument from './PayslipDocument'
import { formatTimeWithOver24 } from '@/utils/date'

type PayrollData = {
  employee: {
    id: string
    name: string
    email: string
  }
  payroll: PayrollResult | null
  error: string | null
}

export default function PayrollList() {
  const now = new Date()
  const [targetDate, setTargetDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('給与管理システム v2')
  const [periodInfo, setPeriodInfo] = useState({ start: '', end: '' })

  const fetchData = async () => {
    setLoading(true)
    
    const [payrollRes, settingsRes] = await Promise.all([
      calculateMonthlyPayroll(targetDate.getFullYear(), targetDate.getMonth() + 1),
      getSettings()
    ])

    if (payrollRes.success) {
      setPayrollData(payrollRes.data as PayrollData[])
    }

    if (settingsRes.success && settingsRes.data) {
      const { closingDate, companyName } = settingsRes.data
      setCompanyName(companyName)

      // 期間の計算表示
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1
      let start: Date, end: Date

      if (closingDate === 0) {
        start = new Date(year, month - 1, 1)
        end = new Date(year, month, 0)
      } else {
        start = new Date(year, month - 2, closingDate + 1)
        end = new Date(year, month - 1, closingDate)
      }
      setPeriodInfo({
        start: format(start, 'M/d'),
        end: format(end, 'M/d')
      })
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [targetDate])

  const changeMonth = (offset: number) => {
    setTargetDate(new Date(targetDate.getFullYear(), targetDate.getMonth() + offset, 1))
    setExpandedEmployeeId(null)
  }

  const toggleExpand = (id: string) => {
    setExpandedEmployeeId(expandedEmployeeId === id ? null : id)
  }

  const handleDownloadPDF = async (data: PayrollData) => {
    if (!data.payroll) return
    setDownloadingId(data.employee.id)
    
    try {
      // PDFを生成
      const doc = <PayslipDocument 
        year={targetDate.getFullYear()} 
        month={targetDate.getMonth() + 1} 
        employeeName={data.employee.name} 
        payroll={data.payroll} 
        companyName={companyName}
        periodDisplay={`${periodInfo.start} 〜 ${periodInfo.end}`}
      />
      const blob = await pdf(doc).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `給与明細_${targetDate.getFullYear()}${(targetDate.getMonth() + 1).toString().padStart(2, '0')}_${data.employee.name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDFの生成に失敗しました。')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 月選択ヘッダー */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            {targetDate.getFullYear()}年 {targetDate.getMonth() + 1}月 給与一覧
          </h2>
          {periodInfo.start && (
            <p className="text-sm font-bold text-blue-600 mt-1">
              集計期間: {periodInfo.start} 〜 {periodInfo.end}
            </p>
          )}
        </div>

        <button 
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">計算中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {payrollData.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold">
              計算可能な従業員データがありません
            </div>
          ) : (
            payrollData.map((data) => {
              const { employee, payroll, error } = data
              return (
              <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-5">
                      <div className="h-14 w-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-2xl border border-blue-200">
                        {employee.name[0]}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-xl">{employee.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{employee.email}</p>
                      </div>
                    </div>

                    {error ? (
                      <div className="text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                        {error}
                      </div>
                    ) : payroll ? (
                      <div className="flex flex-wrap items-center gap-8 md:gap-12 flex-1 justify-end">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">勤務日数</div>
                          <div className="text-xl font-black text-gray-900">{payroll.workDays}日</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">総勤務時間</div>
                          <div className="text-xl font-black text-gray-900">{payroll.totalHours}h</div>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">支給総額</div>
                          <div className="text-3xl font-black text-blue-600">
                            ¥{payroll.totalAmount.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleDownloadPDF(data)}
                            disabled={downloadingId === employee.id}
                            className={`p-2 rounded-lg transition-all ${
                              downloadingId === employee.id 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="PDFダウンロード"
                          >
                            <Download className={`w-6 h-6 ${downloadingId === employee.id ? 'animate-bounce' : ''}`} />
                          </button>
                          <button 
                            onClick={() => toggleExpand(employee.id)}
                            className={`p-2 rounded-lg transition-all ${
                              expandedEmployeeId === employee.id 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {expandedEmployeeId === employee.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 給与の内訳（概要） */}
                  {payroll && (
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      <div className="flex justify-between md:block bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500 font-bold block mb-1">基本給</span>
                        <span className="font-black text-gray-900 text-lg">¥{payroll.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between md:block bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500 font-bold block mb-1">内訳 (通常/深夜)</span>
                        <div className="font-bold text-gray-900">
                           <span className="text-gray-600">{(payroll.normalMinutes / 60).toFixed(1)}h</span>
                           <span className="mx-1 text-gray-400">/</span>
                           <span className="text-amber-600">{(payroll.nightMinutes / 60).toFixed(1)}h</span>
                        </div>
                      </div>
                      <div className="flex justify-between md:block bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500 font-bold block mb-1">交通費</span>
                        <span className="font-black text-gray-900 text-lg">¥{payroll.transportationCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 詳細（展開部分） */}
                {expandedEmployeeId === employee.id && payroll && (
                  <div className="bg-gray-50 border-t border-gray-200 p-6 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      勤務実績詳細
                    </h4>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">日付</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">勤務時間</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">休憩</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">実働</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-blue-600 uppercase">支給額</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-green-600 uppercase">交通費</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payroll.shifts.map((shift) => {
                            const workMinutes = (shift.endTime ? (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 60000 : 0) - shift.breakTime
                            const workHours = workMinutes > 0 ? (workMinutes / 60).toFixed(2) : '0.00'
                            const isOvernight = shift.endTime && !isSameDay(new Date(shift.startTime), new Date(shift.endTime))
                            
                            return (
                              <tr key={shift.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {format(new Date(shift.date), 'MM/dd (E)', { locale: ja })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                  <div className="flex items-center">
                                    {format(new Date(shift.startTime), 'HH:mm')} - {shift.endTime ? formatTimeWithOver24(new Date(shift.endTime), new Date(shift.startTime)) : '--:--'}
                                    {isOvernight && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200" title="日をまたぐ勤務">
                                        <Moon className="w-3 h-3 mr-1" />
                                        翌日
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {shift.breakTime}分
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                  {workHours}h
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-blue-600">
                                  ¥{shift.dailySalary.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                                  {shift.dailyTransport > 0 ? `¥${shift.dailyTransport.toLocaleString()}` : '-'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
