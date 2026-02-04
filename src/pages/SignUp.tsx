import * as React from "react"
import { useNavigate } from "react-router-dom"
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuthActions, useAuthUser } from "@/auth/hooks"
import { signInWithGoogle } from "@/auth/cognito"
import { checkOnboardingStatus } from "@/services/api/userService"
import Favicon from "@/assets/Favicon.png"
import { Eye, EyeOff, TrendingUp, Users, Trophy } from "lucide-react"

// College logos
import IITMadras from "@/assets/colleges/Iit madras.png"
import IITDelhi from "@/assets/colleges/iit_delhi.jpeg"
import IITKGP from "@/assets/colleges/Iit_KGP.png"
import MastersUnion from "@/assets/colleges/masters_union.jpeg"
import Rishihood from "@/assets/colleges/rishihood.png"

const BRAND = { purple: { base: "#815FAA" } }

const collegeLogos = [
  { src: IITMadras, alt: "IIT Madras" },
  { src: IITDelhi, alt: "IIT Delhi" },
  { src: IITKGP, alt: "IIT Kharagpur" },
  { src: MastersUnion, alt: "Masters Union" },
  { src: Rishihood, alt: "Rishihood" },
]

const ERROR_MESSAGES: Record<string, string> = {
  "UsernameExistsException": "An account with this email already exists.",
  "InvalidPasswordException": "Password does not meet requirements.",
  "InvalidParameterException": "Please check your email format.",
  "LimitExceededException": "Too many attempts. Please try again later.",
}

