import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser as amplifyGetCurrentUser,
  confirmSignUp as amplifyConfirmSignUp,
  fetchUserAttributes as amplifyFetchUserAttributes,
  signInWithRedirect,
} from 'aws-amplify/auth'

import type {
  AuthUser,
  SignInInput,
  SignUpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ConfirmSignUpInput,
} from './types'

async function buildAuthUser(): Promise<AuthUser> {
  const user = await amplifyGetCurrentUser()

  let attributes: Record<string, string | undefined> | undefined
  try {
    const fetched = await amplifyFetchUserAttributes()
    attributes = { ...fetched }
  } catch {
    attributes = undefined
  }

  return mapAmplifyUser(user, attributes)
}

function mapAmplifyUser(
  user: any,
  attributesOverride?: Record<string, string | undefined>
): AuthUser {
  if (!user) return { id: '', username: '' }

  const { userId, username, signInDetails } = user

  const attributes = attributesOverride

  const email: string | undefined =
    signInDetails?.loginId ?? attributes?.email ?? undefined

  // Extract name from attributes (populated by Google IdP mapping)
  const name: string | undefined = attributes?.name ?? undefined

  return {
    id: userId ?? username,
    username,
    email,
    name,
    attributes,
  }
}

export async function signInWithEmail({
  email,
  password,
}: SignInInput): Promise<AuthUser> {
  const { isSignedIn, nextStep } = await amplifySignIn({
    username: email,
    password,
  })

  if (!isSignedIn && nextStep?.signInStep !== 'DONE') {
    // Multi-factor or other advanced flows can be handled here later
    throw new Error('Additional sign-in steps are required.')
  }

  return await buildAuthUser()
}

export async function signUpWithEmail(input: SignUpInput): Promise<void> {
  const { email, password, name, phoneNumber } = input

  await amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        ...(name ? { name } : {}),
        ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      },
    },
  })
}

export async function confirmEmailSignUp({
  email,
  confirmationCode,
}: ConfirmSignUpInput): Promise<void> {
  await amplifyConfirmSignUp({
    username: email,
    confirmationCode,
  })
}

export async function resendSignUpCode(email: string): Promise<void> {
  const { resendSignUpCode: amplifyResendSignUpCode } = await import('aws-amplify/auth')
  await amplifyResendSignUpCode({
    username: email,
  })
}

export async function signOut(): Promise<void> {
  await amplifySignOut()
}

export async function forgotPassword({
  email,
}: ForgotPasswordInput): Promise<void> {
  await amplifyResetPassword({
    username: email,
  })
}

export async function resetPassword({
  email,
  confirmationCode,
  newPassword,
}: ResetPasswordInput): Promise<void> {
  await amplifyConfirmResetPassword({
    username: email,
    confirmationCode,
    newPassword,
  })
}

export async function getCurrentAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const user = await buildAuthUser()
    return user
  } catch (error: any) {
    // When no user is signed in, Amplify throws an error – treat it as "no user"
    const code = error?.name ?? error?.code
    if (
      code === 'UserUnAuthenticatedException' ||
      code === 'NotAuthorizedException' ||
      code === 'UserNotFoundException'
    ) {
      return null
    }

    throw error
  }
}

/**
 * Initiate Google OAuth sign-in.
 * Uses manual redirect to Cognito Hosted UI since signInWithRedirect 
 * can have issues with some configurations.
 */
export async function signInWithGoogle(): Promise<void> {
  console.log('[signInWithGoogle] Starting Google OAuth flow...')
  
  try {
    // First try Amplify's signInWithRedirect
    console.log('[signInWithGoogle] Attempting signInWithRedirect...')
    await signInWithRedirect({
      provider: 'Google',
    })
    console.log('[signInWithGoogle] signInWithRedirect called successfully')
  } catch (error: any) {
    console.error('[signInWithGoogle] signInWithRedirect failed:', error)
    
    // Fallback to manual redirect
    console.log('[signInWithGoogle] Falling back to manual redirect...')
    const cognitoDomain = "jobstudio-v2-auth.auth.ap-south-1.amazoncognito.com"
    const clientId = "jai52r9vvolatgutf2qvbq17i"
    const redirectUri = encodeURIComponent(window.location.origin)
    const hostedUIUrl = `https://${cognitoDomain}/oauth2/authorize?identity_provider=Google&redirect_uri=${redirectUri}&response_type=CODE&client_id=${clientId}&scope=openid+email+profile`
    
    console.log('[signInWithGoogle] Redirecting to:', hostedUIUrl)
    window.location.href = hostedUIUrl
  }
}


