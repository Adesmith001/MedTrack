import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { Notice } from '../../components/ui/notice'
import {
  emptyChildFormValues,
  sanitizePhoneInput,
  validateChildForm,
  type ChildFormValues,
} from '../../features/children/child-form'
import {
  clearChildrenFeedback,
  clearCurrentChild,
  createChildWithSchedule,
} from '../../features/children/children-slice'
import { canManageChildren } from '../../features/children/children-permissions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { ChildFormCard } from './child-form-card'

export function AddChildPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const status = useAppSelector((state) => state.children.status)
  const error = useAppSelector((state) => state.children.error)
  const current = useAppSelector((state) => state.children.current)
  const [values, setValues] = useState<ChildFormValues>(emptyChildFormValues)

  useEffect(() => {
    dispatch(clearChildrenFeedback())
    dispatch(clearCurrentChild())
  }, [dispatch])

  if (!canManageChildren(profile)) {
    return <Navigate replace to="/children" />
  }

  const errors = validateChildForm(values)

  function handleChange<TKey extends keyof ChildFormValues>(
    field: TKey,
    value: ChildFormValues[TKey],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: field === 'parentPhone' ? sanitizePhoneInput(String(value)) : value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (Object.keys(errors).length > 0 || !user) {
      return
    }

    const gender = values.gender

    if (!gender) {
      return
    }

    const result = await dispatch(
      createChildWithSchedule({
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        gender,
        parentName: values.parentName.trim(),
        parentEmail: values.parentEmail.trim().toLowerCase(),
        parentPhone: values.parentPhone.trim(),
        address: values.address.trim(),
        hospitalId: values.hospitalId.trim(),
        notes: values.notes.trim(),
        createdBy: user.uid,
      }),
    )

    if (createChildWithSchedule.fulfilled.match(result)) {
      navigate(`/children/${result.payload.id}`)
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Children"
        title="Add child"
        description="Register a new child record, link it to a guardian account, and generate the initial immunization schedule."
      />
      {error ? (
        <Notice tone="error" title="Unable to save child record">
          {error}
        </Notice>
      ) : null}
      <ChildFormCard
        values={values}
        errors={errors}
        isSubmitting={status === 'loading' && !current}
        submitLabel="Save child record"
        onChange={handleChange}
        onSubmit={(event) => void handleSubmit(event)}
      />
    </PageContainer>
  )
}
