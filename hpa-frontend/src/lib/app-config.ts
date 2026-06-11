export function isPasswordLoginEnabled(): boolean {
  return import.meta.env.VITE_USE_LOGIN === '1'
}
