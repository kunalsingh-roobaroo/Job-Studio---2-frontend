import { Amplify } from 'aws-amplify'
import { cognitoEnv } from '@/config/env'

const amplifyAuthConfig = {
  Auth: {
    Cognito: {
      region: cognitoEnv.region,
      userPoolId: cognitoEnv.userPoolId,
      userPoolClientId: cognitoEnv.userPoolClientId,
    },
  },
} as const

let isConfigured = false

export function configureAmplifyAuth() {
  if (isConfigured) return
  Amplify.configure(amplifyAuthConfig)
  isConfigured = true
}

export type AmplifyAuthConfig = typeof amplifyAuthConfig


