'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { PayrollResult } from '@/utils/payroll'

// 日本語フォントを登録
Font.register({
  family: 'Noto Sans JP',
  fonts: [
    {
      src: '/fonts/NotoSansJP-Regular.woff',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/NotoSansJP-Bold.woff',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans JP',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  periodInfo: {
    alignItems: 'flex-end',
  },
  periodText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  dateRange: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeBox: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  employeeLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 25,
  },
  summarySection: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  itemLabel: {
    fontSize: 10,
    color: '#4B5563',
  },
  itemValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCol: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  tableCol: {
    fontSize: 9,
    color: '#1F2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  }
})

type Props = {
  year: number
  month: number
  employeeName: string
  payroll: PayrollResult
  companyName: string
  periodDisplay: string
}

export default function PayslipDocument({ year, month, employeeName, payroll, companyName, periodDisplay }: Props) {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}時間${m > 0 ? ` ${m}分` : ''}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.title}>給与明細書</Text>
          </View>
          <View style={styles.periodInfo}>
            <Text style={styles.periodText}>{year}年 {month}月 分</Text>
            <Text style={styles.dateRange}>対象期間: {periodDisplay}</Text>
          </View>
        </View>

        {/* 従業員情報 */}
        <View style={styles.employeeBox}>
          <Text style={styles.employeeLabel}>従業員氏名</Text>
          <Text style={styles.employeeName}>{employeeName} 殿</Text>
        </View>

        {/* 支給サマリー */}
        <View style={styles.summaryContainer}>
          {/* 左カラム：勤怠実績 */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>勤怠実績</Text>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>出勤日数</Text>
              <Text style={styles.itemValue}>{payroll.workDays} 日</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>通常労働時間</Text>
              <Text style={styles.itemValue}>{formatTime(payroll.normalMinutes)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>深夜労働時間</Text>
              <Text style={styles.itemValue}>{formatTime(payroll.nightMinutes)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>総実働時間</Text>
              <Text style={styles.itemValue}>{formatTime(payroll.totalMinutes)}</Text>
            </View>
          </View>

          {/* 右カラム：支給明細 */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>支給明細</Text>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>基本給（通常分）</Text>
              <Text style={styles.itemValue}>¥{Math.floor((payroll.normalMinutes / 60) * (payroll.baseSalary / (payroll.totalMinutes/60 || 1))).toLocaleString()}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>基本給（深夜割増込）</Text>
              <Text style={styles.itemValue}>¥{payroll.baseSalary.toLocaleString()}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>交通費</Text>
              <Text style={styles.itemValue}>¥{payroll.transportationCost.toLocaleString()}</Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>支給総額</Text>
              <Text style={styles.totalValue}>¥{payroll.totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>
        
        {/* 勤務明細詳細テーブル */}
        <View>
          <Text style={[styles.sectionTitle, { color: '#6B7280', borderBottomColor: '#F3F4F6' }]}>勤務明細詳細</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCol, { width: '12%' }]}>日付</Text>
            <Text style={[styles.tableHeaderCol, { width: '24%' }]}>勤務時間</Text>
            <Text style={[styles.tableHeaderCol, { width: '10%', textAlign: 'right' }]}>休憩</Text>
            <Text style={[styles.tableHeaderCol, { width: '10%', textAlign: 'right' }]}>実働</Text>
            <Text style={[styles.tableHeaderCol, { width: '14%', textAlign: 'right' }]}>給与</Text>
            <Text style={[styles.tableHeaderCol, { width: '14%', textAlign: 'right' }]}>交通費</Text>
            <Text style={[styles.tableHeaderCol, { width: '16%', textAlign: 'right' }]}>計</Text>
          </View>
          
          {payroll.shifts.map((shift, index) => {
             const workMin = (shift.endTime ? (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 60000 : 0) - shift.breakTime
             const totalDaily = shift.dailySalary + shift.dailyTransport
             return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCol, { width: '12%' }]}>{format(new Date(shift.date), 'MM/dd')}</Text>
                <Text style={[styles.tableCol, { width: '24%' }]}>
                  {format(new Date(shift.startTime), 'HH:mm')}-{shift.endTime ? format(new Date(shift.endTime), 'HH:mm') : ''}
                </Text>
                <Text style={[styles.tableCol, { width: '10%', textAlign: 'right' }]}>{shift.breakTime}m</Text>
                <Text style={[styles.tableCol, { width: '10%', textAlign: 'right' }]}>{(workMin / 60).toFixed(1)}h</Text>
                <Text style={[styles.tableCol, { width: '14%', textAlign: 'right' }]}>¥{shift.dailySalary.toLocaleString()}</Text>
                <Text style={[styles.tableCol, { width: '14%', textAlign: 'right' }]}>{shift.dailyTransport > 0 ? `¥${shift.dailyTransport.toLocaleString()}` : '-'}</Text>
                <Text style={[styles.tableCol, { width: '16%', textAlign: 'right', fontWeight: 'bold' }]}>¥{totalDaily.toLocaleString()}</Text>
              </View>
            )
          })}
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text>発行日: {format(new Date(), 'yyyy/MM/dd')} | この明細書は「{companyName}」給与システムによって自動生成されました。</Text>
        </View>

      </Page>
    </Document>
  )
}