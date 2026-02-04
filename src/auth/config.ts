import { Amplify, type ResourcesConfig } from 'aws-amplify'
import { cognitoEnv } from '@/config/env'

// Cognito Hosted UI domain (without https://)
const cognitoDomain = 'jobstudio-v2-auth.auth.ap-south-1.amazoncognito.com'

const amplifyAuthConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: cognitoEnv.userPoolId,
      userPoolClientId: cognitoEnv.userPoolClientId,
      loginWith: {
        oauth: {
          domain: cognitoDomain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [cognitoEnv.redirectUri],
          redirectSignOut: [cognitoEnv.redirectUri],
          responseType: 'code',
        },
      },
    },
  },
}

let isConfigured = false

export function configureAmplifyAuth() {
  if (isConfigured) return
  Amplify.configure(amplifyAuthConfig)
  console.log('[Amplify] Auth configured with OAuth domain:', cognitoDomain)
  console.log('[Amplify] Redirect URI:', cognitoEnv.redirectUri)
  isConfigured = true
}

/**
 * Check if the current URL contains OAuth callback parameters
 */
export function hasOAuthCallbackParams(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('error')
}

export type AmplifyAuthConfig = typeof amplifyAuthConfig


