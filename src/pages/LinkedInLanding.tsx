import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/auth/context"
import { useTheme } from "@/contexts/ThemeContext"
import { Sparkles, Search, TrendingUp, ArrowRight, ChevronRight, Loader2, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import resumeService from "@/services/api/resumeService"
import { useApp } from "@/contexts/AppContext"

interface SessionCard {
  id: string
  type: "create" | "review" | "improve"
  candidateName: string
  lastEdited: string
  score?: number
  status: "complete" | "in-progress" | "none"
}

export default function LinkedInLanding() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { actualTheme } = useTheme()
  const isDark = actualTheme === "dark"
  const [linkedInUrl, setLinkedInUrl] = React.useState("")
  const [sessions, setSessions] = React.useState<SessionCard[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true)

  const [selectedMode, setSelectedMode] = React.useState<"create" | "review" | "improve" | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [loadingMessage, setLoadingMessage] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { setLinkedInAudit, setParsedProfile } = useApp()

  // Extract first name from user
  const firstName = user?.attributes?.name?.split(" ")[0] || user?.username || "there"

  // Fetch recent sessions
  React.useEffect(() => {
    async function loadSessions() {
      try {
        setIsLoadingSessions(true)
        const resumes = await resumeService.listResumes(20) // Fetch more to filter

        // Only show LinkedIn profiles that have audit data
        const linkedInSessions: SessionCard[] = []
        
        for (const r of resumes) {
          try {
            const fullResume = await resumeService.getResume(r.id)
            const audit = fullResume?.linkedInAudit
            
            // Debug logging
            console.log(`Resume ${r.id}:`, {
              name: r.name,
              hasAudit: !!audit,
              auditKeys: audit ? Object.keys(audit) : [],
              status: (fullResume as any)?.status
            })
            
            // Check if audit exists and has meaningful data
            const hasAuditData = audit && (
              audit.userProfile || 
              (audit as any).checklistAudit?.banners ||
              (audit as any).optimizationReport ||
              (audit as any).banners // Direct checklist audit format
            )
            
            if (hasAuditData) {
              // Extract name from various possible locations
              const candidateName = 
                audit.userProfile?.fullName ||
                (audit as any).userProfile?.full_name ||
                (audit as any).checklistAudit?.userProfile?.fullName ||
                (fullResume as any).parsedProfile?.basics?.name ||
                r.name || 
                "LinkedIn Profile"
              
              // Extract score from various possible locations
              const score = 
                (audit as any).checklistAudit?.overall_score ||
                (audit as any).overall_score ||
                (audit as any).optimizationReport?.totalScore ||
                undefined
              
              console.log(`Found valid LinkedIn session: ${candidateName}, score: ${score}`)
              
              linkedInSessions.push({
                id: r.id,
                type: "review",
                candidateName,
                lastEdited: formatTimestamp(r.updatedAt),
                score: score,
                status: "complete" as const,
              })
              
              // Stop after finding 3 valid LinkedIn profiles
              if (linkedInSessions.length >= 3) break
            }
          } catch (error) {
            console.log(`Could not fetch data for resume ${r.id}:`, error)
          }
        }

        console.log(`Found ${linkedInSessions.length} LinkedIn sessions with audit data`)
        setSessions(linkedInSessions)
      } catch (error) {
        console.error("Failed to load sessions:", error)
      } finally {
        setIsLoadingSessions(false)
      }
    }

    loadSessions()
  }, [])

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleActionClick = (action: "create" | "review" | "improve") => {
    setSelectedMode(action)
    // Optional: Auto-focus input or scroll to it?
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedMode) return

    try {
      setIsUploading(true)

      if (selectedMode === "create") {
        // Create Mode: Upload Resume -> Parse -> Go to Create Workspace
        const result = await resumeService.uploadAndCreateLinkedInProject(file)
        setParsedProfile(result.parsedProfile) // Store parsed profile
        navigate(`/linkedin/create/${result.projectId}`, {
          state: { startMode: "create" }
        })
      } else {
        // Review/Improve Mode: Upload LinkedIn PDF -> Audit -> Go to Workspace
        const result = await resumeService.reviewLinkedInProfile(file)
        setLinkedInAudit(result.audit)
        navigate(`/linkedin/workspace/${result.projectId}`, {
          state: {
            linkedInAudit: result.audit,
            startMode: selectedMode
          }
        })
      }
    } catch (error) {
      console.error("Upload failed:", error)
      // TODO: Show error toast
    } finally {
      setIsUploading(false)
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleUrlSubmit = async () => {
    if (!linkedInUrl.trim() || !selectedMode) return

    // For review/improve modes with LinkedIn URL, extract directly
    if ((selectedMode === "review" || selectedMode === "improve") && linkedInUrl.trim()) {
      try {
        setIsExtracting(true)
        setLoadingMessage("Fetching your LinkedIn profile...")
        
        // PHASE 1: Fetch profile quickly (2-3 seconds)
        const profileResult = await resumeService.fetchLinkedInProfile(linkedInUrl.trim())
        
        // Store profile in context
        setParsedProfile(profileResult.profile)
        
        // Navigate to workspace immediately with profile data (no audit yet)
        navigate(`/linkedin/workspace/${profileResult.projectId}`, {
          state: {
            parsedProfile: profileResult.profile,
            startMode: selectedMode,
            isLoadingAudit: true, // Signal that audit is still loading
            linkedInUrl: linkedInUrl.trim(),
          },
        })
        
        // PHASE 2: Run audit in background (will be handled by workspace)
        // The workspace will poll or fetch the audit
        
      } catch (error) {
        console.error("URL extraction failed:", error)
        // TODO: Show error toast
        setIsExtracting(false)
      }
    } else {
      // For create mode or other cases, navigate to review page
      navigate("/linkedin/review", { state: { linkedInUrl, startMode: selectedMode } })
    }
  }

  const handleSessionClick = (sessionId: string, sessionType: "create" | "review" | "improve") => {
    navigate(`/linkedin/workspace/${sessionId}`, {
      state: { startMode: sessionType }
    })
  }

  return (
    <div className={cn(
      "min-h-screen font-['Inter',sans-serif] transition-colors relative",
      isDark ? "bg-[#0C0C0C]" : "bg-white"
    )}>
      <div className="max-w-2xl mx-auto pt-12 sm:pt-24 px-4 sm:px-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className={cn(
            "text-2xl sm:text-4xl font-medium tracking-tight",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Let's perfect your LinkedIn, {firstName}.
          </h1>
          <p className={cn(
            "text-sm sm:text-base mt-3 sm:mt-4",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            How would you like to begin?
          </p>
        </div>

        {/* Action Cards Grid - Responsive: 1 col on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Create */}
          <button
            onClick={() => handleActionClick("create")}
            className={cn(
              "relative w-full rounded-2xl sm:rounded-3xl border-[1.5px] transition-all duration-200",
              "h-auto min-h-[80px] sm:h-36 p-4 sm:p-0",
              "flex sm:block items-center gap-3 sm:gap-0",
              selectedMode === "create"
                ? (isDark ? "bg-[#202325] border-green-500/50 ring-1 ring-green-500/20" : "bg-white border-green-500 ring-1 ring-green-100")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            {/* Icon - flexbox on mobile, absolute on desktop */}
            <div className="sm:absolute sm:top-5 sm:left-5 flex-shrink-0">
              <Sparkles className={cn(
                "w-6 h-6 transition-colors",
                selectedMode === "create" ? "text-green-500" : (isDark ? "text-gray-400" : "text-gray-500")
              )} strokeWidth={1.5} />
            </div>

            {/* Text - inline on mobile, absolute on desktop */}
            <h3 className={cn(
              "sm:absolute sm:bottom-5 sm:left-5 sm:right-5 text-sm sm:text-base font-medium sm:text-center text-left flex-1",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Create profile using resume
            </h3>

            {/* Popular Badge - right side on mobile, top-right on desktop */}
            <div className="sm:absolute sm:top-5 sm:right-5 flex-shrink-0">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                isDark ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-50"
              )}>
                Popular
              </span>
            </div>
          </button>

          {/* Card 2: Review */}
          <button
            onClick={() => handleActionClick("review")}
            className={cn(
              "relative w-full rounded-2xl sm:rounded-3xl border-[1.5px] transition-all duration-200",
              "h-auto min-h-[80px] sm:h-36 p-4 sm:p-0",
              "flex sm:block items-center gap-3 sm:gap-0",
              selectedMode === "review"
                ? (isDark ? "bg-[#202325] border-blue-500/50 ring-1 ring-blue-500/20" : "bg-white border-blue-500 ring-1 ring-blue-100")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            <div className="sm:absolute sm:top-5 sm:left-5 flex-shrink-0">
              <Search className={cn(
                "w-6 h-6 transition-colors",
                selectedMode === "review" ? "text-blue-500" : (isDark ? "text-gray-400" : "text-gray-500")
              )} strokeWidth={1.5} />
            </div>

            <h3 className={cn(
              "sm:absolute sm:bottom-5 sm:left-5 sm:right-5 text-sm sm:text-base font-medium sm:text-center text-left flex-1",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Review your profile
            </h3>
          </button>

          {/* Card 3: Improve */}
          <button
            onClick={() => handleActionClick("improve")}
            className={cn(
              "relative w-full rounded-2xl sm:rounded-3xl border-[1.5px] transition-all duration-200",
              "h-auto min-h-[80px] sm:h-36 p-4 sm:p-0",
              "flex sm:block items-center gap-3 sm:gap-0",
              selectedMode === "improve"
                ? (isDark ? "bg-[#202325] border-[#815FAA]/50 ring-1 ring-[#815FAA]/20" : "bg-white border-[#815FAA] ring-1 ring-[#DFC4FF]/30")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            <div className="sm:absolute sm:top-5 sm:left-5 flex-shrink-0">
              <TrendingUp className={cn(
                "w-6 h-6 transition-colors",
                selectedMode === "improve" ? "text-[#815FAA]" : (isDark ? "text-gray-400" : "text-gray-500")
              )} strokeWidth={1.5} />
            </div>

            <h3 className={cn(
              "sm:absolute sm:bottom-5 sm:left-5 sm:right-5 text-sm sm:text-base font-medium sm:text-center text-left flex-1",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Improve your profile
            </h3>
          </button>
        </div>

        {/* Dynamic Input Bar */}
        <div className={cn(
          "mt-8 h-14 rounded-full shadow-sm flex items-center px-2 relative border transition-all duration-300",
          isDark
            ? "bg-[#202325] border-[#303437]"
            : "bg-white border-gray-200",
          selectedMode ? "opacity-100 translate-y-0" : "opacity-60 translate-y-2 pointer-events-none" // Fade out if no mode
        )}>
          {/* Attach Button (Visible when mode selected) */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 flex items-center",
            selectedMode ? "w-auto mr-2 opactiy-100" : "w-0 mr-0 opacity-0"
          )}>
            <button
              onClick={handleAttachClick}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                isDark
                  ? "bg-[#303437] hover:bg-[#404040] text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              ) : (
                <Paperclip className="w-4 h-4 text-gray-500" />
              )}
              <span>
                {isUploading ? "Uploading..." : selectedMode === "create" ? "Attach Resume PDF" : "Attach Linkedin PDF"}
              </span>
            </button>
          </div>

          <input
            type="text"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder={
              selectedMode === "create" ? "Or paste text content..." :
                "Paste your LinkedIn URL..."
            }
            className={cn(
              "flex-1 px-2 text-sm bg-transparent focus:outline-none",
              isDark
                ? "text-white placeholder:text-gray-500"
                : "text-gray-900 placeholder:text-gray-400"
            )}
            disabled={!selectedMode}
          />

          <button
            onClick={handleUrlSubmit}
            disabled={!linkedInUrl.trim() || isExtracting}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              isDark
                ? "bg-[#303437] hover:bg-[#404040]"
                : "bg-gray-100 hover:bg-gray-200"
            )}
          >
            {isExtracting ? (
              <Loader2 className={cn("w-5 h-5 animate-spin", isDark ? "text-gray-400" : "text-gray-600")} />
            ) : (
              <ArrowRight className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-gray-600")} />
            )}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Continue Your Journey */}
        {!isLoadingSessions && sessions.length > 0 && (
          <div className="mt-12">
            <h2 className={cn(
              "text-sm font-medium mb-4",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>Continue Your Journey</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {sessions.slice(0, 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session.id, session.type)}
                  className={cn(
                    "relative rounded-2xl border transition-colors text-left",
                    // Mobile: horizontal card layout
                    "flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0",
                    "p-3 sm:p-4 h-auto sm:h-36",
                    isDark
                      ? "bg-[#202325] border-[#303437] hover:border-[#815FAA]/50"
                      : "bg-white border-gray-100 hover:border-[#BC9CE2]"
                  )}
                >
                  {/* Icon - left on mobile, top-left on desktop */}
                  <div className={cn(
                    "w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-[#815FAA]/20" : "bg-[#815FAA]/10"
                  )}>
                    <Search className={cn("w-4 h-4", isDark ? "text-[#BC9CE2]" : "text-[#815FAA]")} />
                  </div>

                  {/* Content - middle on mobile, fills card on desktop */}
                  <div className="flex-1 sm:flex sm:flex-col sm:justify-between sm:mt-2 min-w-0">
                    <div className="space-y-0.5 sm:space-y-2">
                      <h3 className={cn(
                        "font-semibold text-sm line-clamp-1",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {session.candidateName}
                      </h3>

                      <p className={cn(
                        "text-[11px] line-clamp-1",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}>
                        Profile Review • {session.lastEdited}
                      </p>
                    </div>

                    {/* Continue link - hidden on mobile, shown on desktop */}
                    <div className={cn(
                      "hidden sm:flex items-center gap-1 text-xs font-medium mt-auto",
                      isDark ? "text-[#BC9CE2]" : "text-[#815FAA]"
                    )}>
                      <span>Continue</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Score Badge - right side on mobile, stays visible */}
                  {session.score !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded flex-shrink-0 self-center sm:absolute sm:top-4 sm:right-4",
                      session.score >= 80 
                        ? (isDark ? "text-emerald-400 bg-emerald-900/30" : "text-emerald-700 bg-emerald-50")
                        : session.score >= 50 
                          ? (isDark ? "text-amber-400 bg-amber-900/30" : "text-amber-700 bg-amber-50")
                          : (isDark ? "text-red-400 bg-red-900/30" : "text-red-700 bg-red-50")
                    )}>
                      {session.score}/100
                    </span>
                  )}

                  {/* Chevron - shown on mobile only */}
                  <ChevronRight className={cn(
                    "w-4 h-4 flex-shrink-0 sm:hidden",
                    isDark ? "text-gray-500" : "text-gray-400"
                  )} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isExtracting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={cn(
            "w-96 p-8 rounded-3xl shadow-2xl text-center",
            isDark ? "bg-[#202325]" : "bg-white"
          )}>
            <div className="mb-6">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#815FAA]" />
            </div>
            <h3 className={cn(
              "text-xl font-medium mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {loadingMessage}
            </h3>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              This may take a moment
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
