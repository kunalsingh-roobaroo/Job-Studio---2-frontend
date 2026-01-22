import * as React from "react"
import { useNavigate } from "react-router-dom"
import { 
  Upload, 
  Link2, 
  ClipboardPaste, 
  PenLine, 
  ArrowRight, 
  Clock,
  X,
  FileText,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/AppContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuthUser } from "@/auth/hooks"
import resumeService from "@/services/api/resumeService"
import type { ResumeItemSummary } from "@/services/api/types"
import { cn } from "@/lib/utils"

type ActionMode = "upload" | "link" | "paste" | "manual" | null

// Example data for when there are no real resumes
const EXAMPLE_RESUMES = [
  {
    id: "example-1",
    role: "Product Designer",
    company: "Airbnb",
    score: 94,
    scoreLabel: "94% Match",
    scoreType: "success" as const,
    time: "2h ago",
    icon: "A",
    iconBg: "#FF385C",
  },
  {
    id: "example-2",
    role: "Frontend Engineer",
    company: "Vercel",
    score: 78,
    scoreLabel: "78% Match",
    scoreType: "warning" as const,
    time: "1d ago",
    icon: "▲",
    iconBg: "#000000",
  },
  {
    id: "example-3",
    role: "Data Scientist",
    company: "Spotify",
    score: null,
    scoreLabel: "Optimization Pending",
    scoreType: "pending" as const,
    time: "3d ago",
    icon: "S",
    iconBg: "#1DB954",
  },
]

