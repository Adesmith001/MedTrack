function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day))
}

export interface ReminderSmsTemplateInput {
  childName: string
  vaccineName: string
  dueDate: string
  clinicName: string
}

export function buildReminderSmsMessage(input: ReminderSmsTemplateInput): string {
  const dateLabel = formatDisplayDate(input.dueDate)
  const base = `MedTrack: ${input.childName} is due for ${input.vaccineName} on ${dateLabel}.`
  const clinicSuffix = input.clinicName ? ` ${input.clinicName}.` : ''
  const withClinic = `${base}${clinicSuffix}`.trim()

  if (withClinic.length <= 160) {
    return withClinic
  }

  return base
}
