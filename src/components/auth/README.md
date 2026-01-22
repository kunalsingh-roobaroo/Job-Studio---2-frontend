# Auth Components - Implementation Guide

## Overview

This folder contains the UI components for the new multi-step authentication flow.

## Files Created

### Auth Components (`/src/components/auth/`)

| File | Purpose | Status |
|------|---------|--------|
| `AuthLayout.tsx` | Split-screen layout wrapper (branded banner) + CenteredAuthLayout | ✅ UI Complete |
| `OTPInput.tsx` | 6-digit OTP input component | ✅ UI Complete |
| `index.ts` | Barrel export file | ✅ Complete |
| `README.md` | This documentation | ✅ Complete |

**AuthLayout Components:**
- `AuthLayout` - Split-screen layout for Sign Up/In and OTP steps (form on left, gradient banner on right)
- `CenteredAuthLayout` - Centered layout for Personal Details and Usage Goals steps (full-width centered content)

### UI Components (`/src/components/ui/`)

| File | Purpose | Status |
|------|---------|--------|
| ~~`sign-in.tsx`~~ | ~~Glass-morphism sign-in page with hero image~~ | ❌ **DELETED** |
| ~~`sign-up.tsx`~~ | ~~Glass-morphism sign-up page with password validation~~ | ❌ **DELETED** |

### Pages (`/src/pages/`)

| File | Purpose | Status |
|------|---------|--------|
| `SignUp.tsx` | Sign up form with email/password | ✅ UI Complete |
| `SignIn.tsx` | Sign in form with email/password | ✅ UI Complete |
| `VerifyOTP.tsx` | OTP verification after signup | ✅ UI Complete |
| `PersonalDetails.tsx` | Personal details collection | ✅ UI Complete |
| `UsageGoals.tsx` | Usage goals selection | ✅ UI Complete |
| ~~`Auth.tsx`~~ | ~~Multi-step auth flow (unified)~~ | ❌ **DELETED** (split into separate routes) |

## Routes

| Route | Component | Description | Status |
|-------|-----------|-------------|--------|
| `/signup` | `SignUp.tsx` | Sign up form | ✅ Active |
| `/signin` | `SignIn.tsx` | Sign in form | ✅ Active |
| `/verify-otp` | `VerifyOTP.tsx` | OTP verification | ✅ Active |
| `/personal-details` | `PersonalDetails.tsx` | Personal details form | ✅ Active |
| `/usage-goals` | `UsageGoals.tsx` | Usage goals selection | ✅ Active |

```
http://localhost:5173/signup            # Sign up
http://localhost:5173/signin            # Sign in
http://localhost:5173/verify-otp        # OTP verification
http://localhost:5173/personal-details  # Personal details
http://localhost:5173/usage-goals       # Usage goals
```

## ⚠️ IMPORTANT: Auth Routes Split

The unified `/auth` page has been **split into separate routes** for better navigation and URL structure:
- ❌ `frontend/src/pages/Auth.tsx` - DELETED
- ✅ Each step now has its own dedicated route and page component

**New Flow:**
```
Sign Up Flow:
/signup → /verify-otp → /personal-details → /usage-goals → /

Sign In Flow:
/signin → /
```

## Flow Steps

### Step 1: Sign Up / Sign In (Toggleable)
- Email input
- Password input with show/hide toggle
- Name input (Sign Up only)
- Remember Me checkbox (Sign In only)
- Toggle between Sign Up and Sign In modes

### Step 2: OTP Verification
- 6-digit input boxes with auto-focus
- Resend code button with 60s cooldown
- Back button to return to Step 1

### Step 3: Personal Details
- Full Name
- Mobile Number (with country code dropdown)
- Role dropdown (School Student, College Student, etc.)
- Source dropdown (How did you hear about us)

### Step 4: Usage Goals
- Multi-select grid with icons
- 8 feature options
- Skip option available

## CSS Required

The marquee animation is already added to `index.css`:

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
```

## Backend Integration TODO

### Step 1 - Sign Up
```typescript
// In handleAuthSubmit when mode === "signup"
import { signUpWithEmail } from "@/auth/cognito"

await signUpWithEmail({
  email: data.email,
  password: data.password,
  name: data.name,
})
```

### Step 1 - Sign In
```typescript
// In handleAuthSubmit when mode === "signin"
import { signInWithEmail } from "@/auth/cognito"

// Store remember me preference
if (rememberMe) {
  localStorage.setItem("rememberMe", "true")
}
localStorage.setItem("lastLoginTime", Date.now().toString())

await signIn({ email: data.email, password: data.password })
navigate("/")
```

### Step 2 - OTP Verification
```typescript
// In handleOTPVerify
import { confirmEmailSignUp } from "@/auth/cognito"

await confirmEmailSignUp({
  email: email,
  confirmationCode: code,
})
```

### Step 2 - Resend Code
```typescript
// In handleResendOTP
import { resendSignUpCode } from "@/auth/cognito"

await resendSignUpCode({ email })
```

### Step 3 & 4 - User Profile
```
TODO: Create backend endpoint for storing user profile data
- POST /api/v1/users/profile
- Body: { fullName, phone, role, source, usageGoals }
```

## Error Handling TODO

Map Cognito errors to user-friendly messages:

```typescript
const COGNITO_ERROR_MESSAGES: Record<string, string> = {
  "UsernameExistsException": "An account with this email already exists.",
  "InvalidPasswordException": "Password does not meet requirements.",
  "CodeMismatchException": "Invalid verification code.",
  "ExpiredCodeException": "Verification code has expired. Please request a new one.",
  "LimitExceededException": "Too many attempts. Please try again later.",
  "UserNotFoundException": "No account found with this email.",
  "NotAuthorizedException": "Incorrect email or password.",
}
```

## Testing the UI

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/auth`
3. Test the flow:
   - Fill Sign Up form → Click "Sign Up" → Goes to OTP step
   - Enter 6 digits → Click "Verify Email" → Goes to Personal Details
   - Fill details → Click "Continue" → Goes to Usage Goals
   - Select goals → Click "Get Started" → Redirects to /

## Design Notes

- Split-screen layout: Form on left (55%), branded banner on right (45%)
- Mobile: Banner on top (35-45% height), form below
- Uses existing shadcn/ui components (Button, Input)
- Consistent with existing app styling (Tailwind CSS)
