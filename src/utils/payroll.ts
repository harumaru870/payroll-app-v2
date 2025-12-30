import { differenceInMinutes, addDays, startOfDay, isBefore, isAfter } from 'date-fns'

type ShiftData = {
  id: string
  date: Date
  startTime: Date
  endTime: Date | null
  breakTime: number
  dailySalary: number      // 追加: その日の給与
  dailyTransport: number   // 追加: その日の交通費
}

type WageData = {
  hourlyWage: number
  transportation: number
  isMonthlyTransport: boolean
}

export type PayrollResult = {
  totalMinutes: number     // 総勤務時間（分）
  totalHours: number       // 総勤務時間（時間・小数）
  normalMinutes: number    // 通常勤務時間（分）
  nightMinutes: number     // 深夜勤務時間（分）
  workDays: number         // 出勤日数
  baseSalary: number       // 基本給（通常 + 深夜割増）
  transportationCost: number // 交通費
  totalAmount: number      // 総支給額
  shifts: ShiftData[]      // 計算に使ったシフトデータ
}

// 深夜時間帯の定義（22:00 ~ 翌5:00）
const NIGHT_START_HOUR = 22
const NIGHT_END_HOUR = 5

export function calculatePayroll(shifts: any[], wage: WageData): PayrollResult {
  let totalMinutes = 0
  let normalMinutes = 0
  let nightMinutes = 0
  const processedShifts: ShiftData[] = []
  
  shifts.forEach(shift => {
    if (!shift.endTime) return

    const start = new Date(shift.startTime)
    const end = new Date(shift.endTime)
    
    let grossMinutes = differenceInMinutes(end, start)
    if (grossMinutes <= 0) return

    let currentNightMinutes = 0
    let currentCheck = new Date(start)

    while (isBefore(currentCheck, end)) {
      const hour = currentCheck.getHours()
      if (hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR) {
        currentNightMinutes++
      }
      currentCheck.setMinutes(currentCheck.getMinutes() + 1)
    }

    const netMinutes = Math.max(0, grossMinutes - shift.breakTime)
    const validNightMinutes = Math.min(currentNightMinutes, netMinutes)
    const validNormalMinutes = netMinutes - validNightMinutes

    // --- 日ごとの金額計算 ---
    const dailyNormalSalary = (validNormalMinutes / 60) * wage.hourlyWage
    const dailyNightSalary = (validNightMinutes / 60) * wage.hourlyWage * 1.25
    const dailySalary = Math.floor(dailyNormalSalary + dailyNightSalary)
    
    // 交通費（月額定期の場合はここでは0、最後に一括計上。日額の場合はここで計上）
    const dailyTransport = wage.isMonthlyTransport ? 0 : wage.transportation

    processedShifts.push({
      ...shift,
      dailySalary,
      dailyTransport
    })

    totalMinutes += netMinutes
    nightMinutes += validNightMinutes
    normalMinutes += validNormalMinutes
  })

  const baseSalary = Math.floor((normalMinutes / 60) * wage.hourlyWage) + Math.floor((nightMinutes / 60) * wage.hourlyWage * 1.25)
  const totalHours = Number((totalMinutes / 60).toFixed(2))

  const workDays = processedShifts.length
  let transportationCost = 0

  if (wage.isMonthlyTransport) {
    transportationCost = wage.transportation
  } else {
    transportationCost = workDays * wage.transportation
  }

  const totalAmount = baseSalary + transportationCost

  return {
    totalMinutes,
    totalHours,
    normalMinutes,
    nightMinutes,
    workDays,
    baseSalary,
    transportationCost,
    totalAmount,
    shifts: processedShifts
  }
}
