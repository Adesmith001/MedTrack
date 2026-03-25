import type { ChildGender } from '../../types/models'

export interface ChildFormValues {
  fullName: string
  dateOfBirth: string
  gender: ChildGender | ''
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  hospitalId: string
  notes: string
}

export type ChildFormErrors = Partial<Record<keyof ChildFormValues, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9\s()-]{7,20}$/

export const emptyChildFormValues: ChildFormValues = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  address: '',
  hospitalId: '',
  notes: '',
}

export function sanitizePhoneInput(value: string): string {
  if (!value) {
    return ''
  }

  const trimmed = value.replace(/[^\d+\s()-]/g, '')
  const firstPlusIndex = trimmed.indexOf('+')

  if (firstPlusIndex <= 0) {
    return trimmed
  }

  return trimmed.replace(/\+/g, '')
}

export function validateChildForm(values: ChildFormValues): ChildFormErrors {
  const errors: ChildFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Child full name is required.'
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.'
  }

  if (!values.gender) {
    errors.gender = 'Gender is required.'
  }

  if (!values.parentName.trim()) {
    errors.parentName = 'Parent or guardian name is required.'
  }

  if (!values.parentPhone.trim()) {
    errors.parentPhone = 'Parent phone number is required.'
  } else if (!phonePattern.test(values.parentPhone.trim())) {
    errors.parentPhone = 'Enter a valid phone number.'
  }

  if (!values.parentEmail.trim()) {
    errors.parentEmail = 'Parent email is required.'
  } else if (!emailPattern.test(values.parentEmail.trim())) {
    errors.parentEmail = 'Enter a valid email address.'
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required.'
  }

  if (!values.hospitalId.trim()) {
    errors.hospitalId = 'Hospital ID or card number is required.'
  }

  return errors
}
