const MS_PER_DAY = 1000 * 60 * 60 * 24

function resolveDate(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(value)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(value)
}

export function startOfDay(value: Date | string): Date {
  const date = resolveDate(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(value: Date | string, amount: number): Date {
  const date = startOfDay(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function toIsoDate(value: Date | string): string {
  const date = startOfDay(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function differenceInDays(target: Date | string, base: Date | string): number {
  const targetDay = startOfDay(target)
  const baseDay = startOfDay(base)
  return Math.round((targetDay.getTime() - baseDay.getTime()) / MS_PER_DAY)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(resolveDate(value))
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(resolveDate(value))
}

export function calculateAgeLabel(birthDate: string): string {
  const today = startOfDay(new Date())
  const birth = startOfDay(birthDate)
  const days = differenceInDays(today, birth)

  if (days < 31) {
    return `${days} days`
  }

  const months = Math.floor(days / 30.4)

  if (months < 24) {
    return `${months} months`
  }

  const years = Math.floor(months / 12)
  const remainderMonths = months % 12

  return remainderMonths === 0 ? `${years} years` : `${years}y ${remainderMonths}m`
}

export function formatRelativeDay(value: string): string {
  const days = differenceInDays(value, new Date())

  if (days === 0) {
    return 'Today'
  }

  if (days === 1) {
    return 'Tomorrow'
  }

  if (days === -1) {
    return 'Yesterday'
  }

  if (days > 1) {
    return `In ${days} days`
  }

  return `${Math.abs(days)} days ago`
}
