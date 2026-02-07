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
  BarChart3,
  User as UserIcon,
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
import { ChatShell } from "@/components/chat/ChatShell"
import { OptimizationSidebar } from "@/components/OptimizationSidebar"
import { OptimizationSidebarSkeleton } from "@/components/OptimizationSidebarSkeleton"
import { AskAIButton } from "@/components/AskAIButton"
import { useApp } from "@/contexts/AppContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { convertAuditToUnified } from "@/utils/auditAdapter"

type WorkspaceMode = "review" | "improve" | "create"
type RightPanelState = "preview" | "copilot"
type PreviewMode = "existing" | "improved"
type MobileTab = "score" | "preview"

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
    isLoading?: boolean;  // NEW: Indicates progressive loading
    isLoadingAudit?: boolean;  // Indicates audit is being loaded
    linkedInUrl?: string;  // NEW: URL being analyzed
  } | null

  const [workspaceMode] = React.useState<WorkspaceMode>(
    navState?.startMode || "review"
  )
  const [rightPanelState, setRightPanelState] = React.useState<RightPanelState>(
    navState?.startMode === "improve" ? "copilot" : "preview"
  )
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>("existing")
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("score")
  const [mobileCopilotOpen, setMobileCopilotOpen] = React.useState(false)
  const [_copilotContext, setCopilotContext] = React.useState<string>("")
  const [_copilotSectionId, setCopilotSectionId] = React.useState<string | null>(null)
  const [copilotInitialMessage, setCopilotInitialMessage] = React.useState<string | undefined>(undefined)
  const [improvePrompts, setImprovePrompts] = React.useState<Array<{ label: string; prompt: string }>>([])
  const improvePromptsBuiltRef = React.useRef(false)

  const [isLoading, setIsLoading] = React.useState(true)
  const [isAuditLoading, setIsAuditLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [auditData, setAuditData] = React.useState<LinkedInAudit | UnifiedLinkedInAudit | null>(null)
  const [profileData, setProfileData] = React.useState<ParsedProfile | null>(null)
  const [showResume, setShowResume] = React.useState(false)
  const [resumeUrl] = React.useState<string | null>(navState?.resumeUrl || null)
  
  // Refs to prevent duplicate API calls (React StrictMode runs effects twice)
  const extractionStartedRef = React.useRef(false)
  const dataLoadedRef = React.useRef(false)
  const lastResumeIdRef = React.useRef<string | null>(null)
  
  // Extract stable values from location.state to use in dependencies
  const navLinkedInUrl = navState?.linkedInUrl
  const navHasAudit = !!navState?.linkedInAudit
  const navIsLoadingAudit = navState?.isLoadingAudit
  const navHasParsedProfile = !!navState?.parsedProfile
  
  // Reset refs when resumeId changes (navigating to different project)
  React.useEffect(() => {
    if (resumeId && resumeId !== lastResumeIdRef.current) {
      lastResumeIdRef.current = resumeId
      dataLoadedRef.current = false
      extractionStartedRef.current = false
    }
  }, [resumeId])

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
    // Guard against duplicate calls from StrictMode or re-renders
    if (dataLoadedRef.current) {
      return
    }
    
    async function loadData() {
      if (!resumeId) {
        setError("No resume ID provided")
        setIsLoading(false)
        return
      }
      
      // Mark as loaded to prevent duplicate calls
      dataLoadedRef.current = true

      try {
        setError(null)

        const navState = location.state as { 
          parsedProfile?: ParsedProfile; 
          linkedInAudit?: LinkedInAudit; 
          startMode?: WorkspaceMode;
          isLoadingAudit?: boolean;
          linkedInUrl?: string;
        } | null
        
        // If we have audit data from navigation, use it immediately
        if (navState?.linkedInAudit) {
          setAuditData(navState.linkedInAudit)
          setLinkedInAudit(navState.linkedInAudit)
          // Extract profile from audit
          if (navState.linkedInAudit?.userProfile) {
            const profile: ParsedProfile = {
              basics: {
                name: navState.linkedInAudit.userProfile?.fullName || '',
                headline: navState.linkedInAudit.userProfile?.headline || '',
                about: navState.linkedInAudit.userProfile?.about || '',
                location: navState.linkedInAudit.userProfile?.location || '',
                email: navState.linkedInAudit.userProfile?.email || '',
              },
              experience: navState.linkedInAudit.userProfile?.experience || [],
              education: navState.linkedInAudit.userProfile?.education || [],
              skills: navState.linkedInAudit.userProfile?.skills || [],
              certifications: navState.linkedInAudit.userProfile?.certifications || [],
              projects: [],
              languages: navState.linkedInAudit.userProfile?.languages || [],
              analysis: {
                missingSections: [],
                overallScore: 50,
                feedback: '',
                strengths: [],
                improvements: [],
              },
            }
            setProfileData(profile)
            setParsedProfile(profile)
          }
          setIsLoading(false)
          return
        }

        // PROGRESSIVE LOADING: If we have profile data but audit is still loading
        if (navState?.parsedProfile && navState?.isLoadingAudit) {
          console.log('Progressive loading: Profile received, starting audit in background')
          setProfileData(navState.parsedProfile)
          setParsedProfile(navState.parsedProfile)
          setIsLoading(false) // Show UI immediately with profile data
          setIsAuditLoading(true) // Show skeleton on left side
          
          // Start audit in background - but only once
          // Use runLinkedInAudit which audits the existing project (created by fetch-profile)
          // Now uses async polling to avoid CloudFront timeout
          if (resumeId && !extractionStartedRef.current) {
            extractionStartedRef.current = true
            console.log('Starting async audit for project:', resumeId)
            
            resumeService.runLinkedInAudit(resumeId, {
              onProgress: (progress) => {
                console.log('Audit progress:', progress)
                // Could update UI with progress message here if needed
              }
            })
              .then(result => {
                console.log('Audit completed, updating UI')
                setAuditData(result.audit)
                setLinkedInAudit(result.audit)
                setIsAuditLoading(false)
              })
              .catch(err => {
                console.error('Audit failed:', err)
                setError('Failed to analyze profile. Please try again.')
                setIsAuditLoading(false)
                extractionStartedRef.current = false // Reset on error so user can retry
              })
          }
          return
        }

        // If we have profile data from navigation (without audit loading), set it immediately
        if (navState?.parsedProfile) {
          setProfileData(navState.parsedProfile)
          setParsedProfile(navState.parsedProfile)
          setIsLoading(false) // Show UI immediately with profile data
        }

        // Check context for existing data
        if (linkedInAudit && !navState?.linkedInAudit) {
          setAuditData(linkedInAudit)
          // Extract profile from audit if not already set
          if (linkedInAudit?.userProfile && !profileData) {
            const profile: ParsedProfile = {
              basics: {
                name: linkedInAudit.userProfile?.fullName || '',
                headline: linkedInAudit.userProfile?.headline || '',
                about: linkedInAudit.userProfile?.about || '',
                location: linkedInAudit.userProfile?.location || '',
                email: linkedInAudit.userProfile?.email || '',
              },
              experience: linkedInAudit.userProfile?.experience || [],
              education: linkedInAudit.userProfile?.education || [],
              skills: linkedInAudit.userProfile?.skills || [],
              certifications: linkedInAudit.userProfile?.certifications || [],
              projects: [],
              languages: linkedInAudit.userProfile?.languages || [],
              analysis: {
                missingSections: [],
                overallScore: 50,
                feedback: '',
                strengths: [],
                improvements: [],
              },
            }
            setProfileData(profile)
            setParsedProfile(profile)
          }
          setIsLoading(false)
        }

        if (contextParsedProfile && !profileData && !navState?.parsedProfile) {
          setProfileData(contextParsedProfile)
          setIsLoading(false) // Show UI immediately with profile data
        }

        // Fetch resume data
        const resume = await resumeService.getResume(resumeId)
        setResumeItem(resume)

        // Set profile data if available and show UI immediately
        if (resume.parsedProfile && !profileData && !navState?.parsedProfile) {
          setProfileData(resume.parsedProfile)
          setParsedProfile(resume.parsedProfile)
          setIsLoading(false) // Show UI immediately with profile data
        }

        // Handle audit data based on mode (this happens in background)
        if (workspaceMode === "create") {
          // In CREATE mode, use existing audit or trigger one
          if (resume.linkedInAudit) {
            setAuditData(resume.linkedInAudit)
            setLinkedInAudit(resume.linkedInAudit)
            setIsLoading(false)
          } else if (resume.parsedProfile && resumeId && !extractionStartedRef.current) {
            // No audit yet - run audit in background (same as review/improve)
            extractionStartedRef.current = true
            setIsLoading(false)
            setIsAuditLoading(true)
            
            console.log('Starting async audit for create mode project:', resumeId)
            resumeService.runLinkedInAudit(resumeId, {
              onProgress: (progress) => {
                console.log('Create mode audit progress:', progress)
              }
            })
              .then(result => {
                console.log('Create mode audit completed')
                setAuditData(result.audit)
                setLinkedInAudit(result.audit)
              })
              .catch(err => {
                console.error("Failed to generate audit for create mode:", err)
              })
              .finally(() => {
                setIsAuditLoading(false)
              })
          } else {
            setAuditData(null)
            setIsLoading(false)
          }
        } else {
          // Review/Improve modes - fetch or use existing audit
          if (resume.linkedInAudit) {
            setAuditData(resume.linkedInAudit)
            setLinkedInAudit(resume.linkedInAudit)
            // Extract profile from audit
            if (resume.linkedInAudit?.userProfile && !profileData) {
              const profile: ParsedProfile = {
                basics: {
                  name: resume.linkedInAudit.userProfile?.fullName || '',
                  headline: resume.linkedInAudit.userProfile?.headline || '',
                  about: resume.linkedInAudit.userProfile?.about || '',
                  location: resume.linkedInAudit.userProfile?.location || '',
                  email: resume.linkedInAudit.userProfile?.email || '',
                },
                experience: resume.linkedInAudit.userProfile?.experience || [],
                education: resume.linkedInAudit.userProfile?.education || [],
                skills: resume.linkedInAudit.userProfile?.skills || [],
                certifications: resume.linkedInAudit.userProfile?.certifications || [],
                projects: [],
                languages: resume.linkedInAudit.userProfile?.languages || [],
                analysis: {
                  missingSections: [],
                  overallScore: 50,
                  feedback: '',
                  strengths: [],
                  improvements: [],
                },
              }
              setProfileData(profile)
              setParsedProfile(profile)
            }
            setIsLoading(false)
          } else {
            // No existing audit - need to generate it
            // Check if this is a URL-extracted profile (has linkedInSource or resumeS3Key starts with 'linkedin-url/')
            const isUrlExtracted = resume.resumeS3Key?.startsWith('linkedin-url/')
            
            // Check if we have parsedProfile data to work with
            const hasParsedProfile = resume.parsedProfile || (resume as any).parsedProfile
            
            if (isUrlExtracted && hasParsedProfile) {
              // URL-extracted profile with parsedProfile - run audit on existing project
              console.log("URL-extracted profile missing audit, starting async audit...")
              setIsLoading(false)
              setIsAuditLoading(true)
              
              // Extract profile data for immediate display
              if (resume.parsedProfile && !profileData) {
                setProfileData(resume.parsedProfile)
                setParsedProfile(resume.parsedProfile)
              }
              
              // Start async audit using the new polling endpoint
              resumeService.runLinkedInAudit(resumeId, {
                onProgress: (progress) => {
                  console.log('Audit progress:', progress)
                }
              })
                .then(response => {
                  setAuditData(response.audit)
                  setLinkedInAudit(response.audit)
                  // Update profile from audit if needed
                  if (response.audit?.userProfile && !profileData) {
                    const profile: ParsedProfile = {
                      basics: {
                        name: response.audit.userProfile?.fullName || '',
                        headline: response.audit.userProfile?.headline || '',
                        about: response.audit.userProfile?.about || '',
                        location: response.audit.userProfile?.location || '',
                        email: response.audit.userProfile?.email || '',
                      },
                      experience: response.audit.userProfile?.experience || [],
                      education: response.audit.userProfile?.education || [],
                      skills: response.audit.userProfile?.skills || [],
                      certifications: response.audit.userProfile?.certifications || [],
                      projects: [],
                      languages: response.audit.userProfile?.languages || [],
                      analysis: {
                        missingSections: [],
                        overallScore: 50,
                        feedback: '',
                        strengths: [],
                        improvements: [],
                      },
                    }
                    setProfileData(profile)
                    setParsedProfile(profile)
                  }
                })
                .catch(auditError => {
                  console.error("Failed to generate audit:", auditError)
                  setError("Failed to analyze LinkedIn profile. Please try again.")
                })
                .finally(() => {
                  setIsAuditLoading(false)
                })
            } else if (isUrlExtracted && !hasParsedProfile) {
              // URL-extracted but no profile data - try to re-fetch using username from resumeS3Key
              // resumeS3Key format: "linkedin-url/username"
              const linkedInUsername = resume.resumeS3Key?.replace('linkedin-url/', '')
              
              if (linkedInUsername) {
                console.log("Re-fetching LinkedIn profile for username:", linkedInUsername)
                setIsLoading(true)
                
                // Use the username as LinkedIn URL - this creates a NEW complete project
                resumeService.extractLinkedInFromUrl(linkedInUsername, {
                  onProgress: (progress) => {
                    console.log('Re-extraction progress:', progress)
                  }
                })
                  .then(result => {
                    // Navigate to the new complete project
                    console.log("Profile re-extracted, navigating to new project:", result.projectId)
                    navigate(`/linkedin/workspace/${result.projectId}`, {
                      state: { 
                        linkedInAudit: result.audit,
                        startMode: workspaceMode 
                      },
                      replace: true // Replace current history entry
                    })
                  })
                  .catch(err => {
                    console.error("Failed to re-fetch LinkedIn profile:", err)
                    setError("Failed to fetch LinkedIn profile. Please try again from the landing page.")
                    setIsLoading(false)
                  })
              } else {
                console.error("URL-extracted profile missing parsedProfile data and no username found")
                setError("Profile data is incomplete. Please try extracting the LinkedIn profile again.")
                setIsLoading(false)
              }
            } else {
              // PDF-based profile - generate audit
              // Show UI immediately with skeleton
              setIsLoading(false)
              setIsAuditLoading(true)
              
              // Start audit generation in background
              resumeService.auditLinkedInProfile(resumeId)
                .then(response => {
                  setAuditData(response.audit)
                  setLinkedInAudit(response.audit)
                  // Extract profile from audit
                  if (response.audit?.userProfile && !profileData) {
                    const profile: ParsedProfile = {
                      basics: {
                        name: response.audit.userProfile?.fullName || '',
                        headline: response.audit.userProfile?.headline || '',
                        about: response.audit.userProfile?.about || '',
                        location: response.audit.userProfile?.location || '',
                        email: response.audit.userProfile?.email || '',
                      },
                      experience: response.audit.userProfile?.experience || [],
                      education: response.audit.userProfile?.education || [],
                      skills: response.audit.userProfile?.skills || [],
                      certifications: response.audit.userProfile?.certifications || [],
                      projects: [],
                      languages: response.audit.userProfile?.languages || [],
                      analysis: {
                        missingSections: [],
                        overallScore: 50,
                        feedback: '',
                        strengths: [],
                        improvements: [],
                      },
                    }
                    setProfileData(profile)
                    setParsedProfile(profile)
                  }
                })
                .catch(auditError => {
                  console.error("Failed to generate audit:", auditError)
                  setError("Failed to analyze LinkedIn profile. Please try again.")
                })
                .finally(() => {
                  setIsAuditLoading(false)
                })
            }
          }
        }
      } catch (err: any) {
        console.error('=== Error in loadData ===')
        console.error('Error object:', err)
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
        setError(err.message || "Failed to load profile data")
        setIsLoading(false)
      }
    }

    loadData()
    // Dependencies use stable primitive values extracted from location.state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, navLinkedInUrl, navHasAudit, navIsLoadingAudit, navHasParsedProfile])

  // Build specific improvement prompts from real audit data for improve mode
  React.useEffect(() => {
    if (workspaceMode !== "improve" || !auditData || improvePromptsBuiltRef.current) return
    improvePromptsBuiltRef.current = true

    try {
      const unified = convertAuditToUnified(auditData)
      const checklist = unified.optimizationReport.checklist || []
      
      // Find failing items grouped by category (after conversion: pass | warning | critical)
      const failingItems = checklist.filter(
        (item: any) => item.status === 'critical' || item.status === 'warning'
      )
      
      // Group by category, pick the most impactful issue per category
      const issuesByCategory: Record<string, { title: string; count: number }> = {}
      for (const item of failingItems) {
        const cat = item.category || 'General'
        if (!issuesByCategory[cat]) {
          issuesByCategory[cat] = { title: item.title, count: 0 }
        }
        issuesByCategory[cat].count++
      }
      
      // Build 4 specific prompts from real issues
      const prompts: Array<{ label: string; prompt: string }> = []
      
      const categoryEntries = Object.entries(issuesByCategory)
      
      for (const [category, info] of categoryEntries.slice(0, 4)) {
        const issuesInCat = failingItems.filter((item: any) => (item.category || 'General') === category)
        const issueList = issuesInCat.map((item: any) => item.title).join(', ')
        
        prompts.push({
          label: `Fix my ${category} (${info.count} issue${info.count > 1 ? 's' : ''})`,
          prompt: `My ${category} section has these issues: ${issueList}. Please give me specific, rewritten content I can copy-paste to fix these problems. Show me exactly what to change.`,
        })
      }
      
      // If we have fewer than 4 category-based prompts, add general ones
      if (prompts.length < 4) {
        const totalScore = unified.optimizationReport.totalScore
        prompts.push({
          label: `Boost my score from ${totalScore} to 90+`,
          prompt: `My profile scored ${totalScore}/100. What are the top 3 highest-impact changes I can make right now to get my score above 90? Give me specific, actionable steps with example content.`,
        })
      }
      if (prompts.length < 4) {
        prompts.push({
          label: 'Rewrite my headline for more visibility',
          prompt: 'Analyze my current LinkedIn headline and rewrite it to be more keyword-rich, compelling, and optimized for recruiter searches. Give me 3 headline options.',
        })
      }
      if (prompts.length < 4) {
        prompts.push({
          label: 'Make my About section stand out',
          prompt: 'Rewrite my LinkedIn About section to be more engaging, keyword-rich, and compelling. Write it in first person with a strong hook, key achievements, and a call-to-action.',
        })
      }
      
      setImprovePrompts(prompts.slice(0, 4))
    } catch (e) {
      console.warn('Failed to build improve prompts from audit data:', e)
      setImprovePrompts([
        { label: 'Fix my headline for more visibility', prompt: 'Analyze my LinkedIn headline and give me 3 optimized alternatives that are keyword-rich and compelling for recruiter searches.' },
        { label: 'Rewrite my About section', prompt: 'Rewrite my LinkedIn About section to be more engaging with a strong hook, key achievements, and a call-to-action. Write in first person.' },
        { label: 'Improve my experience descriptions', prompt: 'Review my experience section and rewrite the descriptions with quantified achievements, action verbs, and relevant keywords.' },
        { label: 'Optimize my skills section', prompt: 'Analyze my skills section and suggest which skills to add, remove, or reorder for maximum visibility in my industry.' },
      ])
    }
  }, [workspaceMode, auditData])

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

  // Show error screen only if there's an actual error OR we have no data after loading completes
  if (error || (!isLoading && !isAuditLoading && !auditData && !profileData)) {
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
      "h-14 flex items-center justify-between px-4 sm:px-6 border-b z-50 sticky top-0 backdrop-blur-md flex-shrink-0 transition-colors duration-300",
      isDark ? "bg-zinc-900/80 border-white/5" : "bg-white/80 border-zinc-200"
    )}>
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("cursor-pointer hover:underline", isDark ? "text-zinc-500" : "text-zinc-400")} onClick={() => navigate("/linkedin")}>Home</span>
          <span className={cn(isDark ? "text-zinc-600" : "text-zinc-300")}>/</span>
          <span className={cn("truncate max-w-[120px] sm:max-w-none", isDark ? "text-zinc-100" : "text-zinc-900")}>
            {workspaceMode === "create" ? "Create Profile" : workspaceMode === "improve" ? "Profile Improve" : "Profile Review"}
          </span>
        </div>
        <div className={cn("h-4 w-px hidden sm:block", isDark ? "bg-white/10" : "bg-zinc-200")} />
      </div>

      {/* Center: Title - hidden on mobile */}
      <span className={cn(
        "text-sm font-medium hidden sm:block",
        isDark ? "text-zinc-500" : "text-zinc-400"
      )}>
        Optimization Studio
      </span>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-medium text-emerald-500 tracking-wider uppercase">
            System Operational
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button className={cn("p-2 rounded-md transition-colors hidden sm:flex", isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500")}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowResume(!showResume)}
            className={cn(
              "p-2 rounded-md transition-colors hidden sm:flex",
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
          {/* UNIFIED OPTIMIZER - Single View (works for all modes: review, improve, create) */}
          {/* Show skeleton FIRST if audit is loading (even if we have profile data) */}
          {(isAuditLoading && !auditData) ? (
            /* Show skeleton while audit is loading */
            <div className="h-full p-4 overflow-hidden">
              <OptimizationSidebarSkeleton isDark={isDark} />
            </div>
          ) : (auditData) ? (
            <div className="h-full p-4 overflow-hidden">
              <OptimizationSidebar
                totalScore={convertAuditToUnified(auditData).optimizationReport.totalScore}
                checklist={convertAuditToUnified(auditData).optimizationReport.checklist}
                auditData={auditData}
                isDark={isDark}
                workspaceMode={workspaceMode}
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
          ) : (
            /* Fallback for other modes */
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
            projectId={resumeId}
            improvePrompts={workspaceMode === "improve" ? improvePrompts : undefined}
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

  // Mobile: open copilot as slide-over
  const handleOpenCopilot = () => {
    if (isMobile) {
      setMobileCopilotOpen(true)
    } else {
      setRightPanelState("copilot")
    }
  }

  const handleCloseCopilot = () => {
    if (isMobile) {
      setMobileCopilotOpen(false)
    } else {
      setRightPanelState("preview")
    }
  }

  // On mobile, when "Improve with Copilot" or "Ask AI" is triggered, open mobile copilot
  const originalHandleDiscuss = handleDiscussWithCopilot
  const mobileAwareDiscuss = (sectionTitle: string, prompts: string[] = [], isReviewMode: boolean = true, sectionId?: string, initialMessage?: string) => {
    originalHandleDiscuss(sectionTitle, prompts, isReviewMode, sectionId, initialMessage)
    if (isMobile) {
      setMobileCopilotOpen(true)
    }
  }

  if (isMobile) {
    return (
      <div className={cn(
        "h-screen flex flex-col overflow-hidden font-['Inter',sans-serif]",
        isDark ? "bg-[#0C0C0C]" : "bg-gray-50"
      )}>
        <CommandHeader />

        {/* Mobile Tab Switcher */}
        <div className={cn(
          "flex items-center px-4 py-2 border-b flex-shrink-0",
          isDark ? "bg-zinc-900/50 border-white/5" : "bg-white border-zinc-200"
        )}>
          <div className={cn(
            "inline-flex w-full rounded-xl p-1",
            isDark ? "bg-zinc-800" : "bg-[#F3F4F6]"
          )}>
            <button
              onClick={() => setMobileTab("score")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                mobileTab === "score"
                  ? isDark ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm"
                  : isDark ? "text-zinc-400" : "text-gray-500"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Score
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                mobileTab === "preview"
                  ? isDark ? "bg-zinc-700 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm"
                  : isDark ? "text-zinc-400" : "text-gray-500"
              )}
            >
              <UserIcon className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Mobile Panel Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {mobileTab === "score" ? (
              <motion.div
                key="score"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {/* Reuse leftContent but override onFix to use mobile copilot */}
                <div className={cn(
                  "h-full flex flex-col overflow-hidden",
                  isDark ? "bg-[#0C0C0C]" : "bg-[#F4F6F8]"
                )}>
                  <div className="flex-1 flex flex-col min-h-0 relative">
                    {(isAuditLoading && !auditData) ? (
                      <div className="h-full p-4 overflow-hidden">
                        <OptimizationSidebarSkeleton isDark={isDark} />
                      </div>
                    ) : (auditData) ? (
                      <div className="h-full p-4 overflow-hidden">
                        <OptimizationSidebar
                          totalScore={convertAuditToUnified(auditData).optimizationReport.totalScore}
                          checklist={convertAuditToUnified(auditData).optimizationReport.checklist}
                          auditData={auditData}
                          isDark={isDark}
                          workspaceMode={workspaceMode}
                          onSelectSection={(sectionId) => setCopilotSectionId(sectionId)}
                          onFix={(itemId, contextMessage) => {
                            if (contextMessage) {
                              mobileAwareDiscuss(itemId, [], false, itemId, contextMessage)
                              return
                            }
                            const unified = convertAuditToUnified(auditData)
                            const item = unified.optimizationReport.checklist.find(i => i.id === itemId)
                            if (item) {
                              mobileAwareDiscuss(item.title, [], false, item.category.toLowerCase(), `Please help me fix: ${item.title}`)
                            }
                          }}
                        />
                      </div>
                    ) : (
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
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PreviewPanel
                  isDark={isDark}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  profileData={profileData}
                  auditData={auditData}
                  userName={userName}
                  workspaceMode={workspaceMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Copilot Slide-over */}
        <AnimatePresence>
          {mobileCopilotOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={handleCloseCopilot}
              />
              {/* Copilot Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                  "fixed top-0 right-0 bottom-0 w-[85vw] max-w-[400px] z-50 flex flex-col shadow-2xl",
                  isDark ? "bg-[#0C0C0C]" : "bg-stone-50"
                )}
              >
                <ChatShell
                  onClose={handleCloseCopilot}
                  initialMessage={copilotInitialMessage}
                  onInitialMessageSent={() => setCopilotInitialMessage(undefined)}
                  currentSection={_copilotSectionId}
                  projectId={resumeId}
                  improvePrompts={workspaceMode === "improve" ? improvePrompts : undefined}
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
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile FAB */}
        {!mobileCopilotOpen && (
          <AskAIButton
            onClick={handleOpenCopilot}
            isDark={isDark}
          />
        )}
      </div>
    )
  }

  // Desktop layout
  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden font-['Inter',sans-serif]",
      isDark ? "bg-[#0C0C0C]" : "bg-gray-50"
    )}>
      <CommandHeader />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
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
          onClick={handleOpenCopilot}
          isDark={isDark}
        />
      )}
    </div>
  )
}

// Sub-components for cleaner code

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
              const rawProfile = profileData?._rawProfile;
              const bannerUrl = 
                rawProfile?.backgroundPictureUrl ||
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
            <div className="px-6 relative" style={{ marginTop: '-48px', marginBottom: '16px' }}>

              {/* Profile Picture - Robust Implementation */}
              {(() => {
                const profile = auditData?.userProfile;
                const root = auditData as any;
                const rawProfile = profileData?._rawProfile;

                const picUrl = rawProfile?.profilePictureUrl ||
                  profile?.profile_picture_url_large ||
                  profile?.profilePictureUrl ||
                  profile?.profile_picture_url ||
                  (profile as any)?.picture ||
                  (profile as any)?.image ||
                  root?.profile_picture_url_large ||
                  root?.profile_picture_url;

                return (
                  <div className="relative" style={{ width: '120px', height: '120px' }}>
                    {picUrl ? (
                      <img
                        src={picUrl}
                        alt={auditData?.userProfile?.fullName || userName}
                        className="w-[120px] h-[120px] rounded-full border-4 object-cover"
                        style={{
                          borderColor: isDark ? '#1a1a1a' : '#FFFFFF',
                          position: "relative",
                          zIndex: 10,
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
                      className="w-[120px] h-[120px] rounded-full border-4 items-center justify-center text-3xl font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #815FAA 0%, #27AAE7 100%)',
                        borderColor: isDark ? '#1a1a1a' : '#FFFFFF',
                        display: picUrl ? 'none' : 'flex',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      {profileData?.basics?.name?.charAt(0) || auditData?.userProfile?.fullName?.charAt(0) || userName.charAt(0)}
                    </div>
                  </div>
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
                  content={
                    (workspaceMode === "improve" && previewMode === "improved" && auditData)
                      ? getImprovedContent(auditData, "about", auditData?.userProfile?.about || profileData?.basics?.about)
                      : (auditData?.userProfile?.about || (auditData?.userProfile as any)?.summary || profileData?.basics?.about || "No about section available yet.")
                  }
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
      className={cn(
        "rounded-[16px] p-8 text-center border",
        isDark 
          ? "bg-[#111113] border-[#27272A]" 
          : "bg-white border-[#E5E7EB]"
      )}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 bg-[#DFC4FF]/30">
        <Award className="h-8 w-8 text-[#815FAA]" />
      </div>
      <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-[#111827]")}>
        Generate Profile Audit
      </h3>
      <p className={cn("text-sm mb-4 max-w-md mx-auto", isDark ? "text-[#A1A1AA]" : "text-[#6B7280]")}>
        We found your profile data but haven't generated an audit yet. Click below to analyze your LinkedIn profile.
      </p>
      <Button
        onClick={handleGenerateAudit}
        className="bg-[#815FAA] hover:bg-[#684C8A] text-white rounded-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Audit
      </Button>
    </div>
  )
}


export default LinkedInWorkspace
