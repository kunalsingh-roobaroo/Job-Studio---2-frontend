import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthActions } from "@/auth/hooks"

type Step = "REQUEST" | "CONFIRM"

function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword, resetPassword, isProcessing, error } = useAuthActions()

  const [step, setStep] = React.useState<Step>("REQUEST")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [localMessage, setLocalMessage] = React.useState<string | null>(null)

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault()
    setLocalMessage(null)

    await forgotPassword({ email })
    setStep("CONFIRM")
    setLocalMessage("We sent a verification code to your email.")
  }

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault()
    setLocalMessage(null)

    await resetPassword({
      email,
      confirmationCode: code,
      newPassword,
    })

    navigate("/signin", { replace: true })
  }

  const isRequestDisabled = isProcessing || email.trim().length === 0
  const isConfirmDisabled =
    isProcessing ||
    email.trim().length === 0 ||
    code.trim().length === 0 ||
    newPassword.trim().length < 8

  const message = error || localMessage

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-semibold">
              Reset your password
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === "REQUEST"
                ? "Enter the email associated with your account and we will send a reset code."
                : "Enter the verification code from your email and choose a new password."}
            </p>
          </CardHeader>

          {step === "REQUEST" ? (
            <form onSubmit={handleRequest} noValidate>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {message && (
                  <p className="text-sm text-destructive" role="alert">
                    {message}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRequestDisabled}
                >
                  {isProcessing ? "Sending code..." : "Send reset code"}
                </Button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                  onClick={() => navigate("/signin")}
                >
                  Back to sign in
                </button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleConfirm} noValidate>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-foreground"
                  >
                    Verification code
                  </label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter the 6-digit code"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-foreground"
                  >
                    New password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters with a mix of letters, numbers,
                    and symbols.
                  </p>
                </div>

                {message && (
                  <p className="text-sm text-destructive" role="alert">
                    {message}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isConfirmDisabled}
                >
                  {isProcessing ? "Updating password..." : "Update password"}
                </Button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                  onClick={() => navigate("/signin")}
                >
                  Back to sign in
                </button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword


