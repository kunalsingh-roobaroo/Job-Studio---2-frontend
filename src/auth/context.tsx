import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Hub } from 'aws-amplify/utils'
import { fetchAuthSession } from 'aws-amplify/auth'

import { configureAmplifyAuth, hasOAuthCallbackParams } from './config'
import {
  confirmEmailSignUp,
  forgotPassword as amplifyForgotPassword,
  getCurrentAuthenticatedUser,
  resetPassword as amplifyResetPassword,
  signInWithEmail,
  signOut as amplifySignOut,
  signUpWithEmail,
} from './cognito'
import type {
  AuthContextValue,
  AuthState,
  ConfirmSignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from './types'

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isProcessing: false,
  error: null,
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState)

  useEffect(() => {
    configureAmplifyAuth()

    let cancelled = false

    // Listen for Amplify Hub auth events (handles OAuth callbacks)
    const hubListener = Hub.listen('auth', async ({ payload }) => {
      console.log('[Auth Hub]', payload.event, payload)
      
      switch (payload.event) {
        case 'signedIn':
        case 'signInWithRedirect':
          // User signed in via OAuth or regular sign-in
          try {
            const user = await getCurrentAuthenticatedUser()
            if (!cancelled) {
              // Store login time for OAuth sign-ins too
              localStorage.setItem("lastLoginTime", Date.now().toString())
              setState((prev) => ({
                ...prev,
                user,
                isAuthenticated: true,
                isInitializing: false,
                error: null,
              }))
              // Clean up OAuth params from URL
              if (hasOAuthCallbackParams()) {
                window.history.replaceState({}, document.title, window.location.pathname)
              }
            }
          } catch (err) {
            console.error('[Auth Hub] Error getting user after sign in:', err)
          }
          break
          
        case 'signInWithRedirect_failure':
          console.error('[Auth Hub] OAuth sign-in failed:', payload.data)
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              isInitializing: false,
              error: 'Google sign-in failed. Please try again.',
            }))
            // Clean up OAuth params from URL
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          break
          
        case 'signedOut':
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
            }))
          }
          break
      }
    })

    async function bootstrap() {
      console.log('[Auth Bootstrap] Starting bootstrap...')
      console.log('[Auth Bootstrap] Current URL:', window.location.href)
      
      try {
        // Check if we have OAuth callback parameters in the URL
        const isOAuthCallback = hasOAuthCallbackParams()
        console.log('[Auth Bootstrap] Is OAuth callback:', isOAuthCallback)
        
        if (isOAuthCallback) {
          console.log('[Auth Bootstrap] OAuth callback detected, fetching session...')
          // fetchAuthSession will automatically exchange the code for tokens
          try {
            const session = await fetchAuthSession()
            console.log('[Auth Bootstrap] Session fetched:', !!session.tokens)
            console.log('[Auth Bootstrap] Session details:', JSON.stringify(session, null, 2))
            
            if (session.tokens) {
              const user = await getCurrentAuthenticatedUser()
              if (!cancelled) {
                localStorage.setItem("lastLoginTime", Date.now().toString())
                setState((prev) => ({
                  ...prev,
                  user,
                  isAuthenticated: true,
                  isInitializing: false,
                  error: null,
                }))
                // Clean up OAuth params from URL
                window.history.replaceState({}, document.title, window.location.pathname)
              }
              return
            }
          } catch (oauthError) {
            console.error('[Auth Bootstrap] OAuth callback error:', oauthError)
            // Clean up URL and continue to normal bootstrap
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        }

        // Check if "Remember me" was not selected and session should expire
        const rememberMe = localStorage.getItem("rememberMe")
        const lastLoginTime = localStorage.getItem("lastLoginTime")
        
        if (rememberMe !== "true" && lastLoginTime) {
          const loginTime = parseInt(lastLoginTime, 10)
          const now = Date.now()
          const oneDayMs = 24 * 60 * 60 * 1000
          
          // If not "remember me" and more than 1 day has passed, sign out
          if (now - loginTime > oneDayMs) {
            localStorage.removeItem("lastLoginTime")
            if (cancelled) return
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isInitializing: false,
              error: null,
            }))
            return
          }
        }
        
        // Check 7-day expiry for "remember me" users
        if (rememberMe === "true" && lastLoginTime) {
          const loginTime = parseInt(lastLoginTime, 10)
          const now = Date.now()
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
          
          if (now - loginTime > sevenDaysMs) {
            localStorage.removeItem("rememberMe")
            localStorage.removeItem("lastLoginTime")
            if (cancelled) return
            setState((prev) => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isInitializing: false,
              error: null,
            }))
            return
          }
        }

        // Try to get current authenticated user
        const user = await getCurrentAuthenticatedUser()
        if (cancelled) return

        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: !!user,
          isInitializing: false,
          error: null,
        }))
      } catch (error) {
        if (cancelled) return
        console.log('[Auth Bootstrap] No authenticated user found')
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: null, // Don't show error for normal unauthenticated state
        }))
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      hubListener() // Unsubscribe from Hub
    }
  }, [])

  const runWithSpinner = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }))
      try {
        const result = await operation()
        return result
      } catch (error: any) {
        const message =
          error?.message ||
          error?.toString?.() ||
          'Something went wrong. Please try again.'

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: message,
        }))
        throw error
      } finally {
        setState((prev) => ({ ...prev, isProcessing: false }))
      }
    },
    []
  )

  const signIn = useCallback(
    async (input: SignInInput) => {
      const user = await runWithSpinner(() => signInWithEmail(input))
      // Store login time for session expiry check
      localStorage.setItem("lastLoginTime", Date.now().toString())
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }))
    },
    [runWithSpinner]
  )

  const signUp = useCallback(
    async (input: SignUpInput) => {
      await runWithSpinner(() => signUpWithEmail(input))
    },
    [runWithSpinner]
  )

  const confirmSignUp = useCallback(
    async (input: ConfirmSignUpInput) => {
      await runWithSpinner(() => confirmEmailSignUp(input))
    },
    [runWithSpinner]
  )

  const signOut = useCallback(async () => {
    await runWithSpinner(() => amplifySignOut())
    // Clear remember me and login time on sign out
    localStorage.removeItem("rememberMe")
    localStorage.removeItem("lastLoginTime")
    setState((prev) => ({
      ...prev,
      user: null,
      isAuthenticated: false,
    }))
  }, [runWithSpinner])

  const forgotPassword = useCallback(
    async (input: ForgotPasswordInput) => {
      await runWithSpinner(() => amplifyForgotPassword(input))
    },
    [runWithSpinner]
  )

  const resetPassword = useCallback(
    async (input: ResetPasswordInput) => {
      await runWithSpinner(() => amplifyResetPassword(input))
    },
    [runWithSpinner]
  )

  const refreshCurrentUser = useCallback(async () => {
    const user = await getCurrentAuthenticatedUser()
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }))
  }, [])

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    resetPassword,
    refreshCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}


