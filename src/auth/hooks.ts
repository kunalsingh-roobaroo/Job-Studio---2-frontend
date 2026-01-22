import { useAuthContext } from './context'

export function useAuth() {
  return useAuthContext()
}

export function useAuthUser() {
  const { user, isAuthenticated, isInitializing } = useAuthContext()
  return { user, isAuthenticated, isInitializing }
}

export function useAuthActions() {
  const {
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    resetPassword,
    refreshCurrentUser,
    isProcessing,
    error,
  } = useAuthContext()

  return {
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    resetPassword,
    refreshCurrentUser,
    isProcessing,
    error,
  }
}


