import type { FormEvent } from 'react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
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
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            id="child-full-name"
            name="fullName"
            label="Child full name"
            value={values.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            error={errors.fullName}
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
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Gender</span>
            <select
              id="child-gender"
              name="gender"
              value={values.gender}
              onChange={(event) => onChange('gender', event.target.value as ChildFormValues['gender'])}
              aria-invalid={Boolean(errors.gender)}
              aria-describedby={errors.gender ? 'child-gender-error' : undefined}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 ${
                errors.gender ? 'border-rose-400' : 'border-slate-200'
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender ? (
              <span id="child-gender-error" className="block text-xs text-rose-600">
                {errors.gender}
              </span>
            ) : null}
          </label>
          <Input
            id="child-hospital-id"
            name="hospitalId"
            label="Hospital ID or card number"
            value={values.hospitalId}
            onChange={(event) => onChange('hospitalId', event.target.value)}
            error={errors.hospitalId}
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
          />
          <Input
            id="child-parent-email"
            name="parentEmail"
            label="Parent email"
            type="email"
            value={values.parentEmail}
            onChange={(event) => onChange('parentEmail', event.target.value)}
            error={errors.parentEmail}
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

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            id="child-notes"
            name="notes"
            rows={4}
            value={values.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
            placeholder="Optional clinical or registration notes"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
