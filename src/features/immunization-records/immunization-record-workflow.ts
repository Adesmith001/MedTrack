export interface ImmunizationCompletionFormValues {
  dateAdministered: string
  notes: string
}

export type ImmunizationCompletionFormErrors = Partial<
  Record<keyof ImmunizationCompletionFormValues, string>
>

export const defaultImmunizationCompletionValues: ImmunizationCompletionFormValues = {
  dateAdministered: '',
  notes: '',
}

export function validateImmunizationCompletionForm(
  values: ImmunizationCompletionFormValues,
): ImmunizationCompletionFormErrors {
  const errors: ImmunizationCompletionFormErrors = {}

  if (!values.dateAdministered) {
    errors.dateAdministered = 'Date administered is required.'
  }

  return errors
}
