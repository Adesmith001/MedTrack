import { emptyChildFormValues, sanitizePhoneInput, validateChildForm } from './child-form'

describe('child-form', () => {
  it('sanitizes phone input without stripping a leading plus sign', () => {
    expect(sanitizePhoneInput('+234-801-234-5678')).toBe('+234-801-234-5678')
    expect(sanitizePhoneInput('0801abc2345678')).toBe('08012345678')
  })

  it('validates required child form fields', () => {
    expect(validateChildForm(emptyChildFormValues)).toEqual({
      fullName: 'Child full name is required.',
      dateOfBirth: 'Date of birth is required.',
      gender: 'Gender is required.',
      parentName: 'Parent or guardian name is required.',
      parentPhone: 'Parent phone number is required.',
      parentEmail: 'Parent email is required.',
      address: 'Address is required.',
      hospitalId: 'Hospital ID or card number is required.',
    })
  })
})
