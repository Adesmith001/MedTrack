const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function startOfDay(value: Date | string): Date {
  const date = typeof value === 'string' ? parseIsoDate(value) : new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatIsoDate(value: Date): string {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(value: Date | string, days: number): Date {
  const result = startOfDay(value)
  result.setDate(result.getDate() + days)
  return result
}

export function differenceInDays(target: Date | string, base: Date | string): number {
  const targetDate = startOfDay(target)
  const baseDate = startOfDay(base)
  return Math.floor((targetDate.getTime() - baseDate.getTime()) / MILLISECONDS_PER_DAY)
}

export function formatDisplayDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseIsoDate(value))
}

export function getTodayIsoDate(): string {
  return formatIsoDate(startOfDay(new Date()))
}
