import { differenceInHours, differenceInMinutes, startOfDay, addDays } from 'date-fns'

/**
 * 日付をまたぐ時間を考慮して時刻をフォーマットする
 * 例: 基準日が 1/1 で、対象日時が 1/2 02:00 の場合 -> "26:00" を返す
 */
export function formatTimeWithOver24(targetDate: Date, baseDate: Date): string {
  const target = new Date(targetDate)
  const base = startOfDay(new Date(baseDate))
  
  // 基準日の翌日以降かどうか判定
  const diffHours = differenceInHours(target, base)
  
  // 24時間未満なら普通のHH:mm
  if (diffHours < 24) {
    const h = target.getHours().toString().padStart(2, '0')
    const m = target.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
  
  // 24時間以上なら時間を加算
  // 正確には base からの経過時間を使う
  const totalMinutes = differenceInMinutes(target, base)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}
