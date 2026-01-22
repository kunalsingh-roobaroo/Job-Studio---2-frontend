/**
 * =============================================================================
 * OTP INPUT COMPONENT
 * =============================================================================
 * 
 * PURPOSE:
 * A 6-digit OTP (One-Time Password) input component for email verification.
 * Each digit has its own input box with auto-focus behavior.
 * 
 * FEATURES:
 * ✅ DONE: 6 individual input boxes
 * ✅ DONE: Auto-focus to next box on input
 * ✅ DONE: Backspace navigates to previous box
 * ✅ DONE: Paste support (paste full code)
 * ✅ DONE: Only allows numeric input
 * ✅ DONE: Disabled state support
 * 
 * USAGE:
 * ```tsx
 * const [otp, setOtp] = useState("")
 * <OTPInput value={otp} onChange={setOtp} />
 * ```
 * 
 * =============================================================================
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  /** Number of OTP digits (default: 6) */
  length?: number
  /** Current OTP value */
  value: string
  /** Callback when OTP value changes */
  onChange: (value: string) => void
  /** Whether the input is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * OTPInput Component
 * 
 * Renders a series of single-character input boxes for OTP entry.
 * Handles auto-focus, paste, and keyboard navigation automatically.
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: OTPInputProps) {
  // Refs for each input box to enable programmatic focus
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  /**
   * Handle single character input
   * - Only allows digits
   * - Auto-focuses next input after entry
   */
  const handleChange = (index: number, char: string) => {
    // Only allow digits
    if (char && !/^\d$/.test(char)) return

    const newValue = value.split("")
    newValue[index] = char
    const result = newValue.join("").slice(0, length)
    onChange(result)

    // Auto-focus next input if character was entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  /**
   * Handle keyboard navigation
   * - Backspace on empty input focuses previous input
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  /**
   * Handle paste event
   * - Extracts digits from pasted content
   * - Fills inputs and focuses appropriate box
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    onChange(pastedData)
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold rounded-lg border border-input bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-150"
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}

export default OTPInput
