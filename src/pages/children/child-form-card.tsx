import type { FormEvent } from 'react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { SelectField } from '../../components/ui/select-field'
import { Textarea } from '../../components/ui/textarea'
import type { ChildFormErrors, ChildFormValues } from '../../features/children/child-form'

interface ChildFormCardProps {
  values: ChildFormValues
  errors: ChildFormErrors
  isSubmitting: boolean
  submitLabel: string
  onChange: <TKey extends keyof ChildFormValues>(
    field: TKey,
    value: ChildFormValues[TKey],
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ChildFormCard({
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
  values,
}: ChildFormCardProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <div className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
        <p className="text-sm font-semibold text-slate-900">Registration details</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Keep names and contact information exactly as they should appear on clinic records and reminder messages.
        </p>
      </div>
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            id="child-full-name"
            name="fullName"
            label="Child full name"
            value={values.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            error={errors.fullName}
            hint="Use the full registered name for the child record."
          />
          <Input
            id="child-date-of-birth"
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            value={values.dateOfBirth}
            onChange={(event) => onChange('dateOfBirth', event.target.value)}
            error={errors.dateOfBirth}
          />
          <SelectField
            id="child-gender"
            name="gender"
            label="Gender"
            value={values.gender}
            onChange={(event) => onChange('gender', event.target.value as ChildFormValues['gender'])}
            error={errors.gender}
          >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
          </SelectField>
          <Input
            id="child-hospital-id"
            name="hospitalId"
            label="Hospital ID or card number"
            value={values.hospitalId}
            onChange={(event) => onChange('hospitalId', event.target.value)}
            error={errors.hospitalId}
            hint="This can be a hospital identifier, card number, or clinic reference."
          />
          <Input
            id="child-parent-name"
            name="parentName"
            label="Parent or guardian full name"
            value={values.parentName}
            onChange={(event) => onChange('parentName', event.target.value)}
            error={errors.parentName}
          />
          <Input
            id="child-parent-phone"
            name="parentPhone"
            label="Parent phone number"
            value={values.parentPhone}
            onChange={(event) => onChange('parentPhone', event.target.value)}
            error={errors.parentPhone}
            hint="Include a reachable phone number for SMS reminders."
            inputMode="tel"
          />
          <Input
            id="child-parent-email"
            name="parentEmail"
            label="Parent email"
            type="email"
            value={values.parentEmail}
            onChange={(event) => onChange('parentEmail', event.target.value)}
            error={errors.parentEmail}
            hint="Used for parent access and email reminders."
          />
          <Input
            id="child-address"
            name="address"
            label="Address"
            value={values.address}
            onChange={(event) => onChange('address', event.target.value)}
            error={errors.address}
          />
        </div>

        <Textarea
          id="child-notes"
          name="notes"
          label="Notes"
          rows={4}
          value={values.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Optional clinical or registration notes"
          hint="Add only the context the next staff member should see quickly."
        />

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
