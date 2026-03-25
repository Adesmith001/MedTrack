function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export interface ReminderEmailTemplateInput {
  childName: string
  vaccineName: string
  dueDate: string
  clinicName: string
  reminderMessage: string
  parentName: string
}

export interface ReminderEmailTemplate {
  subject: string
  html: string
  text: string
}

export function buildReminderEmailTemplate(
  input: ReminderEmailTemplateInput,
): ReminderEmailTemplate {
  const dueDateLabel = formatDisplayDate(input.dueDate)
  const subject = `MedTrack reminder: ${input.vaccineName} due on ${dueDateLabel}`
  const greeting = input.parentName ? `Hello ${input.parentName},` : 'Hello,'
  const html = `
    <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#0f766e;">MedTrack reminder</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${input.vaccineName} is coming up soon</h1>
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">${greeting}</p>
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">
          This is a reminder that <strong>${input.childName}</strong> is scheduled for
          <strong> ${input.vaccineName}</strong> on <strong>${dueDateLabel}</strong>.
        </p>
        <div style="margin:24px 0;padding:20px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;">
          <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Clinic</p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">${input.clinicName}</p>
          <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Reminder</p>
          <p style="margin:0;font-size:16px;line-height:1.6;color:#334155;">${input.reminderMessage}</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
          Please contact your clinic if you need to confirm availability or update appointment information.
        </p>
      </div>
    </div>
  `.trim()
  const text = [
    greeting,
    '',
    `${input.childName} is scheduled for ${input.vaccineName} on ${dueDateLabel}.`,
    `Clinic: ${input.clinicName}`,
    `Reminder: ${input.reminderMessage}`,
    '',
    'Please contact your clinic if you need to confirm availability or update appointment information.',
  ].join('\n')

  return {
    subject,
    html,
    text,
  }
}
