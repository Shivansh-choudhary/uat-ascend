import type { UserData } from '#/store/assessment-store'

export type ProfileErrors = Partial<Record<keyof UserData | 'otherEntity', string>>

export function normalizeUserData(value: UserData, otherEntity: string): UserData {
  const normalizedOtherEntity = otherEntity.trim()

  return {
    employeeCode: value.employeeCode.trim(),
    name: value.name.trim(),
    email: value.email.trim().toLowerCase(),
    Department: value.Department.trim(),
    Designation: value.Designation.trim(),
    entity:
      value.entity.trim() === 'Other' ? normalizedOtherEntity : value.entity.trim(),
  }
}

export function validateUserData(value: UserData, otherEntity: string): ProfileErrors {
  const normalized = normalizeUserData(value, otherEntity)
  const errors: ProfileErrors = {}

  if (!normalized.employeeCode) {
    errors.employeeCode = 'Employee code is required.'
  }
  if (!normalized.name) {
    errors.name = 'Employee name is required.'
  }
  if (!normalized.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!normalized.Designation) {
    errors.Designation = 'Designation is required.'
  }
  if (!normalized.Department) {
    errors.Department = 'Department is required.'
  }
  if (!normalized.entity) {
    errors.entity = 'Entity is required.'
  }
  if (value.entity.trim() === 'Other' && !otherEntity.trim()) {
    errors.otherEntity = 'Please enter the entity name.'
  }

  return errors
}

export function isUserProfileComplete(user: {
  employeeCode?: string
  Department?: string
  Designation?: string
  entity?: string
}) {
  return Boolean(
    user.employeeCode?.trim() &&
      user.Department?.trim() &&
      user.Designation?.trim() &&
      user.entity?.trim(),
  )
}

export function userDataFromBackend(backendUser: Record<string, unknown>): UserData {
  return {
    employeeCode: String(backendUser.employeeCode ?? ''),
    name: String(backendUser.name ?? ''),
    email: String(backendUser.email ?? ''),
    Department: String(backendUser.Department ?? ''),
    Designation: String(backendUser.Designation ?? ''),
    entity: String(backendUser.entity ?? ''),
  }
}
