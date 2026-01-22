import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { CenteredAuthLayout } from "@/components/auth/AuthLayout"
import { useTheme } from "@/contexts/ThemeContext"
import { saveUserProfile } from "@/services/api/userService"
import { ChevronDown } from "lucide-react"

const BRAND = { purple: { base: "#815FAA" } }
type ThemeMode = "dark" | "light"

const ROLE_OPTIONS = [
  { value: "school_student", label: "School Student" },
  { value: "college_student", label: "College Student" },
  { value: "working_professional", label: "Working Professional" },
  { value: "aspirant", label: "Aspirant" },
  { value: "other", label: "Other" }
]

const SOURCE_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "online_ad", label: "Online Ad" },
  { value: "social_media", label: "Social Media" },
  { value: "google_search", label: "Google Search" },
  { value: "ai_search", label: "AI Search (ChatGPT, Perplexity..)" },
  { value: "event", label: "Event" },
  { value: "blog_article", label: "Blog/Article" },
  { value: "other", label: "Other" }
]

const COUNTRY_CODES = [
  { code: "+91" },
  { code: "+1" },
  { code: "+44" },
  { code: "+61" },
  { code: "+971" },
  { code: "+65" }
]

function StyledInput({ themeMode, className, ...props }: { themeMode: ThemeMode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const isDark = themeMode === "dark"
  return <input className={cn("w-full p-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2", isDark ? "bg-[#202325] border-[#303437] text-white placeholder:text-white/40 focus:ring-[#815FAA]/50" : "bg-[#F2F4F5] border-[#E3E5E5] text-[#0C0C0C] placeholder:text-[#0C0C0C]/40 focus:ring-[#815FAA]/50", className)} {...props} />
}

function CustomDropdown({ 
  themeMode, 
  value, 
  onChange, 
  options, 
  placeholder,
  required,
  disabled
}: { 
  themeMode: ThemeMode
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  required?: boolean
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const isDark = themeMode === "dark"
  
  const selectedOption = options.find(o => o.value === value)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      {required && <input type="text" value={value} required className="sr-only" onChange={() => {}} tabIndex={-1} />}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full p-3 pr-10 rounded-xl border text-sm text-left transition-all focus:outline-none focus:ring-2 disabled:opacity-50",
          isDark 
            ? "bg-[#202325] border-[#303437] focus:ring-[#815FAA]/50" 
            : "bg-white border-[#E3E5E5] focus:ring-[#815FAA]/50",
          selectedOption 
            ? (isDark ? "text-white" : "text-[#0C0C0C]")
            : (isDark ? "text-white/40" : "text-[#0C0C0C]/40")
        )}
      >
        {selectedOption?.label || placeholder}
      </button>
      
      <ChevronDown className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none transition-transform",
        isOpen && "rotate-180",
        isDark ? "text-white/60" : "text-[#0C0C0C]/40"
      )} />
      
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-2 py-2 rounded-xl border shadow-lg max-h-64 overflow-auto",
          isDark 
            ? "bg-[#202325] border-[#303437]" 
            : "bg-white border-[#E3E5E5]"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-4 py-3 text-sm text-left transition-colors",
                option.value === value
                  ? (isDark ? "bg-[#815FAA]/20 text-white" : "bg-[#F2F4F5] text-[#0C0C0C]")
                  : (isDark 
                      ? "text-white/80 hover:bg-[#303437]" 
                      : "text-[#0C0C0C] hover:bg-[#F2F4F5]")
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PersonalDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { actualTheme } = useTheme()
  const themeMode: ThemeMode = actualTheme === "dark" ? "dark" : "light"
  const isDark = themeMode === "dark"
  
  // Get email from navigation state (passed from OTP verification)
  const email = location.state?.email || ""
  
  const [fullName, setFullName] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("+91")
  const [phone, setPhone] = React.useState("")
  const [phoneTouched, setPhoneTouched] = React.useState(false)
  const [role, setRole] = React.useState("")
  const [source, setSource] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const isPhoneValid = phone.length === 10
  const showPhoneWarning = phoneTouched && phone.length > 0 && !isPhoneValid
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }
    
    setIsLoading(true)
    
    try {
      const profileData = {
        email,
        fullName,
        phone: countryCode + phone,
        role,
        source
      }
      
      // Save to backend API
      await saveUserProfile(profileData)
      
      // Navigate to usage goals
      navigate("/usage-goals", { state: { email, fullName } })
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to save profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CenteredAuthLayout mode={themeMode}>
      <div className="w-full max-w-sm mx-auto font-['Inter',sans-serif]">
        <div className="text-center mb-8">
          <h1 className={cn("text-2xl font-semibold mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
            Let's get you Job Ready
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
              Your name
            </label>
            <StyledInput 
              themeMode={themeMode}
              type="text" 
              placeholder="Enter your full name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
              Mobile number
            </label>
            <div className="flex gap-2">
              <div className="relative w-24">
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)} 
                  disabled={isLoading}
                  className={cn(
                    "w-full p-3 pr-8 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer disabled:opacity-50",
                    isDark 
                      ? "bg-[#202325] border-[#303437] text-white focus:ring-[#815FAA]/50" 
                      : "bg-white border-[#E3E5E5] text-[#0C0C0C] focus:ring-[#815FAA]/50"
                  )}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <ChevronDown className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                  isDark ? "text-white/60" : "text-[#0C0C0C]/40"
                )} />
              </div>
              <StyledInput 
                themeMode={themeMode}
                type="tel" 
                placeholder="Enter mobile number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                onBlur={() => setPhoneTouched(true)}
                required 
                className="flex-1" 
                disabled={isLoading}
              />
            </div>
            {showPhoneWarning && (
              <p className="text-[#FB7D7D] text-sm mt-1.5">
                Please enter a valid 10-digit mobile number
              </p>
            )}
          </div>
          
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
              How would you describe yourself?
            </label>
            <CustomDropdown 
              themeMode={themeMode}
              value={role} 
              onChange={setRole} 
              options={ROLE_OPTIONS} 
              placeholder="Select an option"
              required 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
              Where did you know about us?
            </label>
            <CustomDropdown 
              themeMode={themeMode}
              value={source} 
              onChange={setSource} 
              options={SOURCE_OPTIONS} 
              placeholder="Select an option"
              required 
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-[#FB7D7D] text-sm" role="alert">
              {error}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !role || !source || !isPhoneValid}
            className="w-full p-3 rounded-xl font-medium text-white disabled:opacity-50 mt-2 transition-opacity" 
            style={{ backgroundColor: BRAND.purple.base }}
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </CenteredAuthLayout>
  )
}

export default PersonalDetails
