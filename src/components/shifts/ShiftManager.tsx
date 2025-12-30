'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format, addMinutes, subMinutes } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createShift, updateShift, deleteShift, getShifts, getSettings } from '@/app/actions'
import { Trash2, Clock, User as UserIcon, Edit2, X, Plus, Minus, AlertTriangle } from 'lucide-react'
import { formatTimeWithOver24 } from '@/utils/date'

type Employee = {
  id: string
  name: string
}

type Shift = {
  id: string
  userId: string
  date: Date
  startTime: Date
  endTime: Date | null
  breakTime: number
  user: { name: string }
}

export default function ShiftManager({ employees }: { employees: Employee[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isPending, setIsPending] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)

  // フォームの状態管理（時間操作のため）
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("18:00")
  const [breakTime, setBreakTime] = useState(60)
  const [defaultBreakTime, setDefaultBreakTime] = useState(60)
  
  // シフト一覧のフィルター用
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all')

  // シフトデータの取得
  const fetchShifts = async () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1
    
    // シフトと設定を並列で取得
    const [shiftsRes, settingsRes] = await Promise.all([
      getShifts(year, month),
      getSettings()
    ])

    if (shiftsRes.success) {
      const formattedShifts = (shiftsRes.data as any[]).map(s => ({
        ...s,
        date: new Date(s.date),
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : null
      }))
      setShifts(formattedShifts)
    }

    if (settingsRes.success && settingsRes.data) {
      setDefaultBreakTime(settingsRes.data.defaultBreakTime)
      if (!editingShift) {
        setBreakTime(settingsRes.data.defaultBreakTime)
      }
    }
  }

  useEffect(() => {
    fetchShifts()
  }, [selectedDate])

  // 編集モードのリセット（日付や従業員が変わったら）
  useEffect(() => {
    if (!editingShift) {
      // デフォルト値に戻す
      setStartTime("09:00")
      setEndTime("18:00")
      setBreakTime(defaultBreakTime)
    }
  }, [selectedDate, selectedEmployeeId, editingShift, defaultBreakTime])

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    // 状態管理している値をFormDataにセット
    formData.set('startTime', startTime)
    formData.set('endTime', endTime)
    formData.set('breakTime', breakTime.toString())

    let result
    if (editingShift) {
      formData.append('id', editingShift.id)
      result = await updateShift(formData)
    } else {
      result = await createShift(formData)
    }

    if (result.success) {
      fetchShifts()
      setEditingShift(null)
    } else {
      alert(result.error)
    }
    setIsPending(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このシフトを削除しますか？')) return
    const result = await deleteShift(id)
    if (result.success) {
      fetchShifts()
      if (editingShift?.id === id) setEditingShift(null)
    }
  }

  const startEdit = (shift: Shift) => {
    setEditingShift(shift)
    setSelectedDate(shift.date)
    setSelectedEmployeeId(shift.userId)
    setStartTime(format(shift.startTime, 'HH:mm'))
    setEndTime(shift.endTime ? format(shift.endTime, 'HH:mm') : "18:00")
    setBreakTime(shift.breakTime)
  }

  const cancelEdit = () => {
    setEditingShift(null)
  }

  // 時間を調整する関数
  const adjustTime = (type: 'start' | 'end', amount: number) => {
    const baseTimeStr = type === 'start' ? startTime : endTime
    const [hours, minutes] = baseTimeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    
    const newDate = amount > 0 ? addMinutes(date, amount) : subMinutes(date, Math.abs(amount))
    const newTimeStr = format(newDate, 'HH:mm')

    if (type === 'start') setStartTime(newTimeStr)
    else setEndTime(newTimeStr)
  }

  // カレンダーの日付セルをカスタマイズ
  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const hasShift = shifts.some(s => 
        s.date.getFullYear() === date.getFullYear() &&
        s.date.getMonth() === date.getMonth() &&
        s.date.getDate() === date.getDate() &&
        s.userId === selectedEmployeeId
      )
      if (hasShift) {
        return 'has-shift-tile'
      }
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 左側: カレンダー */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="calendar-container">
            <Calendar
              onChange={(val) => setSelectedDate(val as Date)}
              value={selectedDate}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setSelectedDate(activeStartDate)
              }}
              locale="ja-JP"
              calendarType="gregory"
              tileClassName={tileClassName}
              className="w-full border-none"
            />
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 flex items-center justify-center font-medium">
            <span className="w-3 h-3 rounded-full bg-blue-200 mr-2 border border-blue-300"></span>
            <span>青色の背景はシフト登録済みの日付です</span>
          </div>
        </div>

        {/* シフト登録・編集フォーム */}
        <div className={`bg-white p-6 rounded-xl shadow-md border-2 transition-all ${editingShift ? 'border-amber-400 bg-amber-50' : 'border-gray-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
              {editingShift ? (
                <>
                  <Edit2 className="w-6 h-6 mr-2 text-amber-600" />
                  シフトを編集
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  シフト登録
                </>
              )}
            </h3>
            {editingShift && (
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-800 p-1 hover:bg-amber-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="text-md font-bold text-gray-800 mb-6 border-b-2 border-gray-100 pb-3 flex items-center">
             <div className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-3 text-sm">
               {format(selectedDate, 'd')}
             </div>
             {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}
          </div>

          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="date" value={format(selectedDate, 'yyyy-MM-dd')} />
            
            {/* 従業員選択（ここに移動） */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">従業員</label>
              <select 
                name="userId"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors font-bold text-gray-900 bg-white"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-4">
              {/* 開始時間 */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">開始時間</label>
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => adjustTime('start', -30)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Minus className="w-4 h-4" /></button>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required 
                    className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-center text-lg bg-white font-black text-gray-900 focus:border-blue-500 outline-none" 
                  />
                  <button type="button" onClick={() => adjustTime('start', 30)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* 終了時間 */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">終了時間</label>
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => adjustTime('end', -30)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Minus className="w-4 h-4" /></button>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required 
                    className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-center text-lg bg-white font-black text-gray-900 focus:border-blue-500 outline-none" 
                  />
                  <button type="button" onClick={() => adjustTime('end', 30)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
                </div>
                {/* 翌日警告 */}
                {startTime && endTime && startTime > endTime && (
                  <div className="mt-2 p-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg flex items-start border border-amber-200 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>
                      終了時刻が開始時刻より前です。<br/>
                      翌日の {endTime} (26時表記など) として登録されます。
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">休憩時間 (分)</label>
              <div className="flex items-center space-x-2">
                 <button type="button" onClick={() => setBreakTime(Math.max(0, breakTime - 15))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Minus className="w-4 h-4" /></button>
                 <input 
                  type="number" 
                  value={breakTime}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                  min="0" 
                  className="flex-1 border-2 border-gray-200 rounded-xl p-3 text-center text-lg bg-white font-black text-gray-900 focus:border-blue-500 outline-none" 
                />
                 <button type="button" onClick={() => setBreakTime(breakTime + 15)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !selectedEmployeeId}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:bg-gray-300 active:scale-95 text-lg ${
                editingShift ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isPending ? '処理中...' : (editingShift ? 'シフトを更新する' : 'シフトを登録する')}
            </button>
          </form>
        </div>
      </div>

      {/* 右側: 選択日のシフト一覧と月間履歴 */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <span className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-green-600" />
                登録済みシフト一覧 ({format(selectedDate, 'yyyy年M月')})
              </span>
            </h3>
            
            {/* フィルタードロップダウン */}
            <div className="flex items-center">
               <span className="text-xs font-bold text-gray-500 mr-2 uppercase">絞り込み:</span>
               <select
                 value={filterEmployeeId}
                 onChange={(e) => setFilterEmployeeId(e.target.value)}
                 className="border-2 border-gray-200 rounded-lg p-2 text-sm font-bold text-gray-800 outline-none focus:border-green-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
               >
                 <option value="all">全員を表示</option>
                 {employees.map(emp => (
                   <option key={emp.id} value={emp.id}>{emp.name}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="space-y-3">
            {shifts
              .filter(shift => filterEmployeeId === 'all' || shift.userId === filterEmployeeId)
              .length === 0 ? (
              <div className="text-center py-24 text-gray-500 font-medium">
                {filterEmployeeId === 'all' ? 'この月のシフトはまだありません' : 'この従業員のシフトはまだありません'}
              </div>
            ) : (
              shifts
                .filter(shift => filterEmployeeId === 'all' || shift.userId === filterEmployeeId)
                .map((shift) => (
                <div 
                  key={shift.id} 
                  onClick={() => startEdit(shift)}
                  className={`flex items-center justify-between p-5 rounded-2xl transition-all border-2 cursor-pointer shadow-sm hover:shadow-md ${
                    editingShift?.id === shift.id 
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' 
                      : 'bg-white border-gray-100 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-5">
                    <div className={`text-center px-4 py-2 bg-gray-50 rounded-xl border-2 min-w-[70px] ${
                       editingShift?.id === shift.id ? 'border-amber-200' : 'border-gray-100'
                    }`}>
                      <div className="text-xs text-gray-600 font-black uppercase">{format(shift.date, 'E', { locale: ja })}</div>
                      <div className="text-xl font-black text-gray-900">{format(shift.date, 'd')}</div>
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-lg mb-1">{shift.user.name}</div>
                      <div className="text-sm text-gray-700 flex items-center font-bold">
                        <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                        {format(shift.startTime, 'HH:mm')} 〜 {shift.endTime ? formatTimeWithOver24(shift.endTime, shift.startTime) : '--:--'}
                        <span className="ml-3 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-[11px] border border-gray-200">
                          休憩 {shift.breakTime}分
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(shift); }}
                      className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-all"
                      title="編集"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(shift.id); }}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-all"
                      title="削除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .calendar-container .react-calendar__tile {
          height: 60px; /* タイルを高くして押しやすく */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: bold;
          position: relative;
          z-index: 1;
        }
        /* 選択中の日の基本スタイル */
        .calendar-container .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
          border-radius: 12px;
          font-weight: 900;
        }
        .calendar-container .react-calendar__tile--now {
          background: #eff6ff;
          border-radius: 12px;
          color: #2563eb;
          font-weight: 900;
        }
        .calendar-container .react-calendar__tile:hover {
          background-color: #f3f4f6;
          border-radius: 12px;
        }
        .calendar-container .react-calendar__navigation button {
          font-size: 1.2rem;
          font-weight: bold;
          padding: 1rem;
        }
        .calendar-container .react-calendar__navigation button:hover {
          background-color: #f3f4f6;
          border-radius: 12px;
        }
        /* シフトがある日のスタイル */
        .has-shift-tile {
          background-color: #dbeafe !important;
          color: #1e40af !important;
          border-radius: 12px;
        }
        .has-shift-tile:hover {
          background-color: #bfdbfe !important;
        }
        /* 選択中かつシフトがある日は選択スタイルを優先 */
        .calendar-container .react-calendar__tile--active.has-shift-tile {
          background: #2563eb !important;
          color: white !important;
          font-weight: 900;
        }
      `}</style>
    </div>
  )
}
