import { EmployeeDetailsForm } from '#/components/EmployeeDetailsForm'
import { useSurveyFlow } from '#/features/survey-flow/survey-flow-context'

export function ProfileScreen() {
  const {
    profileForm,
    profileErrors,
    otherEntity,
    updateProfileField,
    handleOtherEntityChange,
    handleProfileSubmit,
    handleProfileBack,
  } = useSurveyFlow()

  return (
    <EmployeeDetailsForm
      profileForm={profileForm}
      profileErrors={profileErrors}
      otherEntity={otherEntity}
      onUpdateField={updateProfileField}
      onOtherEntityChange={handleOtherEntityChange}
      onSubmit={handleProfileSubmit}
      onBack={handleProfileBack}
    />
  )
}
