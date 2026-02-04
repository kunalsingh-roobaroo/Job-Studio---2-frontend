export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  attributes?: Record<string, string | undefined>;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  confirmationCode: string;
  newPassword: string;
}

export interface ConfirmSignUpInput {
  email: string;
  confirmationCode: string;
}

export interface AuthContextValue extends AuthState {
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
  confirmSignUp(input: ConfirmSignUpInput): Promise<void>;
  signOut(): Promise<void>;
  forgotPassword(input: ForgotPasswordInput): Promise<void>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
  refreshCurrentUser(): Promise<void>;
}


