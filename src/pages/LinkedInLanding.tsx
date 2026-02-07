import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/auth/context"
import { useTheme } from "@/contexts/ThemeContext"
import { Sparkles, Search, TrendingUp, ArrowRight, ChevronRight, Loader2, Paperclip, ClipboardCheck, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import resumeService from "@/services/api/resumeService"
import { useApp } from "@/contexts/AppContext"
import { motion, AnimatePresence } from "framer-motion"

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
  
  // Ref to prevent duplicate API calls (React StrictMode runs effects twice)
  const sessionsLoadedRef = React.useRef(false)

  // Extract first name from user
  const firstName = user?.attributes?.name?.split(" ")[0] || user?.username || "there"

  // Fetch recent sessions - with guard against duplicate calls
  React.useEffect(() => {
    // Guard against duplicate calls from StrictMode or re-renders
    if (sessionsLoadedRef.current) {
      return
    }
    sessionsLoadedRef.current = true
    
    async function loadSessions() {
      try {
        setIsLoadingSessions(true)
        const resumes = await resumeService.listResumes(10)

        const linkedInSessions: SessionCard[] = []
        
        // First pass: check for LinkedIn-related items using name from summary
        for (const r of resumes) {
          // Skip items without a name (likely not LinkedIn analyses)
          if (!r.name) continue
          
          // Check if this looks like a LinkedIn analysis (has a person's name, not a file name)
          const isLinkedInAnalysis = r.name && !r.name.includes('.pdf') && !r.name.includes('.docx')
          
          if (isLinkedInAnalysis) {
            // Determine session type from serviceType field, or default to "review"
            const sessionType = (r.serviceType === "create" || r.serviceType === "improve") 
              ? r.serviceType 
              : "review" as const
            
            linkedInSessions.push({
              id: r.id,
              type: sessionType,
              candidateName: r.name,
              lastEdited: formatTimestamp(r.updatedAt),
              score: undefined, // Score will be loaded when they click
              status: "complete" as const,
            })
            
            if (linkedInSessions.length >= 3) break
          }
        }

        // If we don't have enough sessions, try fetching full data for items without names
        if (linkedInSessions.length < 3) {
          for (const r of resumes) {
            if (linkedInSessions.some(s => s.id === r.id)) continue
            if (linkedInSessions.length >= 3) break
            
            try {
              const fullResume = await resumeService.getResume(r.id)
              const audit = fullResume?.linkedInAudit
              
              const hasAuditData = audit && (
                audit.userProfile || 
                (audit as any).checklistAudit?.banners ||
                (audit as any).optimizationReport ||
                (audit as any).banners
              )
              
              if (hasAuditData) {
                const candidateName = 
                  audit.userProfile?.fullName ||
                  (audit as any).userProfile?.full_name ||
                  (audit as any).checklistAudit?.userProfile?.fullName ||
                  (fullResume as any).parsedProfile?.basics?.name ||
                  r.name || 
                  "LinkedIn Profile"
                
                const score = 
                  (audit as any).checklistAudit?.overall_score ||
                  (audit as any).overall_score ||
                  (audit as any).optimizationReport?.totalScore ||
                  undefined
                
                // Determine session type from serviceType
                const sessionType = ((fullResume as any).serviceType === "create" || (fullResume as any).serviceType === "improve") 
                  ? (fullResume as any).serviceType 
                  : "review" as const
                
                linkedInSessions.push({
                  id: r.id,
                  type: sessionType,
                  candidateName,
                  lastEdited: formatTimestamp(r.updatedAt),
                  score: score,
                  status: "complete" as const,
                })
              }
            } catch (error) {
              console.log(`Could not fetch data for resume ${r.id}:`, error)
            }
          }
        }

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
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedMode) return

    try {
      setIsUploading(true)

      if (selectedMode === "create") {
        setIsExtracting(true)
        setLoadingMessage("Transforming your resume into a LinkedIn profile...")
        // Upload resume and create project - same workspace for all modes
        const result = await resumeService.uploadAndCreateLinkedInProject(file)
        setParsedProfile(result.parsedProfile)
        navigate(`/linkedin/workspace/${result.projectId}`, {
          state: {
            parsedProfile: result.parsedProfile,
            startMode: "create",
            isLoadingAudit: true,
          }
        })
      } else {
        setIsExtracting(true)
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
    } finally {
      setIsUploading(false)
      setIsExtracting(false)
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleUrlSubmit = async () => {
    if (!linkedInUrl.trim() || !selectedMode) return

    if ((selectedMode === "review" || selectedMode === "improve") && linkedInUrl.trim()) {
      try {
        setIsExtracting(true)
        setLoadingMessage("Fetching your LinkedIn profile...")
        
        const profileResult = await resumeService.fetchLinkedInProfile(linkedInUrl.trim(), {
          serviceType: selectedMode
        })
        setParsedProfile(profileResult.profile)
        
        navigate(`/linkedin/workspace/${profileResult.projectId}`, {
          state: {
            parsedProfile: profileResult.profile,
            startMode: selectedMode,
            isLoadingAudit: true,
            linkedInUrl: linkedInUrl.trim(),
          },
        })
        
      } catch (error) {
        console.error("URL extraction failed:", error)
        setIsExtracting(false)
      }
    } else {
      navigate("/linkedin/review", { state: { linkedInUrl, startMode: selectedMode } })
    }
  }

  const handleSessionClick = (sessionId: string, sessionType: "create" | "review" | "improve") => {
    navigate(`/linkedin/workspace/${sessionId}`, {
      state: { startMode: sessionType }
    })
  }

  // Card configurations for the action cards
  const actionCards = [
    {
      id: "create" as const,
      icon: FileText,
      title: "Create from Resume",
      description: "Build a perfect profile in minutes",
      badge: null,
    },
    {
      id: "review" as const,
      icon: ClipboardCheck,
      title: "Review Profile",
      description: "Get an instant optimization score",
      badge: "Popular",
    },
    {
      id: "improve" as const,
      icon: TrendingUp,
      title: "Improve Profile",
      description: "AI-powered suggestions & fixes",
      badge: null,
    },
  ]

  return (
    <div className={cn(
      "min-h-screen font-['Inter',sans-serif] transition-colors relative flex flex-col",
      isDark ? "bg-[#0A0A0B]" : "bg-white"
    )}>
      {/* Main content - centered vertically */}
      <div className="relative flex-1 flex flex-col justify-center max-w-[680px] mx-auto w-full px-6 sm:px-8 py-8">
        {/* Header - Clean typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="text-center mb-10 sm:mb-12"
        >
          <h1 className={cn(
            "text-3xl sm:text-[46px] font-semibold tracking-tight leading-[1.15]",
            isDark ? "text-white" : "text-[#111827]"
          )}>
            Let's perfect your LinkedIn, {firstName}.
          </h1>
          <p className={cn(
            "text-base sm:text-[17px] mt-4",
            isDark ? "text-[#A1A1AA]" : "text-[#6B7280]"
          )}>
            How would you like to begin?
          </p>
        </motion.div>

        {/* Action Tiles Grid - Premium tactile cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
        >
          {actionCards.map((card) => {
            const isSelected = selectedMode === card.id
            const Icon = card.icon
            
            return (
              <motion.button
                key={card.id}
                onClick={() => handleActionClick(card.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative w-full rounded-[24px] transition-all duration-300 overflow-visible",
                  "h-auto min-h-[80px] sm:h-[160px] p-5 sm:p-6",
                  "flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0",
                  "text-left",
                  // No border - shadow-based depth with brand purple
                  isSelected
                    ? isDark 
                      ? "bg-[#1C1C1F] shadow-[0_8px_30px_rgba(129,95,170,0.2)] ring-2 ring-[#815FAA]/30" 
                      : "bg-white shadow-[0_8px_30px_rgba(129,95,170,0.15)] ring-2 ring-[#815FAA]/25"
                    : isDark 
                      ? "bg-[#111113] shadow-[0_4px_20px_rgb(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)] hover:ring-2 hover:ring-[#815FAA]/20" 
                      : "bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:ring-2 hover:ring-[#815FAA]/20"
                )}
              >
                {/* Floating "Popular" Badge */}
                {card.badge && (
                  <div className="absolute -top-2.5 -right-2 sm:-top-3 sm:-right-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#815FAA] to-[#684C8A] shadow-lg shadow-[#815FAA]/25">
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Icon container - 48x48 anchored */}
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isSelected ? "text-[#684C8A]" : (isDark ? "text-[#BC9CE2]" : "text-[#815FAA]")
                  )} strokeWidth={1.75} />
                </div>

                {/* Text content */}
                <div className="flex-1 sm:mt-auto">
                  <h3 className={cn(
                    "text-[15px] sm:text-[16px] font-semibold leading-snug",
                    isDark ? "text-white" : "text-[#111827]"
                  )}>
                    {card.title}
                  </h3>
                  <p className={cn(
                    "text-[12px] sm:text-[13px] mt-1 leading-relaxed",
                    isDark ? "text-[#71717A]" : "text-[#9CA3AF]"
                  )}>
                    {card.description}
                  </p>
                </div>

                {/* Selection indicator - subtle glow ring handled in container */}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Mega Pill Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
          className={cn(
            "mt-10 h-16 rounded-full flex items-center pl-3 pr-2 relative transition-all duration-300",
            isDark
              ? "bg-[#111113] shadow-[0_4px_20px_rgb(0,0,0,0.4),inset_0_1px_0_rgb(255,255,255,0.03)]"
              : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08),inset_0_-2px_4px_rgb(0,0,0,0.02)]",
            selectedMode ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2 pointer-events-none"
          )}
        >
          {/* Attach Button - Inside pill */}
          <AnimatePresence>
            {selectedMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden flex items-center mr-2"
              >
                <button
                  onClick={handleAttachClick}
                  disabled={isUploading}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap",
                    isDark
                      ? "bg-[#1C1C1F] hover:bg-[#252528] text-[#E4E4E7]"
                      : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151]"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#815FAA]" />
                  ) : (
                    <Paperclip className={cn("w-4 h-4", isDark ? "text-[#A1A1AA]" : "text-[#6B7280]")} />
                  )}
                  <span>
                    {isUploading ? "Uploading..." : selectedMode === "create" ? "Attach Resume" : "Attach PDF"}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
              "flex-1 px-3 text-[15px] bg-transparent focus:outline-none",
              isDark
                ? "text-white placeholder:text-[#52525B]"
                : "text-[#111827] placeholder:text-[#9CA3AF]"
            )}
            disabled={!selectedMode}
          />

          {/* Circular Go Button - sits inside the pill */}
          <button
            onClick={handleUrlSubmit}
            disabled={!linkedInUrl.trim() || isExtracting}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              linkedInUrl.trim() && !isExtracting
                ? "bg-gradient-to-r from-[#815FAA] to-[#684C8A] hover:from-[#684C8A] hover:to-[#5a4177] text-white shadow-lg shadow-[#815FAA]/30"
                : isDark
                  ? "bg-[#1C1C1F] text-[#52525B]"
                  : "bg-[#F3F4F6] text-[#D1D5DB]"
            )}
          >
            {isExtracting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </motion.div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Continue Your Journey - Floating strips */}
        <AnimatePresence>
          {!isLoadingSessions && sessions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16"
            >
              {/* Micro label */}
              <p className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.08em] mb-5",
                isDark ? "text-[#71717A]" : "text-[#9CA3AF]"
              )}>
                Continue Your Journey
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sessions.slice(0, 3).map((session, index) => (
                  <motion.button
                    key={session.id}
                    onClick={() => handleSessionClick(session.id, session.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "relative rounded-[24px] text-left transition-all duration-200",
                      "flex sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0",
                      "p-4 sm:p-4 h-auto sm:h-[150px] border",
                      isDark
                        ? "bg-[#111113] border-[#27272A] hover:border-[#3F3F46]"
                        : "bg-white border-[#E5E7EB] hover:border-[#D1D5DB]"
                    )}
                  >
                    {/* Icon - same purple palette for all types */}
                    <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                      {session.type === "create" ? (
                        <FileText className={cn("w-4 h-4", isDark ? "text-[#BC9CE2]" : "text-[#815FAA]")} />
                      ) : session.type === "improve" ? (
                        <TrendingUp className={cn("w-4 h-4", isDark ? "text-[#BC9CE2]" : "text-[#815FAA]")} />
                      ) : (
                        <ClipboardCheck className={cn("w-4 h-4", isDark ? "text-[#BC9CE2]" : "text-[#815FAA]")} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 sm:flex sm:flex-col sm:justify-between sm:mt-3 min-w-0">
                      <div className="space-y-1">
                        <h3 className={cn(
                          "font-semibold text-[15px] line-clamp-1",
                          isDark ? "text-white" : "text-[#111827]"
                        )}>
                          {session.candidateName}
                        </h3>

                        <p className={cn(
                          "text-[12px] line-clamp-1",
                          isDark ? "text-[#71717A]" : "text-[#9CA3AF]"
                        )}>
                          {session.type === "create" ? "Profile Creation" : session.type === "improve" ? "Profile Improvement" : "Profile Review"} • {session.lastEdited}
                        </p>
                      </div>

                      {/* Continue link - desktop only */}
                      <div className={cn(
                        "hidden sm:flex items-center gap-1.5 text-[13px] font-medium mt-auto",
                        isDark ? "text-[#BC9CE2]" : "text-[#815FAA]"
                      )}>
                        <span>Continue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Score Badge - Pill shaped */}
                    {session.score !== undefined && (
                      <span className={cn(
                        "px-3 py-1 text-[11px] font-semibold rounded-full flex-shrink-0 self-center sm:absolute sm:top-5 sm:right-5",
                        session.score >= 80 
                          ? (isDark ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-600 bg-emerald-50")
                          : session.score >= 50 
                            ? (isDark ? "text-amber-400 bg-amber-500/10" : "text-amber-600 bg-amber-50")
                            : (isDark ? "text-red-400 bg-red-500/10" : "text-red-600 bg-red-50")
                      )}>
                        {session.score}/100
                      </span>
                    )}

                    {/* Chevron - mobile only */}
                    <ChevronRight className={cn(
                      "w-5 h-5 flex-shrink-0 sm:hidden",
                      isDark ? "text-[#52525B]" : "text-[#D1D5DB]"
                    )} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay - Soft, rounded */}
      <AnimatePresence>
        {isExtracting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-[90vw] max-w-md p-10 rounded-[32px] text-center",
                isDark 
                  ? "bg-[#1C1C1F] shadow-[0_25px_80px_rgb(0_0_0/0.5)]" 
                  : "bg-white shadow-[0_25px_80px_rgb(0_0_0/0.15)]"
              )}
            >
              <div className="mb-8">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center",
                  isDark ? "bg-[#815FAA]/10" : "bg-[#DFC4FF]"
                )}>
                  <Loader2 className="w-8 h-8 animate-spin text-[#815FAA]" />
                </div>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-[#111827]"
              )}>
                {loadingMessage}
              </h3>
              <p className={cn(
                "text-[15px]",
                isDark ? "text-[#71717A]" : "text-[#6B7280]"
              )}>
                This may take a moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
