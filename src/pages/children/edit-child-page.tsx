import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../../components/ui/card'
import { Loader } from '../../components/ui/loader'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import {
  sanitizePhoneInput,
  validateChildForm,
  type ChildFormValues,
} from '../../features/children/child-form'
import {
  clearChildrenFeedback,
  clearCurrentChild,
  fetchChildById,
  updateChild,
} from '../../features/children/children-slice'
import { canManageChildren } from '../../features/children/children-permissions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { ChildFormCard } from './child-form-card'

export function EditChildPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { childId = '' } = useParams()
  const { profile } = useAuth()
  const status = useAppSelector((state) => state.children.status)
  const error = useAppSelector((state) => state.children.error)
  const current = useAppSelector((state) => state.children.current)

  useEffect(() => {
    dispatch(clearChildrenFeedback())
    dispatch(clearCurrentChild())
    void dispatch(fetchChildById(childId))

    return () => {
      dispatch(clearCurrentChild())
    }
  }, [childId, dispatch])

  if (!canManageChildren(profile)) {
    return <Navigate replace to="/children" />
  }

  if (status === 'loading' && !current) {
    return (
      <PageContainer>
        <Card className="flex min-h-[240px] items-center justify-center">
          <Loader label="Loading child record..." />
        </Card>
      </PageContainer>
    )
  }

  if (!current) {
    return (
      <PageContainer>
        <Card>
          <p className="text-sm text-slate-600">Child record could not be loaded.</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <EditChildFormContent
      childId={childId}
      child={current}
      error={error}
      isSubmitting={status === 'loading'}
      onSubmitSuccess={() => navigate(`/children/${childId}`)}
    />
  )
}

interface EditChildFormContentProps {
  childId: string
  child: {
    fullName: string
    dateOfBirth: string
    gender: ChildFormValues['gender']
    parentName: string
    parentPhone: string
    parentEmail: string
    address: string
    hospitalId: string
    notes: string
  }
  error: string | null
  isSubmitting: boolean
  onSubmitSuccess: () => void
}

function EditChildFormContent({
  child,
  childId,
  error,
  isSubmitting,
  onSubmitSuccess,
}: EditChildFormContentProps) {
  const dispatch = useAppDispatch()
  const [values, setValues] = useState<ChildFormValues>({
    fullName: child.fullName,
    dateOfBirth: child.dateOfBirth,
    gender: child.gender,
    parentName: child.parentName,
    parentPhone: child.parentPhone,
    parentEmail: child.parentEmail,
    address: child.address,
    hospitalId: child.hospitalId,
    notes: child.notes,
  })
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

    if (Object.keys(errors).length > 0) {
      return
    }

    const gender = values.gender

    if (!gender) {
      return
    }

    const result = await dispatch(
      updateChild({
        id: childId,
        data: {
          fullName: values.fullName.trim(),
          dateOfBirth: values.dateOfBirth,
          gender,
          parentName: values.parentName.trim(),
          parentEmail: values.parentEmail.trim().toLowerCase(),
          parentPhone: values.parentPhone.trim(),
          address: values.address.trim(),
          hospitalId: values.hospitalId.trim(),
          notes: values.notes.trim(),
        },
      }),
    )

    if (updateChild.fulfilled.match(result)) {
      onSubmitSuccess()
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Children"
        title="Edit child"
        description="Update a registered child profile and save changes to Firestore."
      />
      {error ? (
        <Card>
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        </Card>
      ) : null}
      <ChildFormCard
        values={values}
        errors={errors}
        isSubmitting={isSubmitting}
        submitLabel="Save changes"
        onChange={handleChange}
        onSubmit={(event) => void handleSubmit(event)}
      />
    </PageContainer>
  )
}
