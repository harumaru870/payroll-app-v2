'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculatePayroll, PayrollResult } from '@/utils/payroll'
import { startOfDay, isBefore, isSameDay } from 'date-fns'

// 従業員一覧の取得
export async function getEmployees() {
  try {
    const employees = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        wages: {
          orderBy: { effectiveFrom: 'desc' },
          take: 1, // 最新の給与設定だけ取得
        },
      },
    })
    return { success: true, data: employees }
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return { success: false, error: '従業員データの取得に失敗しました' }
  }
}

// 従業員の新規登録
export async function createEmployee(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const hourlyWage = parseInt(formData.get('hourlyWage') as string)
  const transportation = parseInt(formData.get('transportation') as string) || 0
  const isMonthlyTransport = formData.get('isMonthlyTransport') === 'on'

  if (!name || !email || !hourlyWage) {
    return { success: false, error: '必須項目が入力されていません' }
  }

  try {
    // トランザクションで従業員と初期給与設定を同時に作成
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
        },
      })

      await tx.wageSetting.create({
        data: {
          userId: newUser.id,
          hourlyWage,
          transportation,
          isMonthlyTransport,
          effectiveFrom: new Date(), // 作成日を適用開始日とする
        },
      })
    })

    revalidatePath('/employees') // 画面を更新
    return { success: true }
  } catch (error) {
    console.error('Failed to create employee:', error)
    return { success: false, error: '従業員の登録に失敗しました（メールアドレスが重複している可能性があります）' }
  }
}

// 従業員詳細の取得
export async function getEmployee(id: string) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        wages: {
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    })
    return { success: true, data: employee }
  } catch (error) {
    console.error('Failed to fetch employee:', error)
    return { success: false, error: '従業員情報の取得に失敗しました' }
  }
}

