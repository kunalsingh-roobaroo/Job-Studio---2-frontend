import * as React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuthContext } from "@/auth/context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import resumeService from "@/services/api/resumeService"
import type {
  LinkedInAudit,
  UnifiedLinkedInAudit,
  ParsedProfile
} from "@/services/api/types"
import { CreationCard } from "@/components/CreationCard"
import { ChatShell } from "@/components/chat/ChatShell"
import { OptimizationSidebar } from "@/components/OptimizationSidebar"
import { AskAIButton } from "@/components/AskAIButton"
import { useApp } from "@/contexts/AppContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { convertAuditToUnified } from "@/utils/auditAdapter"

type WorkspaceMode = "review" | "improve" | "create"
type RightPanelState = "preview" | "copilot"
type PreviewMode = "existing" | "improved"
type CreateViewMode = "sections" | "overview"

// AboutSection component with Read More functionality
function AboutSection({ content, isDark }: { content: string; isDark: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [needsTruncation, setNeedsTruncation] = React.useState(false)

  // Check if content overflows 2 lines
  React.useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight)
      const maxHeight = lineHeight * 2 // 2 lines
      const actualHeight = contentRef.current.scrollHeight
      setNeedsTruncation(actualHeight > maxHeight + 5) // +5px tolerance
    }
  }, [content])

  return (
    <div>
      <div
        ref={contentRef}
        className={cn(
          "text-sm leading-relaxed whitespace-pre-line overflow-hidden",
          isDark ? "text-gray-300" : "text-gray-700",
          !isExpanded && "line-clamp-2"
        )}
      >
        {content}
      </div>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "mt-2 text-sm font-medium transition-colors",
            isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
          )}
        >
          {isExpanded ? "Show less" : "...more"}
        </button>
      )}
    </div>
  )
}

