import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { CenteredAuthLayout } from "@/components/auth/AuthLayout"
import { useTheme } from "@/contexts/ThemeContext"
import { saveUserPreferences } from "@/services/api/userService"
import { FileText, Target, PenTool, Award, Mic, MessageSquare, HelpCircle, Linkedin } from "lucide-react"

const BRAND = { purple: { base: "#815FAA" } }
type ThemeMode = "dark" | "light"

const USAGE_GOALS = [
  { id: "resume_evaluation", label: "Resume Evaluation", icon: FileText, color: { light: "#815FAA", dark: "#BC9CE2" } },
  { id: "ats_compatibility", label: "ATS Compatibility", icon: Target, color: { light: "#27AAE7", dark: "#57C2F3" } },
  { id: "resume_rewrite", label: "Resume Rewrite", icon: PenTool, color: { light: "#10B981", dark: "#34D399" } },
  { id: "credibility_builder", label: "Credibility Builder", icon: Award, color: { light: "#F59E0B", dark: "#FBBF24" } },
  { id: "elevator_pitch", label: "Elevator Pitch", icon: Mic, color: { light: "#EF4444", dark: "#F87171" } },
  { id: "interview_prep", label: "Interview Prep", icon: MessageSquare, color: { light: "#EC4899", dark: "#F472B6" } },
  { id: "resume_questionnaire", label: "Resume Questionnaire", icon: HelpCircle, color: { light: "#8B5CF6", dark: "#A78BFA" } },
  { id: "linkedin_optimization", label: "LinkedIn Optimisation", icon: Linkedin, color: { light: "#0077B5", dark: "#00A0DC" } }
]

function UsageGoals() {
  const navigate = useNavigate()
  const { actualTheme } = useTheme()
  const themeMode: ThemeMode = actualTheme === "dark" ? "dark" : "light"
  const isDark = themeMode === "dark"
  
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([])
  const [hoveredGoal, setHoveredGoal] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => 
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }
  
  const saveAndNavigate = async (goals: string[]) => {
    setError(null)
    setIsLoading(true)
    
    try {
      // Save to backend API
      await saveUserPreferences({ usageGoals: goals })
      
      // Navigate to home
      navigate("/", { replace: true })
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to save preferences. Please try again.")
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGoals.length > 0) {
      await saveAndNavigate(selectedGoals)
    }
  }
  
  const handleSkip = async () => {
    await saveAndNavigate([])
  }

  return (
    <CenteredAuthLayout mode={themeMode}>
      <div className="w-full max-w-md mx-auto font-['Inter',sans-serif]">
        <div className="text-center mb-8">
          <h1 className={cn("text-2xl font-semibold mb-2", isDark ? "text-white" : "text-[#0C0C0C]")}>
            What brings you here?
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-[#0C0C0C]/60")}>
            Select all that apply
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {USAGE_GOALS.map((goal) => { 
              const Icon = goal.icon
              const isSelected = selectedGoals.includes(goal.id)
              const isHovered = hoveredGoal === goal.id
              const accentColor = isDark ? goal.color.dark : goal.color.light
              
              return (
                <button 
                  key={goal.id} 
                  type="button" 
                  onClick={() => toggleGoal(goal.id)}
                  onMouseEnter={() => setHoveredGoal(goal.id)}
                  onMouseLeave={() => setHoveredGoal(null)}
                  disabled={isLoading}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50",
                    isDark ? "bg-[#202325]" : "bg-[#F2F4F5]"
                  )}
                  style={{
                    borderColor: isSelected ? accentColor : isHovered ? accentColor : isDark ? "#303437" : "#E3E5E5",
                    backgroundColor: isSelected 
                      ? `${accentColor}15` 
                      : isHovered 
                        ? `${accentColor}10` 
                        : isDark ? "#202325" : "#F2F4F5",
                  }}
                >
                  <Icon 
                    className="h-6 w-6 transition-colors duration-200" 
                    style={{ 
                      color: isSelected || isHovered ? accentColor : isDark ? "rgba(255,255,255,0.6)" : "rgba(12,12,12,0.6)" 
                    }} 
                  />
                  <span 
                    className="text-xs font-medium text-center transition-colors duration-200"
                    style={{ 
                      color: isSelected || isHovered ? accentColor : isDark ? "#fff" : "#0C0C0C" 
                    }}
                  >
                    {goal.label}
                  </span>
                </button>
              )
            })}
          </div>
          
          {error && (
            <p className="text-[#FB7D7D] text-sm text-center" role="alert">
              {error}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={selectedGoals.length === 0 || isLoading}
            className="w-full p-3 rounded-xl font-medium text-white disabled:opacity-50 transition-opacity" 
            style={{ backgroundColor: BRAND.purple.base }}
          >
            {isLoading ? "Setting up..." : "Get Started"}
          </button>
          
          <p className="text-center">
            <button 
              type="button" 
              onClick={handleSkip}
              disabled={isLoading}
              className={cn(
                "text-sm transition-colors disabled:opacity-50",
                isDark ? "text-white/40 hover:text-white/60" : "text-[#0C0C0C]/40 hover:text-[#0C0C0C]/60"
              )}
            >
              Skip for now
            </button>
          </p>
        </form>
      </div>
    </CenteredAuthLayout>
  )
}

export default UsageGoals