function Home() {
  const navigate = useNavigate()
  const { actualTheme } = useTheme()
  const isDark = actualTheme === "dark"
  const { user } = useAuthUser()
  const attrs = user?.attributes ?? {}
  const userName = attrs.name || attrs.email?.split("@")[0] || "there"

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const {
    selectedFile,
    setSelectedFile,
    setJobDetails,
    setResumeS3Key,
    setResumeEvaluation,
    isUploading,
    setIsUploading,
    uploadError,
    setUploadError,
  } = useApp()

  const [activeMode, setActiveMode] = React.useState<ActionMode>(null)
  const [targetRole, setTargetRole] = React.useState("")
  const [jobLink, setJobLink] = React.useState("")
  const [jobDescription, setJobDescription] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState("")
  const [recentResumes, setRecentResumes] = React.useState<ResumeItemSummary[]>([])
  const [isLoadingRecents, setIsLoadingRecents] = React.useState(true)

  // Fetch recent resumes
  React.useEffect(() => {
    let mounted = true
    const fetchRecents = async () => {
      try {
        const items = await resumeService.listResumes()
        if (mounted) setRecentResumes(items.slice(0, 4))
      } catch (e) {
        // Failed to load recent resumes
      } finally {
        if (mounted) setIsLoadingRecents(false)
      }
    }
    fetchRecents()
    return () => { mounted = false }
  }, [])

  const actionCards = [
    { id: "upload" as const, icon: Upload, title: "Upload", subtitle: "Resume file", popular: true },
    { id: "link" as const, icon: Link2, title: "Link", subtitle: "Job posting URL" },
    { id: "paste" as const, icon: ClipboardPaste, title: "Paste", subtitle: "Job description" },
    { id: "manual" as const, icon: PenLine, title: "Manual", subtitle: "Enter details" },
  ]

  function handleCardClick(mode: ActionMode) {
    if (mode === "upload") {
      fileInputRef.current?.click()
    } else {
      setActiveMode(activeMode === mode ? null : mode)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (["pdf", "doc", "docx"].includes(ext || "") && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file)
      setActiveMode("upload")
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (activeMode === "upload") setActiveMode(null)
  }

  async function handleSubmit() {
    if (!selectedFile && !jobLink && !jobDescription && !targetRole.trim()) return

    // Parse target role for job title and company
    const parts = targetRole.split(" at ")
    const jobTitle = parts[0]?.trim() || "General"
    const company = parts[1]?.trim() || ""

    const jobDetailsData = { 
      jobTitle, 
      company, 
      industry: "", 
      linkedin: jobLink, 
      jobDescription 
    }
    setJobDetails(jobDetailsData)

    if (!selectedFile) {
      // If no file, just navigate to home with job details set
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      setUploadProgress("Generating upload URL...")

      const { uploadUrl, key } = await resumeService.generateUploadUrl(selectedFile.name, selectedFile.type)
      setUploadProgress("Uploading resume...")

      await resumeService.uploadResumeToS3(selectedFile, uploadUrl)
      setResumeS3Key(key)
      setUploadProgress("Analyzing resume...")

      const evaluationResponse = await resumeService.evaluateResume({
        resume_s3_key: key,
        job_title: jobDetailsData.jobTitle,
        company: jobDetailsData.company,
        industry: jobDetailsData.industry,
        linkedin: jobDetailsData.linkedin,
        job_description: jobDetailsData.jobDescription,
      })

      setResumeEvaluation(evaluationResponse.id, evaluationResponse.resume_evaluation)
      setUploadProgress("Complete!")
      navigate(`/resume/${evaluationResponse.id}/evaluation`)
    } catch (error: any) {
      let errorMessage = "Failed to process resume. Please try again."
      if (error?.detail) {
        errorMessage = Array.isArray(error.detail)
          ? error.detail.map((e: any) => e.msg || String(e)).join(", ")
          : String(error.detail)
      } else if (error?.message) errorMessage = error.message
      setUploadError(errorMessage)
      setUploadProgress("")
    } finally {
      setIsUploading(false)
    }
  }

  function handleRecentClick(resumeId: string) {
    navigate(`/resume/${resumeId}/evaluation`)
  }

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className={cn(
      "min-h-screen font-['Inter',sans-serif] antialiased relative overflow-hidden",
      isDark 
        ? "bg-[radial-gradient(ellipse_at_top_left,_#1a1025_0%,_#0B0B0C_40%,_#000000_100%)]" 
        : "bg-white"
    )}>
      {/* Purple Glow Orb - Dark mode only */}
      {isDark && (
        <div 
          className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(129,95,170,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            transform: 'translate(20%, -20%)',
          }}
        />
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-[900px] mx-auto px-6 py-16 relative z-10">
        {/* Greeting - Left aligned for F-pattern scanning */}
        <div className="mb-12">
          <h1 
            className={cn(
              "text-3xl md:text-4xl font-medium tracking-tight",
              isDark ? "text-white" : "text-[#0F172A]"
            )}
            style={isDark ? { textShadow: '0 2px 10px rgba(0,0,0,0.3)' } : undefined}
          >
            Ready to land your dream job, {userName}?
          </h1>
          <p className={cn(
            "mt-3 text-base",
            isDark ? "text-gray-300" : "text-gray-500"
          )}>
            Select a method to start your optimization.
          </p>
        </div>

        {/* Action Cards Grid - Organic rounded-2xl with heavy soft shadows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {actionCards.map((card) => {
            const isActive = activeMode === card.id || (card.id === "upload" && selectedFile)
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200",
                  "cursor-pointer group",
                  isActive && "-translate-y-1"
                )}
                style={{
                  background: isDark 
                    ? 'rgba(255,255,255,0.05)' 
                    : '#FFFFFF',
                  backdropFilter: isDark ? 'blur(20px)' : undefined,
                  WebkitBackdropFilter: isDark ? 'blur(20px)' : undefined,
                  border: isDark 
                    ? '1px solid rgba(255,255,255,0.1)' 
                    : 'none',
                  boxShadow: isActive
                    ? isDark 
                      ? '0 0 30px -10px rgba(129,95,170,0.5), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                      : '0 20px 40px rgb(0,0,0,0.1), 0 0 0 1px rgba(129,95,170,0.2)'
                    : isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 0 30px -10px rgba(129,95,170,0.3), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                      : '0 20px 40px rgb(0,0,0,0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)'
                  }
                }}
              >
                {card.popular && (
                  <span className="absolute top-2 right-2 text-[10px] font-medium text-green-500">
                    Popular
                  </span>
                )}
                <card.icon 
                  className={cn(
                    "h-6 w-6 mb-3 transition-colors",
                    isActive ? "text-[#815FAA]" : isDark ? "text-gray-300" : "text-gray-500"
                  )} 
                  strokeWidth={1.5}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-[#0F172A]"
                )}>
                  {card.title}
                </span>
                <span className={cn(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  {card.subtitle}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              backdropFilter: isDark ? 'blur(20px)' : undefined,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: isDark 
                ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                : '0 8px 30px rgb(0,0,0,0.06)',
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#815FAA]/20">
              <FileText className="h-5 w-5 text-[#815FAA]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isDark ? "text-white" : "text-[#0F172A]"
              )}>
                {selectedFile.name}
              </p>
              <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isDark ? "hover:bg-white/10 text-gray-300" : "hover:bg-black/5 text-gray-500"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Expandable Input Areas */}
        {activeMode === "link" && (
          <div 
            className="rounded-2xl p-4 mb-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              backdropFilter: isDark ? 'blur(20px)' : undefined,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: isDark 
                ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                : '0 8px 30px rgb(0,0,0,0.06)',
            }}
          >
            <input
              type="url"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="Paste LinkedIn or job posting URL..."
              className={cn(
                "w-full bg-transparent text-sm focus:outline-none",
                isDark ? "text-white placeholder:text-gray-500" : "text-[#0F172A] placeholder:text-gray-400"
              )}
            />
          </div>
        )}

        {activeMode === "paste" && (
          <div 
            className="rounded-2xl p-4 mb-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              backdropFilter: isDark ? 'blur(20px)' : undefined,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: isDark 
                ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                : '0 8px 30px rgb(0,0,0,0.06)',
            }}
          >
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className={cn(
                "w-full bg-transparent text-sm focus:outline-none resize-none",
                isDark ? "text-white placeholder:text-gray-500" : "text-[#0F172A] placeholder:text-gray-400"
              )}
            />
          </div>
        )}

        {/* Central Input Bar - Hero Pill Shape */}
        <div 
          className="flex items-center gap-3 px-6 rounded-full"
          style={{
            height: '64px',
            background: isDark 
              ? 'rgba(0,0,0,0.5)' 
              : '#FFFFFF',
            backdropFilter: isDark ? 'blur(20px)' : undefined,
            WebkitBackdropFilter: isDark ? 'blur(20px)' : undefined,
            border: isDark 
              ? '1px solid rgba(255,255,255,0.1)' 
              : 'none',
            boxShadow: isDark 
              ? '0 0 40px -15px rgba(129,95,170,0.3), inset 0 1px 0 0 rgba(255,255,255,0.05)' 
              : '0 10px 40px -10px rgba(0,0,0,0.1)',
          }}
        >
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Role & Company (e.g. Product Manager at Google)..."
            className={cn(
              "flex-1 bg-transparent text-sm focus:outline-none",
              isDark ? "text-white placeholder:text-gray-500" : "text-[#0F172A] placeholder:text-gray-400"
            )}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            disabled={isUploading || (!selectedFile && !targetRole.trim())}
            size="icon"
            className="h-11 w-11 rounded-full bg-[#815FAA] hover:bg-[#6B4E8A] disabled:opacity-40"
            style={{
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2), 0 4px 12px rgba(129, 95, 170, 0.4)',
            }}
          >
            <ArrowRight className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Progress/Error */}
        {(uploadProgress || uploadError) && (
          <div className="mt-4 text-center">
            {uploadProgress && (
              <p className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                {uploadProgress}
              </p>
            )}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>
        )}

        {/* Recent Optimizations */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 
              className={cn(
                "text-lg font-medium tracking-tight",
                isDark ? "text-white" : "text-[#0F172A]"
              )}
              style={isDark ? { textShadow: '0 2px 10px rgba(0,0,0,0.3)' } : undefined}
            >
              Recent Optimizations
            </h2>
            <Clock className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} strokeWidth={1.5} />
          </div>

          {isLoadingRecents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl animate-pulse"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    boxShadow: isDark ? undefined : '0 8px 30px rgb(0,0,0,0.06)',
                  }}
                />
              ))}
            </div>
          ) : recentResumes.length > 0 ? (
            // Real resumes from API
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentResumes.slice(0, 3).map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => handleRecentClick(resume.id)}
                  className="flex flex-col items-start p-4 rounded-2xl transition-all duration-200 cursor-pointer text-left group"
                  style={{
                    background: isDark 
                      ? 'rgba(255,255,255,0.05)' 
                      : '#FFFFFF',
                    backdropFilter: isDark ? 'blur(20px)' : undefined,
                    WebkitBackdropFilter: isDark ? 'blur(20px)' : undefined,
                    border: isDark 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : 'none',
                    boxShadow: isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 0 30px -10px rgba(129,95,170,0.3), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                      : '0 20px 40px rgb(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#815FAA]/20">
                      <FileText className="h-5 w-5 text-[#815FAA]" />
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm font-medium truncate w-full",
                    isDark ? "text-white" : "text-[#0F172A]"
                  )}>
                    {resume.name || "Untitled Resume"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                      {resume.createdAt ? formatTimeAgo(new Date(resume.createdAt * 1000).toISOString()) : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Example data when no real resumes exist - Application Tracker Cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAMPLE_RESUMES.map((example) => (
                <div
                  key={example.id}
                  className="group p-5 rounded-2xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: isDark 
                      ? 'rgba(255,255,255,0.05)' 
                      : '#FFFFFF',
                    backdropFilter: isDark ? 'blur(20px)' : undefined,
                    WebkitBackdropFilter: isDark ? 'blur(20px)' : undefined,
                    border: isDark 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : 'none',
                    boxShadow: isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark
                      ? '0 0 30px -10px rgba(129,95,170,0.3), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                      : '0 20px 40px rgb(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'
                    e.currentTarget.style.boxShadow = isDark 
                      ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' 
                      : '0 8px 30px rgb(0,0,0,0.06)'
                  }}
                >
                  {/* Header: Logo + Score Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-white border"
                      style={{ 
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                      }}
                    >
                      <span style={{ color: example.iconBg }}>{example.icon}</span>
                    </div>
                    {/* Subtle Badges */}
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full border",
                      example.scoreType === "success" && "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                      example.scoreType === "warning" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
                      example.scoreType === "pending" && "bg-gray-500/10 text-gray-500 border-gray-500/20"
                    )}>
                      {example.scoreLabel}
                    </span>
                  </div>
                  
                  {/* Body: Role + Company */}
                  <div className="mb-4">
                    <h3 
                      className={cn(
                        "text-base font-semibold mb-1 tracking-tight",
                        isDark ? "text-white" : "text-[#0F172A]"
                      )}
                      style={isDark ? { textShadow: '0 1px 4px rgba(0,0,0,0.2)' } : undefined}
                    >
                      {example.role}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {example.company}
                    </p>
                  </div>
                  
                  {/* Footer: Time + Action */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )}>
                      Edited {example.time}
                    </span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all duration-200",
                      "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5",
                      "text-[#815FAA]"
                    )} strokeWidth={1.5} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