function LinkedInWorkspace() {
  console.log('🚀 LinkedInWorkspace component mounted')

  const { resumeId } = useParams<{ resumeId: string }>()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const { actualTheme } = useTheme()
  const { user } = useAuthContext()
  const isDark = actualTheme === "dark"
  const {
    linkedInAudit,
    setLinkedInAudit,
    parsedProfile: contextParsedProfile,
    setParsedProfile,
    setResumeItem
  } = useApp()

  const userName = user?.attributes?.name || user?.username || "User"

  const navState = location.state as {
    parsedProfile?: ParsedProfile;
    linkedInAudit?: LinkedInAudit;
    startMode?: WorkspaceMode;
    resumeUrl?: string;
  } | null

  const [workspaceMode] = React.useState<WorkspaceMode>(
    navState?.startMode || "review"
  )
  const [rightPanelState, setRightPanelState] = React.useState<RightPanelState>("preview")
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>("existing")
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(["headline"]))
  const [_copilotContext, setCopilotContext] = React.useState<string>("")
  const [_copilotSectionId, setCopilotSectionId] = React.useState<string | null>(null)
  const [copilotInitialMessage, setCopilotInitialMessage] = React.useState<string | undefined>(undefined)


  const [createViewMode, setCreateViewMode] = React.useState<CreateViewMode>("sections")
  const [editingSection, setEditingSection] = React.useState<string | null>(null)
  const [editedContent, setEditedContent] = React.useState<Record<string, string>>({})
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)

  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [auditData, setAuditData] = React.useState<LinkedInAudit | UnifiedLinkedInAudit | null>(null)
  const [profileData, setProfileData] = React.useState<ParsedProfile | null>(null)
  const [showResume, setShowResume] = React.useState(false)
  const [resumeUrl] = React.useState<string | null>(navState?.resumeUrl || null)

  // Debug logging
  React.useEffect(() => {
    console.log('=== Component State ===')
    console.log('auditData exists:', !!auditData)
    console.log('profileData exists:', !!profileData)
    console.log('isLoading:', isLoading)

    if (auditData) {
      console.log('=== LinkedIn Audit Data ===')
      console.log('Profile Picture URL:', auditData.userProfile?.profilePictureUrl)
      console.log('About:', auditData.userProfile?.about?.substring(0, 100))
      console.log('Full Name:', auditData.userProfile?.fullName)
      console.log('Full userProfile object:', auditData.userProfile)
    } else {
      console.log('⚠️ auditData is null/undefined')
    }
  }, [auditData, profileData, isLoading])

  React.useEffect(() => {
    async function loadData() {
      if (!resumeId) {
        setError("No resume ID provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const navState = location.state as { parsedProfile?: ParsedProfile; linkedInAudit?: LinkedInAudit } | null
        if (navState?.linkedInAudit) {
          setAuditData(navState.linkedInAudit)
          setLinkedInAudit(navState.linkedInAudit)
          setIsLoading(false)
          return
        }

        if (navState?.parsedProfile) {
          setProfileData(navState.parsedProfile)
          setParsedProfile(navState.parsedProfile)
        }

        if (linkedInAudit) {
          setAuditData(linkedInAudit)
          setIsLoading(false)
          return
        }

        if (contextParsedProfile && !profileData) {
          setProfileData(contextParsedProfile)
        }

        const resume = await resumeService.getResume(resumeId)
        setResumeItem(resume)

        // Set resume URL for viewing (construct from S3 key if available)
        if (resume.resumeS3Key) {
          // For now, we'll need to generate a presigned URL or use a different approach
          // The resume URL will be set from navigation state if available
        }

        // In CREATE mode, only use audit if it matches the current profile
        // Otherwise, clear it to avoid showing data from a different profile
        if (workspaceMode === "create") {
          // Only set audit data if it's explicitly for this profile
          // For now, clear any existing audit to avoid confusion
          if (resume.linkedInAudit && resume.parsedProfile) {
            // Check if audit matches the parsed profile by comparing names
            const auditName = resume.linkedInAudit.userProfile?.fullName
            const profileName = resume.parsedProfile.basics?.name

            if (auditName && profileName && auditName.toLowerCase().includes(profileName.toLowerCase())) {
              setAuditData(resume.linkedInAudit)
              setLinkedInAudit(resume.linkedInAudit)
            } else {
              // Names don't match - clear audit data
              setAuditData(null)
            }
          } else {
            setAuditData(null)
          }
        } else {
          // Review/Improve modes - use audit data normally
          if (resume.linkedInAudit) {
            setAuditData(resume.linkedInAudit)
            setLinkedInAudit(resume.linkedInAudit)
          } else {
            try {
              const response = await resumeService.auditLinkedInProfile(resumeId)
              setAuditData(response.audit)
              setLinkedInAudit(response.audit)
            } catch (auditError: any) {
              console.error("Failed to generate audit:", auditError)
            }
          }
        }

        if (resume.parsedProfile && !profileData) {
          setProfileData(resume.parsedProfile)
          setParsedProfile(resume.parsedProfile)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [resumeId, location.state])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDiscussWithCopilot = (sectionTitle: string, _prompts: string[] = [], _isReviewMode: boolean = true, sectionId?: string, initialMessage?: string) => {
    console.log('handleDiscussWithCopilot called:', { sectionTitle, sectionId, initialMessage })
    setCopilotContext(sectionTitle)
    if (sectionId) setCopilotSectionId(sectionId)
    else setCopilotSectionId(null)

    console.log('Setting rightPanelState to copilot')
    setRightPanelState("copilot")

    // Set the initial message for ChatShell
    if (initialMessage) {
      console.log('Setting initial message:', initialMessage)
      setCopilotInitialMessage(initialMessage)
    } else {
      console.log('No initial message')
      setCopilotInitialMessage(undefined)
    }
  }

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(sectionId)
    setTimeout(() => setCopiedSection(null), 2000)
  }





  const handleStartEdit = (sectionId: string, currentContent: string) => {
    setEditingSection(sectionId)
    setEditedContent(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] || currentContent
    }))
  }

  const handleSaveEdit = (_sectionId: string) => {
    setEditingSection(null)
  }

  const handleCancelEdit = (_sectionId: string) => {
    setEditingSection(null)
  }

  if (isLoading) {
    return (
      <div className={cn(
        "h-screen flex items-center justify-center font-['Inter',sans-serif]",
        isDark ? "bg-[#0C0C0C]" : "bg-white"
      )}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#815FAA]" />
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            Loading profile data...
          </p>
        </div>
      </div>
    )
  }

  if (error || (!auditData && !profileData)) {
    return (
      <div className={cn(
        "h-screen flex items-center justify-center font-['Inter',sans-serif]",
        isDark ? "bg-[#0C0C0C]" : "bg-white"
      )}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
            {error || "Failed to load profile data"}
          </p>
          <Button onClick={() => navigate("/linkedin")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to LinkedIn
          </Button>
        </div>
      </div>
    )
  }

  // Command Header Component
  const CommandHeader = () => (
    <div className={cn(
      "h-14 flex items-center justify-between px-6 border-b z-50 sticky top-0 backdrop-blur-md flex-shrink-0 transition-colors duration-300",
      isDark ? "bg-zinc-900/80 border-white/5" : "bg-white/80 border-zinc-200"
    )}>
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("cursor-pointer hover:underline", isDark ? "text-zinc-500" : "text-zinc-400")} onClick={() => navigate("/linkedin")}>Home</span>
          <span className={cn(isDark ? "text-zinc-600" : "text-zinc-300")}>/</span>
          <span className={cn(isDark ? "text-zinc-100" : "text-zinc-900")}>
            {workspaceMode === "create" ? "Create Profile" : "Profile Review"}
          </span>
        </div>
        <div className={cn("h-4 w-px", isDark ? "bg-white/10" : "bg-zinc-200")} />
      </div>

      {/* Center: Title */}
      <span className={cn(
        "text-sm font-medium",
        isDark ? "text-zinc-500" : "text-zinc-400"
      )}>
        Optimization Studio
      </span>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-medium text-emerald-500 tracking-wider uppercase">
            System Operational
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button className={cn("p-2 rounded-md transition-colors", isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500")}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowResume(!showResume)}
            className={cn(
              "p-2 rounded-md transition-colors",
              showResume ? (isDark ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900") : (isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500")
            )}
          >
            {showResume ? <FileText className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )

  // Left Panel Content
  const leftContent = (
    <div className={cn(
      "h-full flex flex-col overflow-hidden",
      isDark ? "bg-[#0C0C0C]" : "bg-[#F4F6F8]"
    )}>
      {/* Resume PDF View */}
      {showResume && resumeUrl ? (
        <div className="h-full w-full">
          <iframe
            src={`${resumeUrl}#toolbar=0`}
            className="w-full h-full border-0"
            title="Resume PDF"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* UNIFIED OPTIMIZER - Single View */}
          {((workspaceMode === "review" || workspaceMode === "improve") && auditData) ? (
            <div className="h-full p-4 overflow-hidden">
              <OptimizationSidebar
                totalScore={convertAuditToUnified(auditData).optimizationReport.totalScore}
                checklist={convertAuditToUnified(auditData).optimizationReport.checklist}
                auditData={auditData}
                isDark={isDark}
                onSelectSection={(sectionId) => {
                  console.log('Section selected:', sectionId)
                  setCopilotSectionId(sectionId)
                }}
                onFix={(itemId, contextMessage) => {
                  console.log('onFix called with:', { itemId, contextMessage })
                  
                  // If we have a context message, use it directly
                  if (contextMessage) {
                    handleDiscussWithCopilot(
                      itemId, // section title
                      [],
                      false,
                      itemId, // section ID
                      contextMessage
                    )
                    return
                  }
                  
                  // Fallback: try to find in checklist (legacy behavior)
                  const unified = convertAuditToUnified(auditData)
                  const item = unified.optimizationReport.checklist.find(i => i.id === itemId)
                  if (item) {
                    handleDiscussWithCopilot(
                      item.title,
                      ["Apply this fix", "Explain more"],
                      false,
                      item.category.toLowerCase(),
                      `Please help me fix: ${item.title}`
                    )
                  }
                }}
              />
            </div>
          ) : workspaceMode === "create" && profileData ? (
            /* CREATE MODE - Keep existing implementation */
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <CreateModeContent
                profileData={profileData}
                auditData={auditData}
                isDark={isDark}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                editingSection={editingSection}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                copiedSection={copiedSection}
                handleCopy={handleCopy}
                handleStartEdit={handleStartEdit}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                createViewMode={createViewMode}
                setCreateViewMode={setCreateViewMode}
                handleDiscussWithCopilot={handleDiscussWithCopilot}
                setCopilotSectionId={setCopilotSectionId}
              />
            </div>
          ) : (
            /* Fallback */
            <div className="flex-1 flex items-center justify-center p-8">
              <FallbackContent
                isDark={isDark}
                resumeId={resumeId}
                setIsLoading={setIsLoading}
                setAuditData={setAuditData}
                setLinkedInAudit={setLinkedInAudit}
                setError={setError}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Right Panel Content
  const rightContent = (
    <div className={cn("h-full", isDark ? "bg-[#0C0C0C]" : "bg-white")}>
      <AnimatePresence mode="wait">
        {rightPanelState === "preview" ? (
          <PreviewPanel
            isDark={isDark}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            profileData={profileData}
            auditData={auditData}
            userName={userName}
            workspaceMode={workspaceMode}
          />
        ) : (
          <ChatShell 
            onClose={() => setRightPanelState("preview")} 
            initialMessage={copilotInitialMessage}
            onInitialMessageSent={() => setCopilotInitialMessage(undefined)}
            currentSection={_copilotSectionId}
            profileContext={{
              hasHeadlineIssues: auditData ? (() => {
                const unified = convertAuditToUnified(auditData)
                const headlineBanner = unified.checklistAudit?.banners?.find(b => b.id === 'headline')
                return headlineBanner ? headlineBanner.checklistItems.some(item => item.status !== 'pass') : false
              })() : false,
              hasAboutIssues: auditData ? (() => {
                const unified = convertAuditToUnified(auditData)
                const aboutBanner = unified.checklistAudit?.banners?.find(b => b.id === 'about')
                return aboutBanner ? aboutBanner.checklistItems.some(item => item.status !== 'pass') : false
              })() : false,
              hasExperienceIssues: auditData ? (() => {
                const unified = convertAuditToUnified(auditData)
                const expBanner = unified.checklistAudit?.banners?.find(b => b.id === 'experience')
                return expBanner ? expBanner.checklistItems.some(item => item.status !== 'pass') : false
              })() : false,
              hasSkillsIssues: auditData ? (() => {
                const unified = convertAuditToUnified(auditData)
                const skillsBanner = unified.checklistAudit?.banners?.find(b => b.id === 'skills')
                return skillsBanner ? skillsBanner.checklistItems.some(item => item.status !== 'pass') : false
              })() : false,
              overallScore: auditData ? convertAuditToUnified(auditData).optimizationReport.totalScore : undefined
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden font-['Inter',sans-serif]",
      isDark ? "bg-[#0C0C0C]" : "bg-gray-50"
    )}>
      <CommandHeader />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full">
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full flex flex-col">
              {leftContent}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className={cn("z-40", isDark ? "bg-white/5" : "bg-zinc-200")} />

          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full flex flex-col relative z-0">
              {rightContent}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {rightPanelState !== "copilot" && (
        <AskAIButton
          onClick={() => setRightPanelState("copilot")}
          isDark={isDark}
        />
      )}
    </div>
  )
}

// Sub-components for cleaner code

// Create Mode Content Component - For users creating LinkedIn from resume
function CreateModeContent({
  profileData,
  auditData,
  isDark,
  expandedSections,
  toggleSection,
  editingSection,
  editedContent,
  setEditedContent,
  copiedSection,
  handleCopy,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  createViewMode,
  setCreateViewMode,
  handleDiscussWithCopilot,
  setCopilotSectionId,
}: {
  profileData: ParsedProfile
  auditData: LinkedInAudit | UnifiedLinkedInAudit | null
  isDark: boolean
  expandedSections: Set<string>
  toggleSection: (id: string) => void
  editingSection: string | null
  editedContent: Record<string, string>
  setEditedContent: React.Dispatch<React.SetStateAction<Record<string, string>>>
  copiedSection: string | null
  handleCopy: (text: string, id: string) => void
  handleStartEdit: (id: string, content: string) => void
  handleSaveEdit: (id: string) => void
  handleCancelEdit: (id: string) => void
  createViewMode: CreateViewMode
  setCreateViewMode: (mode: CreateViewMode) => void
  handleDiscussWithCopilot: (title: string, prompts: string[], isReview: boolean, sectionId?: string, initialMessage?: string) => void
  setCopilotSectionId: (id: string | null) => void
}) {
  // Build sections from parsed profile
  const sections = [
    {
      id: "headline",
      title: "Headline",
      content: profileData.basics?.headline || `${profileData.basics?.name || 'Professional'} | ${profileData.experience?.[0]?.role || 'Your Role'}`,
    },
    {
      id: "about",
      title: "About",
      content: profileData.basics?.about || "Your professional summary will appear here based on your resume.",
    },
    ...(profileData.experience || []).map((exp, i) => ({
      id: `experience-${i}`,
      title: `Experience: ${exp.role || 'Position'} at ${exp.company}`,
      content: exp.description || 'Experience details from your resume.',
    })),
    ...(profileData.education || []).map((edu, i) => ({
      id: `education-${i}`,
      title: `Education: ${edu.institution}`,
      content: `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}${edu.startDate || edu.endDate ? ` (${edu.startDate || ''} - ${edu.endDate || 'Present'})` : ''}`,
    })),
    {
      id: "skills",
      title: "Skills",
      content: profileData.skills?.join(', ') || "Your skills will be listed here.",
    },
  ]

  const unifiedAudit = auditData ? convertAuditToUnified(auditData) : null

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-[#0F172A]")}>
          Your LinkedIn Profile
        </h3>
        <div className="inline-flex rounded-full p-0.5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}>
          <button
            onClick={() => setCreateViewMode("sections")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              createViewMode === "sections"
                ? isDark ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            )}
          >
            Sections
          </button>
          <button
            onClick={() => setCreateViewMode("overview")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              createViewMode === "overview"
                ? isDark ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"
                : "text-gray-400"
            )}
          >
            Overview
          </button>
        </div>
      </div>

      {createViewMode === "sections" ? (
        /* Sections View - Existing Implementation */
        <>
          <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
            We've generated optimized content for your LinkedIn profile based on your resume. Edit and copy each section.
          </p>

          {sections.map((section) => (
            <CreationCard
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
              isDark={isDark}
              isExpanded={expandedSections.has(section.id)}
              isEditing={editingSection === section.id}
              isCopied={copiedSection === section.id}
              currentEditContent={editedContent[section.id] || section.content}
              onToggle={() => toggleSection(section.id)}
              onEditChange={(value) => setEditedContent(prev => ({ ...prev, [section.id]: value }))}
              onSave={() => handleSaveEdit(section.id)}
              onCancel={() => handleCancelEdit(section.id)}
              onStartEdit={() => handleStartEdit(section.id, editedContent[section.id] || section.content)}
              onCopy={() => handleCopy(editedContent[section.id] || section.content, section.id)}
              onDiscuss={() => handleDiscussWithCopilot(section.title, [], false)}
            />
          ))}
        </>
      ) : (
        /* Overview View - Show Review/Scoring */
        unifiedAudit ? (
          <div className="h-full p-4 overflow-hidden">
            <OptimizationSidebar
              totalScore={unifiedAudit.optimizationReport.totalScore}
              checklist={unifiedAudit.optimizationReport.checklist}
              auditData={unifiedAudit}
              isDark={isDark}
              onSelectSection={(sectionId) => {
                console.log('Section selected in create mode:', sectionId)
                setCopilotSectionId(sectionId)
              }}
              onFix={(itemId, contextMessage) => {
                console.log('onFix called in create mode with:', { itemId, contextMessage })
                
                // If we have a context message, use it directly
                if (contextMessage) {
                  handleDiscussWithCopilot(
                    itemId, // section title
                    [],
                    false,
                    itemId, // section ID
                    contextMessage
                  )
                  return
                }
                
                // Fallback: try to find in checklist (legacy behavior)
                const item = unifiedAudit.optimizationReport.checklist.find(i => i.id === itemId)
                if (item) {
                  handleDiscussWithCopilot(
                    item.title,
                    ["Apply this fix", "Explain more"],
                    false,
                    item.category.toLowerCase(),
                    `Please help me fix: ${item.title}`
                  )
                }
              }}
            />
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              backdropFilter: isDark ? 'blur(20px)' : undefined,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: isDark ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' : '0 8px 30px rgb(0,0,0,0.06)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(129,95,170,0.1)' }}
            >
              <Sparkles className="h-8 w-8 text-[#815FAA]" />
            </div>
            <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-[#0F172A]")}>
              Profile Score Not Available
            </h3>
            <p className={cn("text-sm mb-4 max-w-md mx-auto", isDark ? "text-gray-400" : "text-gray-600")}>
              Your LinkedIn profile sections have been generated from your resume. To see a detailed score and feedback, we need to analyze the generated content.
            </p>
            <Button
              onClick={() => setCreateViewMode("sections")}
              className="bg-[#815FAA] hover:bg-[#6B4E8A] text-white rounded-full"
            >
              View Sections
            </Button>
          </div>
        )
      )}
    </div>
  )
}

// Helper to safely get improved content from either audit format
function getImprovedContent(
  auditData: LinkedInAudit | UnifiedLinkedInAudit | null,
  sectionId: string,
  fallbackContent?: string
): string {
  if (!auditData) return fallbackContent || ""

  // New Unified Format
  if ('optimizationReport' in auditData) {
    const categoryMap: Record<string, string> = {
      'headline': 'Headline',
      'about': 'About',
      'experience': 'Experience',
      'skills': 'Skills'
    }
    const category = categoryMap[sectionId] || sectionId

    // Find items with fix suggestions
    const items = auditData.optimizationReport.checklist.filter(
      item => item.category === category && item.fixSuggestion
    )

    if (items.length > 0) {
      return items.map(i => i.fixSuggestion).join('\n\n')
    }
    return fallbackContent || ""
  }

  // Old Format
  const section = auditData.improveModule.find(s => s.sectionId === sectionId)
  return section?.suggestedContent || fallbackContent || ""
}

// Helper to safely get existing content
// Helper function - currently unused but kept for potential future use
// function getExistingContent(
//   auditData: LinkedInAudit | UnifiedLinkedInAudit | null,
//   sectionId: string,
//   fallbackContent?: string
// ): string {
//   if (!auditData) return fallbackContent || ""

//   // New Unified Format
//   if ('optimizationReport' in auditData) {
//     if (sectionId === 'headline') return auditData.userProfile.headline || fallbackContent || ""
//     if (sectionId === 'about') return auditData.userProfile.about || fallbackContent || ""
//     // specific logic for experience would be complex as it is an array, but for single fields it works
//     return fallbackContent || ""
//   }

//   // Old Format
//   const section = auditData.improveModule.find(s => s.sectionId === sectionId)
//   return section?.existingContent || fallbackContent || ""
// }

// Preview Panel Component
function PreviewPanel({
  isDark,
  previewMode,
  setPreviewMode,
  profileData,
  auditData,
  userName,
  workspaceMode,
}: {
  isDark: boolean
  previewMode: PreviewMode
  setPreviewMode: (mode: PreviewMode) => void
  profileData: ParsedProfile | null
  auditData: LinkedInAudit | UnifiedLinkedInAudit | null
  userName: string
  workspaceMode: WorkspaceMode
}) {
  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col relative overflow-hidden"
    >
      <div className={cn(
        "px-5 py-3.5 border-b flex items-center justify-between",
        isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100"
      )}>
        <span className={cn(
          "text-sm font-semibold",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Profile Preview
        </span>
        {workspaceMode === "improve" && (
          <div className={cn(
            "inline-flex rounded-lg p-1",
            isDark ? "bg-zinc-800" : "bg-gray-100"
          )}>
            <button
              onClick={() => setPreviewMode("existing")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                previewMode === "existing"
                  ? isDark
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Current
            </button>
            <button
              onClick={() => setPreviewMode("improved")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                previewMode === "improved"
                  ? isDark
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Improved
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 custom-scrollbar relative" data-preview-panel>
        <div
          className="max-w-2xl mx-auto rounded-3xl overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E5E7EB',
            boxShadow: isDark ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' : '0 8px 30px rgb(0,0,0,0.06)',
          }}
        >
          <div className="relative">
            {/* Banner Image */}
            {(() => {
              const bannerUrl = 
                auditData?.userProfile?.backgroundPictureUrl || 
                auditData?.userProfile?.background_picture_url || 
                (auditData as any)?.backgroundPictureUrl ||
                (auditData as any)?.background_picture_url;
              
              return bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Profile Banner"
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    // Fallback to gray background if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = '#A0B4B7';
                      parent.style.height = '8rem';
                    }
                  }}
                />
              ) : (
                <div className="h-32 w-full" style={{ backgroundColor: '#A0B4B7' }} />
              );
            })()}
            <div className="px-6 -mt-20 mb-4">

              {/* Profile Picture - Robust Implementation */}
              {(() => {
                const profile = auditData?.userProfile;
                const root = auditData as any;

                const picUrl = profile?.profile_picture_url_large ||
                  profile?.profilePictureUrl ||
                  profile?.profile_picture_url ||
                  (profile as any)?.picture ||
                  (profile as any)?.image ||
                  root?.profile_picture_url_large ||
                  root?.profile_picture_url;

                return (
                  <>
                    {picUrl ? (
                      <img
                        src={picUrl}
                        alt={auditData?.userProfile?.fullName || userName}
                        className="w-40 h-40 rounded-full border-4 object-cover background-white"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                          zIndex: 10,
                          position: "relative"
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = document.getElementById('profile-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback */}
                    <div
                      id="profile-fallback"
                      className="w-40 h-40 rounded-full border-4 items-center justify-center text-4xl font-bold text-white absolute"
                      style={{
                        background: 'linear-gradient(135deg, #815FAA 0%, #27AAE7 100%)',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                        display: picUrl ? 'none' : 'flex',
                        top: 0
                      }}
                    >
                      {profileData?.basics?.name?.charAt(0) || auditData?.userProfile?.fullName?.charAt(0) || userName.charAt(0)}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="px-6 pb-6">
              {/* Headline Section */}
              <div
                data-section="headline"
                className="transition-all duration-300 rounded-lg"
              >
                <h2 className={cn("text-2xl font-semibold mb-1", isDark ? "text-white" : "text-[#000000DE]")}>
                  {profileData?.basics?.name || auditData?.userProfile?.fullName || userName}
                </h2>

                <p className={cn("text-base font-normal mb-2", isDark ? "text-gray-300" : "text-[#000000DE]")}>
                  {workspaceMode === "improve" && previewMode === "improved" && auditData
                    ? getImprovedContent(auditData, "headline", auditData?.userProfile?.headline || profileData?.basics?.headline)
                    : (auditData?.userProfile?.headline || profileData?.basics?.headline || 'Your Professional Headline')}
                </p>

                <div className="text-sm" style={{ color: '#666666' }}>
                  {profileData?.basics?.location || auditData?.userProfile?.location || 'Location'} • {auditData?.userProfile?.connections || '500+'} connections
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: '#0a66c2', color: '#FFFFFF' }}>
                  Open to
                </button>
                <button className="px-4 py-1.5 rounded-full text-sm font-semibold border" style={{ borderColor: '#0a66c2', color: '#0a66c2' }}>
                  Add profile section
                </button>
                <button className="p-1.5 rounded-full border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#00000066' }}>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* About Section */}
              <div
                data-section="about"
                className="mt-6 transition-all duration-300 rounded-lg"
              >
                <h3 className={cn("text-lg font-semibold mb-3", isDark ? "text-white" : "text-[#0F172A]")}>About</h3>
                <AboutSection
                  content={auditData?.userProfile?.about || (auditData?.userProfile as any)?.summary || "No about section found."}
                  isDark={isDark}
                />
              </div>

              {/* Experience Section */}
              {(profileData?.experience || auditData?.userProfile?.experience) && (
                <div
                  data-section="experience"
                  className="mt-6 pt-6 border-t transition-all duration-300 rounded-lg"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
                >
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Experience</h3>
                  <div className="space-y-6">
                    {(profileData?.experience || auditData?.userProfile?.experience || []).map((exp: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                          <Briefcase className="w-6 h-6" style={{ color: '#666666' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold text-[16px]", isDark ? "text-white" : "text-gray-900")}>{exp.role || exp.title}</h4>
                          <p className="text-[14px]" style={{ color: isDark ? '#E5E7EB' : '#000000DE' }}>{exp.company}</p>
                          <p className="text-[14px] text-gray-500 mb-2">
                            {exp.startDate
                              ? `${exp.startDate} - ${exp.endDate || 'Present'}`
                              : exp.duration
                            }
                          </p>
                          {exp.description && (
                            <p className={cn("text-sm whitespace-pre-line mt-1", isDark ? "text-gray-300" : "text-gray-600")}>
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {(profileData?.education || auditData?.userProfile?.education) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Education</h3>
                  <div className="space-y-6">
                    {(profileData?.education || auditData?.userProfile?.education || []).map((edu: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                          <GraduationCap className="w-6 h-6" style={{ color: '#666666' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold text-[16px]", isDark ? "text-white" : "text-gray-900")}>{edu.institution || edu.school}</h4>
                          <p className="text-[14px]" style={{ color: isDark ? '#E5E7EB' : '#000000DE' }}>{edu.degree}</p>
                          {(edu.startDate || edu.endDate || edu.year || edu.start || edu.end) && (
                            <p className="text-[14px] text-gray-500">{edu.startDate || edu.start || ''} {edu.endDate || edu.end || edu.year || ''}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS SECTION */}
              {((profileData?.certifications?.length || 0) > 0 || (auditData?.userProfile?.certifications?.length || 0) > 0) && (
                <div
                  data-section="certifications"
                  className="mt-6 pt-6 border-t transition-all duration-300 rounded-lg"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
                >
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Licenses & Certifications</h3>
                  <div className="space-y-4">
                    {(profileData?.certifications || auditData?.userProfile?.certifications || []).map((cert: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                          <Award className="w-6 h-6" style={{ color: '#666666' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold text-[16px]", isDark ? "text-white" : "text-gray-900")}>{cert.name || cert.title}</h4>
                          <p className="text-[14px]" style={{ color: isDark ? '#E5E7EB' : '#000000DE' }}>{cert.issuer || cert.authority || cert.issuingOrganization}</p>
                          {(cert.date || cert.issueDate || cert.startDate) && <p className="text-[14px] text-gray-500">Issued {cert.date || cert.issueDate || cert.startDate}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILLS SECTION */}
              {((profileData?.skills?.length || 0) > 0 || (auditData?.userProfile?.skills?.length || 0) > 0) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profileData?.skills || auditData?.userProfile?.skills || []).map((skill: string, i: number) => (
                      <span
                        key={i}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium border",
                          isDark
                            ? "bg-[#1f1f1f] border-gray-700 text-gray-300"
                            : "bg-white border-gray-300 text-gray-700"
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* LANGUAGES SECTION */}
              {((auditData?.userProfile?.languages?.length || 0) > 0) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Languages</h3>
                  <div className="space-y-2">
                    {(auditData?.userProfile?.languages || []).map((lang: string, i: number) => (
                      <div key={i} className="flex justify-between border-b pb-2 last:border-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                        <span className={cn("text-sm font-medium", isDark ? "text-gray-200" : "text-gray-800")}>{lang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PUBLICATIONS SECTION */}
              {((auditData?.userProfile?.publications?.length || 0) > 0) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-white" : "text-[#000000DE]")}>Publications</h3>
                  <div className="space-y-4">
                    {(auditData?.userProfile?.publications || []).map((pub: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                          <FileText className="w-6 h-6" style={{ color: '#666666' }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold text-[16px]", isDark ? "text-white" : "text-gray-900")}>{pub.title}</h4>
                          {pub.publisher && <p className="text-[14px]" style={{ color: isDark ? '#E5E7EB' : '#000000DE' }}>{pub.publisher}</p>}
                          {pub.date && <p className="text-[14px] text-gray-500">Published {pub.date}</p>}
                          {pub.description && (
                            <p className={cn("text-sm whitespace-pre-line mt-1", isDark ? "text-gray-300" : "text-gray-600")}>
                              {pub.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>


    </motion.div>
  )
}


// Fallback Content Component (when audit data is missing)
function FallbackContent({
  isDark,
  resumeId,
  setIsLoading,
  setAuditData,
  setLinkedInAudit,
  setError,
}: {
  isDark: boolean
  resumeId: string | undefined
  setIsLoading: (loading: boolean) => void
  setAuditData: (data: LinkedInAudit | UnifiedLinkedInAudit | null) => void
  setLinkedInAudit: (audit: LinkedInAudit | UnifiedLinkedInAudit) => void
  setError: (error: string | null) => void
}) {
  const handleGenerateAudit = async () => {
    if (!resumeId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await resumeService.auditLinkedInProfile(resumeId)
      setAuditData(response.audit)
      setLinkedInAudit(response.audit)
    } catch (err: any) {
      setError(err.message || "Failed to generate audit")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        backdropFilter: isDark ? 'blur(20px)' : undefined,
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        boxShadow: isDark ? 'inset 0 1px 0 0 rgba(255,255,255,0.1)' : '0 8px 30px rgb(0,0,0,0.06)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(129,95,170,0.1)' }}
      >
        <Award className="h-8 w-8 text-[#815FAA]" />
      </div>
      <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-[#0F172A]")}>
        Generate Profile Audit
      </h3>
      <p className={cn("text-sm mb-4 max-w-md mx-auto", isDark ? "text-gray-400" : "text-gray-600")}>
        We found your profile data but haven't generated an audit yet. Click below to analyze your LinkedIn profile.
      </p>
      <Button
        onClick={handleGenerateAudit}
        className="bg-[#815FAA] hover:bg-[#6B4E8A] text-white rounded-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Audit
      </Button>
    </div>
  )
}


export default LinkedInWorkspace