function getErrorMessage(error: string): string {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.includes(key)) return message
  }
  return error
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// Hyper-realistic 3D Hero Card with Light Glass Material & Spotlight
function HeroCard3D({ mouseX, mouseY, cardMouseX, cardMouseY }: { mouseX: any; mouseY: any; cardMouseX: any; cardMouseY: any }) {
  const rotateX = useTransform(mouseY, [0, 1], [8, -8])
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8])
  
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 })

  // Spotlight effect that follows mouse
  const spotlightBackground = useMotionTemplate`radial-gradient(600px circle at ${cardMouseX}px ${cardMouseY}px, rgba(129, 95, 170, 0.08), transparent 40%)`

  return (
    <motion.div
      className="relative w-[480px] rounded-3xl overflow-hidden"
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        // Light Glass Material
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        // Elegant shadow for depth
        boxShadow: `
          0 50px 100px -20px rgba(129, 95, 170, 0.25),
          0 30px 60px -30px rgba(0,0,0,0.15),
          0 0 0 1px rgba(0,0,0,0.05)
        `,
      }}
      animate={{ y: [-15, 15, -15] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Spotlight Overlay - follows mouse */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{ background: spotlightBackground }}
      />

      {/* Surface Sheen Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 55%, transparent 60%)",
        }}
      />

      {/* Header */}
      <motion.div 
        className="px-7 py-5 border-b border-gray-100"
        style={{ transform: "translateZ(10px)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#815FAA] to-[#27AAE7] flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] font-bold">JS</span>
          </div>
          <span className="text-gray-500 text-sm font-medium">Job Studio</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-7" style={{ transformStyle: "preserve-3d" }}>
        {/* Job Title Section - Raised Layer */}
        <motion.div 
          className="mb-6"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1.5">Current Application</p>
              <h2 className="text-gray-900 text-2xl font-bold tracking-tight">Product Designer</h2>
              <p className="text-gray-500 text-base mt-0.5">@ Google</p>
            </div>
            <span 
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                color: "#16a34a",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              94% Match
            </span>
          </div>
        </motion.div>

        {/* Company Logo Card - Elevated Layer */}
        <motion.div 
          className="rounded-2xl p-4 mb-5"
          style={{
            transform: "translateZ(30px)",
            background: "rgba(249,250,251,1)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <span className="text-[#4285F4] font-bold text-xl">G</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm">Google Inc.</p>
              <p className="text-gray-400 text-xs">Mountain View, CA • Full-time</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Highest Layer */}
        <motion.div 
          className="grid grid-cols-3 gap-3"
          style={{ transform: "translateZ(40px)" }}
        >
          {[
            { icon: TrendingUp, value: "12", label: "Applications", color: "#815FAA" },
            { icon: Users, value: "4", label: "Interviews", color: "#16a34a" },
            { icon: Trophy, value: "Top 1%", label: "Rank", color: "#ca8a04" },
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(249,250,251,1)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center justify-center mb-1.5">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-gray-900 text-lg font-bold">{stat.value}</p>
              <p className="text-gray-400 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function SignUp() {
  const navigate = useNavigate()
  const { signUp, isProcessing, error } = useAuthActions()
  const { isAuthenticated, isInitializing } = useAuthUser()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [isButtonPressed, setIsButtonPressed] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = React.useState(false)
  
  // Redirect after authentication - check onboarding status for OAuth users
  React.useEffect(() => {
    if (!isInitializing && isAuthenticated && !isCheckingOnboarding) {
      setIsCheckingOnboarding(true)
      
      // Check if user has completed onboarding
      checkOnboardingStatus()
        .then(({ completed }) => {
          if (!completed) {
            // New user (likely OAuth) - redirect to onboarding
            console.log('[SignUp] User needs onboarding, redirecting to personal-details')
            navigate('/personal-details', { replace: true })
          } else {
            // Returning user with completed onboarding
            console.log('[SignUp] Onboarding complete, redirecting to home')
            navigate('/', { replace: true })
          }
        })
        .catch((err) => {
          // On error, assume onboarding needed (safer for new OAuth users)
          console.error('[SignUp] Error checking onboarding:', err)
          navigate('/personal-details', { replace: true })
        })
    }
  }, [isAuthenticated, isInitializing, navigate, isCheckingOnboarding])
  
  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  
  // Card-relative mouse position for spotlight
  const cardMouseX = useMotionValue(240)
  const cardMouseY = useMotionValue(200)
  
  const cardRef = React.useRef<HTMLDivElement>(null)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
    
    // Update card-relative mouse position for spotlight
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect()
      cardMouseX.set(e.clientX - cardRect.left)
      cardMouseY.set(e.clientY - cardRect.top)
    }
  }
  
  const showPasswordWarning = passwordTouched && password.length > 0 && password.length < 6
  const displayError = localError || (error ? getErrorMessage(error) : null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long")
      return
    }
    
    try {
      await signUp({ email, password })
      navigate("/verify-otp", { state: { email } })
    } catch (err) {
      // Error is handled by useAuthActions hook
    }
  }
  
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setLocalError(null)
      await signInWithGoogle()
      // Note: This won't return - the browser will redirect to Google
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setLocalError('Failed to initiate Google sign-in. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-['Inter',sans-serif] relative">
      {/* Film Grain Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      {/* Marquee Animation Styles */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Left Panel - White Form Container */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 py-8 bg-white relative z-10">
        <motion.div 
          className="w-full max-w-sm mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <img src={Favicon} alt="Job Studio" className="h-6 w-6" />
            <span className="text-lg font-semibold text-gray-900">Job Studio</span>
          </div>
          
          {/* Header - Tighter tracking */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
              Your Dream Job Awaits.
            </h1>
            <p className="text-gray-500 text-sm">
              Create an account to start optimizing your career.
            </p>
          </div>
          
          {/* Google Button */}
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isProcessing}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm shadow-sm hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="h-5 w-5" />
            {isGoogleLoading ? "Redirecting to Google..." : "Sign up with Google"}
          </button>
          
          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or continue with email</span>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isProcessing}
                className={cn(
                  "w-full h-11 px-4 rounded-xl border text-sm transition-all",
                  "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                )}
              />
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                onBlur={() => setPasswordTouched(true)}
                required 
                minLength={6}
                disabled={isProcessing}
                className={cn(
                  "w-full h-11 px-4 pr-12 rounded-xl border text-sm transition-all",
                  "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                )}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {showPasswordWarning && (
              <p className="text-red-500 text-xs">Password must be at least 6 characters</p>
            )}
            
            {displayError && (
              <p className="text-red-500 text-xs" role="alert">{displayError}</p>
            )}
            
            {/* Tactile 3D Button */}
            <button 
              type="submit" 
              disabled={isProcessing || password.length < 6}
              onMouseDown={() => setIsButtonPressed(true)}
              onMouseUp={() => setIsButtonPressed(false)}
              onMouseLeave={() => setIsButtonPressed(false)}
              className="w-full h-11 rounded-xl font-medium text-sm text-white disabled:opacity-50 transition-all"
              style={{ 
                backgroundColor: BRAND.purple.base,
                boxShadow: isButtonPressed 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
                  : 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px rgba(129, 95, 170, 0.4)',
                transform: isButtonPressed ? 'translateY(1px)' : 'translateY(0)',
              }}
            >
              {isProcessing ? "Creating account..." : "Create Account"}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <button 
              type="button" 
              onClick={() => navigate("/signin")}
              className="font-semibold hover:underline" 
              style={{ color: BRAND.purple.base }}
            >
              Sign in
            </button>
          </p>
          
          {/* Infinite Logo Marquee */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-4">Trusted by candidates from</p>
            <div 
              className="relative overflow-hidden"
              style={{
                maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
              }}
            >
              <div className="flex animate-scroll items-center">
                {collegeLogos.map((logo, idx) => (
                  <img 
                    key={`a-${idx}`} 
                    src={logo.src} 
                    alt={logo.alt}
                    className="mx-8 h-8 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                ))}
                {collegeLogos.map((logo, idx) => (
                  <img 
                    key={`b-${idx}`} 
                    src={logo.src} 
                    alt={logo.alt}
                    className="mx-8 h-8 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Right Panel - Clean White Background with 3D Card */}
      <div 
        className="hidden lg:flex w-[55%] items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-white"
        onMouseMove={handleMouseMove}
        style={{ perspective: "1200px" }}
      >
        {/* Subtle gradient orbs for depth */}
        <div 
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, rgba(129, 95, 170, 0.15) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(39, 170, 231, 0.15) 0%, transparent 70%)" }}
        />

        {/* 3D Card */}
        <div ref={cardRef} className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
          <HeroCard3D mouseX={mouseX} mouseY={mouseY} cardMouseX={cardMouseX} cardMouseY={cardMouseY} />
        </div>
      </div>
    </div>
  )
}

export default SignUp
