/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  apiVersion: string;
  apiFullUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

interface CognitoEnvConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  /**
   * OIDC-style fields matching the sample config:
   * authority, client_id, redirect_uri, response_type, scope
   */
  authority: string;
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
}

/**
 * Helper to read required environment variables.
 * Throws an error if the variable is missing or empty.
 */
function getRequiredEnvVar(key: string): string {
  const value = (import.meta.env as any)[key] as string | undefined;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Validates and returns the API base URL from environment variables
 */
function getApiBaseUrl(): string {
  const apiUrl = getRequiredEnvVar('VITE_API_BASE_URL');
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
}

/**
 * Application environment configuration
 * Exported as a frozen object to prevent accidental mutations
 */
const apiBaseUrl = getApiBaseUrl();
const apiVersion = getRequiredEnvVar('VITE_API_VERSION');

export const config: Readonly<EnvironmentConfig> = Object.freeze({
  apiBaseUrl,
  apiVersion,
  apiFullUrl: `${apiBaseUrl}${apiVersion}`,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
});

const cognitoRegion = getRequiredEnvVar('VITE_COGNITO_REGION');
const cognitoUserPoolId = getRequiredEnvVar('VITE_COGNITO_USER_POOL_ID');
const cognitoUserPoolClientId = getRequiredEnvVar(
  'VITE_COGNITO_USER_POOL_CLIENT_ID'
);
const cognitoRedirectUri = getRequiredEnvVar('VITE_COGNITO_REDIRECT_URI');
const cognitoResponseType = getRequiredEnvVar('VITE_COGNITO_RESPONSE_TYPE');
const cognitoScope = getRequiredEnvVar('VITE_COGNITO_SCOPE');

/**
 * Cognito / Amplify Auth configuration derived from environment variables
 * Used by the auth module for AWS Amplify configuration, and also exposes
 * OIDC-style fields (authority, client_id, redirect_uri, response_type, scope)
 * like in the react-oidc-context example.
 */
export const cognitoEnv: Readonly<CognitoEnvConfig> = Object.freeze({
  region: cognitoRegion,
  userPoolId: cognitoUserPoolId,
  userPoolClientId: cognitoUserPoolClientId,
  authority: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`,
  clientId: cognitoUserPoolClientId,
  redirectUri: cognitoRedirectUri,
  responseType: cognitoResponseType,
  scope: cognitoScope,
});

/**
 * Type-safe access to environment variables
 */
export default config;

