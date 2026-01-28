import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/auth/context"
import { useTheme } from "@/contexts/ThemeContext"
import { Sparkles, Search, TrendingUp, ArrowRight, ChevronRight, Loader2, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import resumeService from "@/services/api/resumeService"
import { useApp } from "@/contexts/AppContext"
import type { ResumeItemSummary } from "@/services/api/types"

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
        const resumes = await resumeService.listResumes(10)

        // Map resumes to session cards - fetch full data to get LinkedIn profile name
        const mappedSessions: SessionCard[] = await Promise.all(
          resumes
            .filter((r: ResumeItemSummary) => r.name) // Only show named projects
            .map(async (r: ResumeItemSummary) => {
              // Determine type based on name patterns
              let type: "create" | "review" | "improve" = "review"
              const nameLower = r.name?.toLowerCase() || ""

              // Check for explicit type indicators in name
              if (nameLower.includes("create") || nameLower.includes("creation")) {
                type = "create"
              } else if (nameLower.includes("improve") || nameLower.includes("improvement") || nameLower.includes("optimization")) {
                type = "improve"
              } else if (nameLower.includes("review") || nameLower.includes("audit")) {
                type = "review"
              }
              // If name contains "linkedin" but no specific type, check for resume indicators
              else if (nameLower.includes("resume") && !nameLower.includes("linkedin")) {
                type = "create" // Resume upload typically means profile creation
              }

              // Try to fetch full resume data to get LinkedIn profile name
              let candidateName = r.name || "Unnamed Project"
              try {
                const fullResume = await resumeService.getResume(r.id)
                if (fullResume?.linkedInAudit?.userProfile?.fullName) {
                  candidateName = fullResume.linkedInAudit.userProfile.fullName
                }
              } catch (error) {
                console.log(`Could not fetch full data for resume ${r.id}:`, error)
              }

              return {
                id: r.id,
                type,
                candidateName,
                lastEdited: formatTimestamp(r.updatedAt),
                status: "complete" as const,
              }
            })
        )

        setSessions(mappedSessions)
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
        
        // Cycle through loading messages
        const messages = [
          "Evaluating your LinkedIn...",
          "Analyzing your profile...",
          "Almost ready...",
          "How's the weather outside?",
          "Crunching the numbers...",
          "Almost done..."
        ]
        
        let messageIndex = 0
        setLoadingMessage(messages[0])
        
        const messageInterval = setInterval(() => {
          messageIndex = (messageIndex + 1) % messages.length
          setLoadingMessage(messages[messageIndex])
        }, 2000) // Change message every 2 seconds

        const result = await resumeService.extractLinkedInFromUrl(linkedInUrl.trim())
        
        clearInterval(messageInterval)
        
        // Store audit in context
        setLinkedInAudit(result.audit)

        // Navigate to workspace
        navigate(`/linkedin/workspace/${result.projectId}`, {
          state: {
            linkedInAudit: result.audit,
            startMode: selectedMode,
          },
        })
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

  const handleSessionClick = (sessionId: string) => {
    navigate(`/linkedin/workspace/${sessionId}`)
  }

  const getTypeDisplay = (type: "create" | "review" | "improve"): string => {
    if (type === "create") return "Profile Creation"
    if (type === "review") return "Profile Review"
    return "Profile Improvement"
  }

  return (
    <div className={cn(
      "min-h-screen font-['Inter',sans-serif] transition-colors relative",
      isDark ? "bg-[#0C0C0C]" : "bg-white"
    )}>
      <div className="max-w-2xl mx-auto pt-24 px-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={cn(
            "text-4xl font-medium tracking-tight",
            isDark ? "text-white" : "text-gray-900"
          )}>
            Let's perfect your LinkedIn, {firstName}.
          </h1>
          <p className={cn(
            "text-base mt-4",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            How would you like to begin?
          </p>
        </div>

        {/* Action Cards Grid - Strict 3-Column */}
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1: Create */}
          <button
            onClick={() => handleActionClick("create")}
            className={cn(
              "relative w-full h-36 rounded-3xl border-[1.5px] transition-all duration-200",
              selectedMode === "create"
                ? (isDark ? "bg-[#202325] border-green-500/50 ring-1 ring-green-500/20" : "bg-white border-green-500 ring-1 ring-green-100")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            {/* Popular Badge */}
            <div className="absolute top-5 right-5">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                isDark ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-50"
              )}>
                Popular
              </span>
            </div>

            <Sparkles className={cn(
              "absolute top-5 left-5 w-6 h-6 transition-colors",
              selectedMode === "create" ? "text-green-500" : (isDark ? "text-gray-400" : "text-gray-500")
            )} strokeWidth={1.5} />

            <h3 className={cn(
              "absolute bottom-5 left-5 right-5 text-base font-medium text-center",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Create profile using resume
            </h3>
          </button>

          {/* Card 2: Review */}
          <button
            onClick={() => handleActionClick("review")}
            className={cn(
              "relative w-full h-36 rounded-3xl border-[1.5px] transition-all duration-200",
              selectedMode === "review"
                ? (isDark ? "bg-[#202325] border-blue-500/50 ring-1 ring-blue-500/20" : "bg-white border-blue-500 ring-1 ring-blue-100")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            <Search className={cn(
              "absolute top-5 left-5 w-6 h-6 transition-colors",
              selectedMode === "review" ? "text-blue-500" : (isDark ? "text-gray-400" : "text-gray-500")
            )} strokeWidth={1.5} />

            <h3 className={cn(
              "absolute bottom-5 left-5 right-5 text-base font-medium text-center",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Review your profile
            </h3>
          </button>

          {/* Card 3: Improve */}
          <button
            onClick={() => handleActionClick("improve")}
            className={cn(
              "relative w-full h-36 rounded-3xl border-[1.5px] transition-all duration-200",
              selectedMode === "improve"
                ? (isDark ? "bg-[#202325] border-purple-500/50 ring-1 ring-purple-500/20" : "bg-white border-purple-500 ring-1 ring-purple-100")
                : (isDark ? "bg-[#202325] border-[#303437] hover:bg-[#2a2d30]" : "bg-white border-[#E5E7EB] hover:bg-gray-50")
            )}
          >
            <TrendingUp className={cn(
              "absolute top-5 left-5 w-6 h-6 transition-colors",
              selectedMode === "improve" ? "text-purple-500" : (isDark ? "text-gray-400" : "text-gray-500")
            )} strokeWidth={1.5} />

            <h3 className={cn(
              "absolute bottom-5 left-5 right-5 text-base font-medium text-center",
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

            <div className="grid grid-cols-3 gap-4">
              {sessions.slice(0, 3).map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={cn(
                    "h-36 p-4 rounded-2xl flex flex-col justify-between text-left border transition-colors",
                    isDark
                      ? "bg-[#202325] border-[#303437] hover:border-purple-500/50"
                      : "bg-white border-gray-100 hover:border-purple-200"
                  )}
                >
                  {/* Top Section */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        isDark
                          ? (session.type === "create" ? "bg-green-900/20" : session.type === "improve" ? "bg-purple-900/20" : "bg-blue-900/20")
                          : (session.type === "create" ? "bg-green-50" : session.type === "improve" ? "bg-purple-50" : "bg-blue-50")
                      )}>
                        {session.type === "create" ? (
                          <Sparkles className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-600")} />
                        ) : session.type === "improve" ? (
                          <TrendingUp className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                        ) : (
                          <Search className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                        )}
                      </div>

                      {/* Status Badge */}
                      {session.type === "review" && session.score && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-medium rounded",
                          isDark ? "text-yellow-400 bg-yellow-900/30" : "text-yellow-700 bg-yellow-50"
                        )}>
                          Score: {session.score}
                        </span>
                      )}
                      {session.type === "improve" && session.status === "in-progress" && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-medium rounded",
                          isDark ? "text-blue-400 bg-blue-900/30" : "text-blue-700 bg-blue-50"
                        )}>
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3 className={cn(
                      "font-semibold text-sm line-clamp-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {getTypeDisplay(session.type)}
                    </h3>

                    <p className={cn(
                      "text-[11px] line-clamp-2",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}>
                      {session.candidateName} • {session.lastEdited}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isDark ? "text-purple-400" : "text-purple-600"
                  )}>
                    <span>Resume</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
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
