import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { OTPInput } from "@/components/auth/OTPInput"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuthActions } from "@/auth/hooks"
import { resendSignUpCode } from "@/auth/cognito"
import { ArrowLeft } from "lucide-react"

const BRAND = { purple: { base: "#815FAA" } }
type ThemeMode = "dark" | "light"

// Map Cognito errors to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  "CodeMismatchException": "Invalid verification code. Please try again.",
  "ExpiredCodeException": "Verification code has expired. Please request a new one.",
  "LimitExceededException": "Too many attempts. Please try again later.",
}

function getErrorMessage(error: string): string {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.includes(key)) return message
  }
  return error
}

function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const { actualTheme } = useTheme()
  const { confirmSignUp, isProcessing, error } = useAuthActions()
  const themeMode: ThemeMode = actualTheme === "dark" ? "dark" : "light"
  const isDark = themeMode === "dark"
  
  // Get email from navigation state
  const email = location.state?.email || ""
  
  // Redirect to signup if no email in state
  React.useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true })
    }
  }, [email, navigate])
  
  const [otp, setOtp] = React.useState("")
  const [resendCooldown, setResendCooldown] = React.useState(0)
  const [resendError, setResendError] = React.useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = React.useState(false)
  
  const displayError = error ? getErrorMessage(error) : resendError
  
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])
  
  const handleResend = async () => {
    setResendError(null)
    setResendSuccess(false)
    
    try {
      await resendSignUpCode(email)
      setResendCooldown(60)
      setResendSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err: any) {
      setResendError(err?.message || "Failed to resend code. Please try again.")
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    
    try {
      await confirmSignUp({ email, confirmationCode: otp })
      // After successful verification, navigate to personal details
      navigate("/personal-details", { state: { email } })
    } catch (err) {
      // Error is handled by useAuthActions hook
    }
  }
  
  const handleBack = () => {
    navigate("/signup")
  }

  if (!email) {
    return null // Will redirect in useEffect
  }

  return (
    <AuthLayout mode={themeMode}>
      <div className="w-full max-w-sm mx-auto font-['Inter',sans-serif]">
        <button 
          type="button" 
          onClick={handleBack}
          className={cn(
            "flex items-center gap-2 text-sm mb-6 transition-colors",
            isDark ? "text-white/60 hover:text-white" : "text-[#0C0C0C]/60 hover:text-[#0C0C0C]"
          )}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        
        <div className="text-center mb-8">
          <div 
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4" 
            style={{ backgroundColor: BRAND.purple.base + "20" }}
          >
            <svg 
              className="h-8 w-8" 
              style={{ color: BRAND.purple.base }} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <h1 className={cn("text-2xl font-semibold mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
            Verify your email
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-[#0C0C0C]/60")}>
            We sent a 6-digit code to
          </p>
          <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-[#0C0C0C]")}>
            {email}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} disabled={isProcessing} />
          
          {displayError && (
            <p className="text-[#FB7D7D] text-sm text-center" role="alert">
              {displayError}
            </p>
          )}
          
          {resendSuccess && (
            <p className="text-green-500 text-sm text-center">
              Verification code sent successfully!
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={otp.length !== 6 || isProcessing}
            className="w-full p-3 rounded-xl font-medium text-white disabled:opacity-50 transition-opacity" 
            style={{ backgroundColor: BRAND.purple.base }}
          >
            {isProcessing ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        
        <p className={cn("text-center text-sm mt-6", isDark ? "text-white/60" : "text-[#0C0C0C]/60")}>
          Didn't receive the code?{" "}
          {resendCooldown > 0 ? (
            <span>Resend in {resendCooldown}s</span>
          ) : (
            <button 
              onClick={handleResend}
              disabled={isProcessing}
              className="font-semibold hover:underline disabled:opacity-50" 
              style={{ color: BRAND.purple.base }}
            >
              Resend Code
            </button>
          )}
        </p>
      </div>
    </AuthLayout>
  )
}

export default VerifyOTP