// 従業員情報の更新
export async function updateEmployee(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email },
    })
    revalidatePath('/employees')
    revalidatePath(`/employees/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update employee:', error)
    return { success: false, error: '更新に失敗しました' }
  }
}

// 新しい時給設定（履歴）の追加
export async function addWageSetting(formData: FormData) {
  const userId = formData.get('userId') as string
  const hourlyWage = parseInt(formData.get('hourlyWage') as string)
  const transportation = parseInt(formData.get('transportation') as string) || 0
  const isMonthlyTransport = formData.get('isMonthlyTransport') === 'on'
  const effectiveFromStr = formData.get('effectiveFrom') as string

  if (!userId || !hourlyWage || !effectiveFromStr) {
    return { success: false, error: '必須項目が不足しています' }
  }

  try {
    await prisma.wageSetting.create({
      data: {
        userId,
        hourlyWage,
        transportation,
        isMonthlyTransport,
        effectiveFrom: new Date(effectiveFromStr),
      },
    })
    
    revalidatePath(`/employees/${userId}`)
    revalidatePath('/employees')
    return { success: true }
  } catch (error) {
    console.error('Failed to add wage setting:', error)
    return { success: false, error: '時給設定の追加に失敗しました' }
  }
}

// 従業員の削除
export async function deleteEmployee(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath('/employees')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return { success: false, error: '削除に失敗しました' }
  }
}

// シフトの登録
export async function createShift(formData: FormData) {
  const userId = formData.get('userId') as string
  const dateStr = formData.get('date') as string // YYYY-MM-DD
  const startTimeStr = formData.get('startTime') as string // HH:mm
  const endTimeStr = formData.get('endTime') as string // HH:mm
  const breakTime = parseInt(formData.get('breakTime') as string) || 0

  if (!userId || !dateStr || !startTimeStr || !endTimeStr) {
    return { success: false, error: '必須項目が入力されていません' }
  }

  try {
    const date = new Date(dateStr)
    
    // 開始時刻と終了時刻をDateオブジェクトに変換
    const startParts = startTimeStr.split(':')
    const endParts = endTimeStr.split(':')
    
    const startTime = new Date(date)
    startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0)

    // 終了時刻が開始時刻より前の場合は翌日とみなす（夜勤対応）
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1)
    }

    await prisma.shift.create({
      data: {
        userId,
        date,
        startTime,
        endTime,
        breakTime,
      },
    })

    revalidatePath('/shifts')
    return { success: true }
  } catch (error) {
    console.error('Failed to create shift:', error)
    return { success: false, error: 'シフトの登録に失敗しました' }
  }
}

// シフトの更新
export async function updateShift(formData: FormData) {
  const id = formData.get('id') as string
  const dateStr = formData.get('date') as string
  const startTimeStr = formData.get('startTime') as string
  const endTimeStr = formData.get('endTime') as string
  const breakTime = parseInt(formData.get('breakTime') as string) || 0

  if (!id || !dateStr || !startTimeStr || !endTimeStr) {
    return { success: false, error: '必須項目が入力されていません' }
  }

  try {
    const date = new Date(dateStr)
    
    const startParts = startTimeStr.split(':')
    const endParts = endTimeStr.split(':')
    
    const startTime = new Date(date)
    startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0)
    
    const endTime = new Date(date)
    endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0, 0)

    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1)
    }

    await prisma.shift.update({
      where: { id },
      data: {
        startTime,
        endTime,
        breakTime,
      },
    })

    revalidatePath('/shifts')
    return { success: true }
  } catch (error) {
    console.error('Failed to update shift:', error)
    return { success: false, error: 'シフトの更新に失敗しました' }
  }
}

// 指定した月のシフト一覧取得
export async function getShifts(year: number, month: number, userId?: string) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(userId ? { userId } : {}),
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { startTime: 'asc' },
    })
    return { success: true, data: shifts }
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    return { success: false, error: 'シフトの取得に失敗しました' }
  }
}

// シフトの削除
export async function deleteShift(id: string) {
  try {
    await prisma.shift.delete({
      where: { id },
    })
    revalidatePath('/shifts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete shift:', error)
    return { success: false, error: 'シフトの削除に失敗しました' }
  }
}

// 給与計算の実行（月次）
export async function calculateMonthlyPayroll(year: number, month: number) {
  try {
    const settingsRes = await getSettings()
    const closingDate = settingsRes.success && settingsRes.data ? settingsRes.data.closingDate : 0

    let startDate: Date
    let endDate: Date

    if (closingDate === 0) {
      // 末日締め
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      // 指定日締め（例: 25日締めなら 前月26日 〜 当月25日）
      startDate = new Date(year, month - 2, closingDate + 1)
      endDate = new Date(year, month - 1, closingDate, 23, 59, 59)
    }

    // 全従業員を取得
    const employees = await prisma.user.findMany({
      include: {
        wages: {
          orderBy: { effectiveFrom: 'desc' },
        },
        shifts: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    })

    // 各従業員の給与を計算
    const results = employees.map(employee => {
      if (!employee.wages || employee.wages.length === 0) {
        return {
          employee,
          payroll: null,
          error: '給与設定がありません'
        }
      }

      // シフトを適切な給与設定グループに割り当て
      const wageGroups = new Map<string, { wage: any, shifts: any[] }>()

      // 念のため日付順（新しい順）にソート
      const sortedWages = [...employee.wages].sort((a, b) => 
        new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
      )

      employee.shifts.forEach(shift => {
        const shiftDate = startOfDay(new Date(shift.date))
        
        // シフトの日付時点で有効な（開始日がシフト日以前で最新の）設定を探す
        const validWage = sortedWages.find(w => {
          const effectiveDate = startOfDay(new Date(w.effectiveFrom))
          return isBefore(effectiveDate, shiftDate) || isSameDay(effectiveDate, shiftDate)
        })
        
        // 有効な設定が見つからない場合は、最も古い設定を使う（救済措置）
        const targetWage = validWage || sortedWages[sortedWages.length - 1]
        
        if (!wageGroups.has(targetWage.id)) {
          wageGroups.set(targetWage.id, { wage: targetWage, shifts: [] })
        }
        wageGroups.get(targetWage.id)!.shifts.push(shift)
      })

      // グループごとに計算して合算
      let totalResult: any = {
        totalMinutes: 0,
        totalHours: 0,
        normalMinutes: 0,
        nightMinutes: 0,
        workDays: 0,
        baseSalary: 0,
        transportationCost: 0,
        totalAmount: 0,
        shifts: []
      }

      wageGroups.forEach(({ wage, shifts }) => {
        const result = calculatePayroll(shifts, {
          hourlyWage: wage.hourlyWage,
          transportation: wage.transportation,
          isMonthlyTransport: wage.isMonthlyTransport,
        })

        totalResult.totalMinutes += result.totalMinutes
        totalResult.normalMinutes += result.normalMinutes
        totalResult.nightMinutes += result.nightMinutes
        totalResult.workDays += result.workDays
        totalResult.baseSalary += result.baseSalary
        totalResult.transportationCost += result.transportationCost
        totalResult.shifts.push(...result.shifts)
      })

      totalResult.totalAmount = totalResult.baseSalary + totalResult.transportationCost
      totalResult.totalHours = Number((totalResult.totalMinutes / 60).toFixed(2))
      totalResult.shifts.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

      return {
        employee,
        payroll: totalResult,
        error: null
      }
    })

    revalidatePath('/payroll')
    return { success: true, data: results }
  } catch (error) {
    console.error('Failed to calculate payroll:', error)
    return { success: false, error: '給与計算に失敗しました' }
  }
}

// 設定の取得
export async function getSettings() {
  try {
    let settings = await prisma.systemSetting.findFirst()
    
    // 設定がまだなければ作成
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          companyName: '給与管理システム v2',
          defaultBreakTime: 60,
          closingDate: 25,
        },
      })
    }
    
    return { success: true, data: settings }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return { success: false, error: '設定の取得に失敗しました' }
  }
}

// 設定の更新
export async function updateSettings(formData: FormData) {
  console.log('--- updateSettings start ---')
  const companyName = formData.get('companyName') as string
  const defaultBreakTimeStr = formData.get('defaultBreakTime') as string
  const closingDateStr = formData.get('closingDate') as string

  console.log('Received values:', { companyName, defaultBreakTimeStr, closingDateStr })

  if (!companyName || !defaultBreakTimeStr || !closingDateStr) {
    console.error('Validation failed: Missing fields')
    return { success: false, error: '必須項目が入力されていません' }
  }

  const defaultBreakTime = parseInt(defaultBreakTimeStr)
  const closingDate = parseInt(closingDateStr)

  if (isNaN(defaultBreakTime) || isNaN(closingDate)) {
    console.error('Validation failed: NaN values', { defaultBreakTime, closingDate })
    return { success: false, error: '数値の形式が正しくありません' }
  }

  try {
    const current = await prisma.systemSetting.findFirst()
    console.log('Current setting in DB:', current)
    
    if (current) {
      await prisma.systemSetting.update({
        where: { id: current.id },
        data: {
          companyName,
          defaultBreakTime,
          closingDate,
        },
      })
      console.log('Setting updated successfully')
    } else {
      await prisma.systemSetting.create({
        data: {
          companyName,
          defaultBreakTime,
          closingDate,
        },
      })
      console.log('Setting created successfully')
    }
    
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Database error in updateSettings:', error)
    return { success: false, error: 'データベースの保存に失敗しました' }
  } finally {
    console.log('--- updateSettings end ---')
  }
}
