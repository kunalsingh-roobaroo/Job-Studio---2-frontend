import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Image as ImageIcon, AlignLeft, Briefcase,
    BookOpen, Link as LinkIcon, Award, Star,
    GraduationCap, ThumbsUp, ChevronRight, ChevronLeft,
    CheckCircle2, AlertTriangle, Lightbulb, Sparkles,
    Info, Wrench
} from "lucide-react"

import type { UnifiedLinkedInAudit, LinkedInAudit, ChecklistItem, BannerSection, EnhancedLinkedInAuditResult } from "@/services/api/types"

interface OptimizationSidebarProps {
    auditData: LinkedInAudit | UnifiedLinkedInAudit | EnhancedLinkedInAuditResult | null
    totalScore: number
    checklist: ChecklistItem[]
    isDark?: boolean
    onSelectSection?: (sectionId: string) => void
    onFix?: (itemId: string, contextMessage?: string) => void
}

// ==================== Data Types & Adapter ====================

type SidebarItemStatus = 'pass' | 'warning' | 'critical' | 'info'

interface SidebarItemData {
    id: string
    title: string
    icon: React.ElementType
    status: SidebarItemStatus
    description?: string
    checklistItems: {
        text: string
        status: SidebarItemStatus
        solution?: string
        actionableFix?: string  // NEW: Detailed, personalized fix instructions from LLM
    }[]
    bestPractices?: string[]  // NEW: Best practices from backend
    breakdown?: string  // NEW: Breakdown text from backend
    bannerSummary?: string  // NEW: Banner-level summary (why they got this score)
    howToImprove?: string  // NEW: Banner-level improvement directions
    score?: number  // NEW: Actual score for this banner
    maxScore?: number  // NEW: Max possible score
    experienceEntries?: Array<{  // NEW: Per-experience analysis (Experience banner only)
        jobTitle: string
        company: string
        duration?: string
        summary: string
        score: number
        maxScore: number
        checklistItems: Array<{
            criterion: string
            status: 'pass' | 'fail' | 'warning'
            points: number
            reasoning: string
            actionableFix?: string
        }>
    }>
}

// Icon mapping for banner IDs
const BANNER_ICONS: Record<string, React.ElementType> = {
    profile_photo: User,
    banner: ImageIcon,
    headline: AlignLeft,
    open_to_work: Briefcase,
    about: BookOpen,
    experience: Briefcase,
    skills: Star,
    custom_url: LinkIcon,
    education: GraduationCap,
    featured: Star,
    certifications: Award,
    recommendations: ThumbsUp
}

// HARDCODED STATIC BEST PRACTICES - These never change
const BANNER_BEST_PRACTICES: Record<string, string[]> = {
    photo: [
        "Use a recent, high-resolution headshot with good lighting",
        "Wear professional attire appropriate for your industry",
        "Smile naturally and make eye contact with the camera",
        "Use a plain or neutral background to keep focus on your face"
    ],
    profile_photo: [
        "Use a recent, high-resolution headshot with good lighting",
        "Wear professional attire appropriate for your industry",
        "Smile naturally and make eye contact with the camera",
        "Use a plain or neutral background to keep focus on your face"
    ],
    banner: [
        "Choose a banner that reflects your professional brand or industry",
        "Use high-quality images (1584x396 pixels recommended)",
        "Avoid cluttered designs - keep it clean and professional",
        "Consider showcasing your work, team, or company culture"
    ],
    headline: [
        "Expand to 120-220 characters to maximize LinkedIn's headline space",
        "Add a value proposition (e.g., 'Driving 10M+ ARR growth')",
        "Include target job titles that recruiters search for",
        "Add metrics or achievements to stand out (e.g., 'Ex-Google, 200% growth')"
    ],
    about: [
        "Start with a powerful hook using metrics (e.g., 'Led products serving 10M+ users')",
        "Include 3-4 specific achievements with numbers in the first paragraph",
        "Use first-person voice to create personal connection",
        "End with clear call-to-action and contact method"
    ],
    experience: [
        "Add 3-5 bullet points per role focusing on achievements, not tasks",
        "Include specific metrics for each role (revenue, users, efficiency gains)",
        "List technologies and tools used (e.g., Jira, SQL, Python)",
        "Use STAR format: Situation, Task, Action, Result"
    ],
    skills: [
        "Add skills to reach 30+ total for maximum profile strength",
        "Include mix of hard skills (tools, technologies) and soft skills (leadership)",
        "Pin your 3 most important skills at the top of your profile",
        "Request endorsements from colleagues for your top skills"
    ],
    url: [
        "Claim your custom URL using your name (e.g., linkedin.com/in/firstname-lastname)",
        "Keep it simple - use your name without numbers or special characters",
        "Use the same URL format across professional platforms for consistency",
        "Add your custom URL to your resume, email signature, and business cards"
    ],
    custom_url: [
        "Claim your custom URL using your name (e.g., linkedin.com/in/firstname-lastname)",
        "Keep it simple - use your name without numbers or special characters",
        "Use the same URL format across professional platforms for consistency",
        "Add your custom URL to your resume, email signature, and business cards"
    ],
    education: [
        "Add honors, Dean's List, or academic awards if applicable",
        "Include relevant coursework for early-career professionals",
        "List student leadership roles or extracurricular achievements",
        "For recent grads, include GPA if above 3.5"
    ],
    certs: [
        "Pursue industry-recognized certifications relevant to your field",
        "Keep certifications current - renew before expiration",
        "Include certification IDs and expiration dates for credibility",
        "Prioritize certifications that align with your target roles"
    ],
    certifications: [
        "Pursue industry-recognized certifications relevant to your field",
        "Keep certifications current - renew before expiration",
        "Include certification IDs and expiration dates for credibility",
        "Prioritize certifications that align with your target roles"
    ]
}

function convertBackendBannersToSidebarData(banners: BannerSection[]): SidebarItemData[] {
    console.log('🔍 Converting backend banners to sidebar data:', banners)
    
    return banners.map(banner => {
        console.log(`📊 Processing banner: ${banner.id}`, {
            checklistItemsCount: banner.checklistItems?.length || 0,
            checklistItems: banner.checklistItems,
            hasBannerSummary: !!(banner as any).bannerSummary,
            hasHowToImprove: !!(banner as any).howToImprove
        })
        
        // Determine overall status from checklist items
        const hasFailures = banner.checklistItems.some(item => item.status === 'fail')
        const hasWarnings = banner.checklistItems.some(item => item.status === 'warning')
        const status: SidebarItemStatus = hasFailures ? 'critical' : 
                                          hasWarnings ? 'warning' : 
                                          banner.score > 0 ? 'pass' : 'info'
        
        // ALWAYS use hardcoded best practices from frontend (ignore backend)
        const staticBestPractices = BANNER_BEST_PRACTICES[banner.id] || []
        
        const sidebarItem = {
            id: banner.id,
            title: banner.title,
            icon: BANNER_ICONS[banner.id] || Lightbulb,
            status,
            description: banner.breakdown,
            breakdown: banner.breakdown,
            bannerSummary: (banner as any).bannerSummary,  // NEW: Banner-level summary
            howToImprove: (banner as any).howToImprove,    // NEW: Banner-level improvement directions
            bestPractices: staticBestPractices,  // Use hardcoded practices
            score: banner.score,
            maxScore: banner.maxScore,
            experienceEntries: (banner as any).experienceEntries,  // NEW: Per-experience analysis (Experience banner only)
            checklistItems: banner.checklistItems.map(item => ({
                text: item.criterion,
                status: item.status as SidebarItemStatus,
                solution: item.reasoning,
                actionableFix: (item as any).actionableFix  // NEW: Detailed fix instructions from LLM
            }))
        }
        
        console.log(`✅ Converted sidebar item for ${banner.id}:`, {
            checklistItemsCount: sidebarItem.checklistItems.length,
            firstItem: sidebarItem.checklistItems[0],
            hasBannerSummary: !!sidebarItem.bannerSummary,
            hasHowToImprove: !!sidebarItem.howToImprove,
            hasExperienceEntries: !!sidebarItem.experienceEntries,
            experienceEntriesCount: sidebarItem.experienceEntries?.length || 0
        })
        
        return sidebarItem
    })
}

function useSidebarData(auditData: LinkedInAudit | UnifiedLinkedInAudit | EnhancedLinkedInAuditResult | null, checklist: ChecklistItem[]) {
    return React.useMemo(() => {
        console.log('🔄 useSidebarData called with:', { 
            hasAuditData: !!auditData,
            auditDataKeys: auditData ? Object.keys(auditData) : [],
            checklistLength: checklist.length 
        })
        
        if (!auditData) return []

        const profile = auditData.userProfile
        
        // NEW: Check if we have enhanced banners from backend
        const hasEnhancedBanners = 'checklistAudit' in auditData && 
                                   auditData.checklistAudit?.banners && 
                                   auditData.checklistAudit.banners.length > 0
        
        console.log('🎯 Enhanced banners check:', {
            hasChecklistAudit: 'checklistAudit' in auditData,
            bannersCount: hasEnhancedBanners ? auditData.checklistAudit!.banners.length : 0,
            banners: hasEnhancedBanners ? auditData.checklistAudit!.banners : null
        })
        
        if (hasEnhancedBanners) {
            // Use enhanced banners from backend with full checklist, best practices, and breakdown
            console.log('✅ Using enhanced banners from backend')
            return convertBackendBannersToSidebarData(auditData.checklistAudit!.banners)
        }
        
        console.log('⚠️ Falling back to legacy manual construction')
        
        // LEGACY: Fallback to manual construction
        const items: SidebarItemData[] = []

        // Helper to find checklist items by category
        const getChecklist = (category: string) =>
            checklist.filter(c => c.category === category).map(c => ({
                text: c.title,
                status: c.status,
                solution: c.fixSuggestion || c.bestPractice
            }))

        // 1. Profile Photo
        const hasPhoto = !!(profile.profilePictureUrl || profile.profile_picture_url)
        items.push({
            id: "photo",
            title: "Profile Photo",
            icon: User,
            status: hasPhoto ? 'pass' : 'critical',
            description: hasPhoto ? "Looking Good! Your profile photo is visible." : "Add a professional profile photo to increase views by 21x.",
            checklistItems: [{ text: "Profile photo present", status: hasPhoto ? 'pass' : 'critical' }],
            bestPractices: BANNER_BEST_PRACTICES["photo"]
        })

        // 2. Banner
        const hasBanner = !!(profile.backgroundPictureUrl || profile.background_picture_url)
        items.push({
            id: "banner",
            title: "Banner",
            icon: ImageIcon,
            status: hasBanner ? 'pass' : 'info',
            description: "Use your banner to showcase your personal brand.",
            checklistItems: [{ text: "Custom banner uploaded", status: hasBanner ? 'pass' : 'info' }],
            bestPractices: BANNER_BEST_PRACTICES["banner"]
        })

        // 3. Headline
        const headlineChecks = getChecklist('Headline')
        const headlineStatus = headlineChecks.some(c => c.status === 'critical') ? 'critical' :
            headlineChecks.some(c => c.status === 'warning') ? 'warning' : 'pass'
        items.push({
            id: "headline",
            title: "Headline",
            icon: AlignLeft,
            status: headlineStatus,
            description: "Your headline is the first thing recruiters see.",
            checklistItems: headlineChecks.length ? headlineChecks : [{ text: "Headline present", status: profile.headline ? 'pass' : 'critical' }],
            bestPractices: BANNER_BEST_PRACTICES["headline"]
        })

        // 4. About
        const aboutChecks = getChecklist('About')
        const aboutStatus = aboutChecks.some(c => c.status === 'critical') ? 'critical' :
            aboutChecks.some(c => c.status === 'warning') ? 'warning' :
                (profile.about ? 'pass' : 'info')
        items.push({
            id: "about",
            title: "About",
            icon: BookOpen,
            status: aboutStatus,
            description: "Your summary is your elevator pitch.",
            checklistItems: aboutChecks.length ? aboutChecks : [{ text: "Summary section present", status: profile.about ? 'pass' : 'info' }],
            bestPractices: BANNER_BEST_PRACTICES["about"]
        })

        // 5. Experience
        const expChecks = getChecklist('Experience')
        const hasExp = (profile.experience?.length || 0) > 0
        const expStatus = expChecks.some(c => c.status === 'critical') ? 'critical' :
            (hasExp ? 'pass' : 'critical')
        items.push({
            id: "experience",
            title: "Experience",
            icon: Briefcase,
            status: expStatus,
            description: "Detail your impact and achievements.",
            checklistItems: expChecks.length ? expChecks : [{ text: "Experience listed", status: hasExp ? 'pass' : 'critical' }],
            bestPractices: BANNER_BEST_PRACTICES["experience"]
        })

        // 6. Skills
        const skillsChecks = getChecklist('Skills')
        const hasSkills = (profile.skills?.length || 0) > 0
        items.push({
            id: "skills",
            title: "Skills",
            icon: Star,
            status: hasSkills ? 'pass' : 'critical',
            description: "Add at least 5 relevant skills.",
            checklistItems: skillsChecks.length ? skillsChecks : [{ text: "Skills added", status: hasSkills ? 'pass' : 'critical' }],
            bestPractices: BANNER_BEST_PRACTICES["skills"]
        })

        // 7. LinkedIn URL
        items.push({
            id: "url",
            title: "LinkedIn URL",
            icon: LinkIcon,
            status: 'pass',
            description: "A clean custom URL looks professional.",
            checklistItems: [{ text: "Custom URL claimed", status: 'pass' }],
            bestPractices: BANNER_BEST_PRACTICES["url"]
        })

        // 8. Education
        const hasEdu = (profile.education?.length || 0) > 0
        items.push({
            id: "education",
            title: "Education",
            icon: GraduationCap,
            status: hasEdu ? 'pass' : 'critical',
            description: "List your educational background.",
            checklistItems: [{ text: "Education section present", status: hasEdu ? 'pass' : 'critical' }],
            bestPractices: BANNER_BEST_PRACTICES["education"]
        })

        // 9. Licences and Certs
        const certsChecks = getChecklist('Certifications')
        const hasCerts = (profile.certifications?.length || 0) > 0
        items.push({
            id: "certs",
            title: "Licence and Certs",
            icon: Award,
            status: hasCerts ? 'pass' : 'info',
            description: "Validate your expertise with certifications.",
            checklistItems: certsChecks.length ? certsChecks : [{ text: "Certifications added", status: hasCerts ? 'pass' : 'info' }],
            bestPractices: BANNER_BEST_PRACTICES["certs"]
        })

        return items
    }, [auditData, checklist])
}

// ==================== Components ====================

function StatusIcon({ status, className }: { status: SidebarItemStatus, className?: string }) {
    if (status === 'pass') return <CheckCircle2 className={cn("text-green-500", className)} />
    if (status === 'warning') return <AlertTriangle className={cn("text-[#ea580c]", className)} />
    if (status === 'critical') return <AlertTriangle className={cn("text-red-500", className)} />
    return <Lightbulb className={cn("text-yellow-500", className)} />
}

// Component for rendering experience checklist items with expand/collapse
function ExperienceChecklistItems({ 
    items, 
    experience, 
    expIdx, 
    onFix 
}: { 
    items: Array<{
        criterion: string
        status: 'pass' | 'fail' | 'warning'
        points: number
        reasoning: string
        actionableFix?: string
    }>
    experience: {
        jobTitle: string
        company: string
        duration?: string
        summary: string
        score: number
        maxScore: number
    }
    expIdx: number
    onFix?: (itemId: string, contextMessage?: string) => void
}) {
    const [expandedSubItem, setExpandedSubItem] = React.useState<number | null>(null)
    
    return (
        <div>
            <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">
                Checklist
            </h5>
            <div className="space-y-2">
                {items.map((item, itemIdx) => {
                    const isExpanded = expandedSubItem === itemIdx
                    
                    return (
                        <div key={itemIdx} className="space-y-2">
                            {/* Clickable Checklist Item */}
                            <button
                                onClick={() => setExpandedSubItem(isExpanded ? null : itemIdx)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                                    isExpanded 
                                        ? "bg-white border-2 border-violet-200 shadow-sm" 
                                        : "bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white"
                                )}
                            >
                                {item.status === 'pass' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                ) : item.status === 'warning' ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900">{item.criterion}</p>
                                    {!isExpanded && item.reasoning && (
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{item.reasoning}</p>
                                    )}
                                </div>
                                <ChevronRight className={cn(
                                    "w-4 h-4 flex-shrink-0 mt-0.5 transition-transform text-slate-400",
                                    isExpanded && "rotate-90"
                                )} />
                            </button>
                            
                            {/* Expanded Detail */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 space-y-4"
                                    >
                                        {/* Analysis Section */}
                                        {item.reasoning && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Info className="w-4 h-4 text-amber-600" />
                                                    <h6 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                                        Analysis
                                                    </h6>
                                                </div>
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                                    {item.reasoning}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Suggested Fix Section */}
                                        {item.actionableFix && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Wrench className="w-4 h-4 text-violet-600" />
                                                    <h6 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                                        Suggested Fix
                                                    </h6>
                                                </div>
                                                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                                    {item.actionableFix}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Auto-fix button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                const contextMessage = `Help me fix: ${item.criterion} for my ${experience.jobTitle} role at ${experience.company}. ${item.reasoning}`
                                                onFix?.(`experience_${expIdx}_item_${itemIdx}`, contextMessage)
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            Auto-Fix with Copilot
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function OptimizationSidebar({
    auditData,
    totalScore,
    checklist,
    isDark = false,
    onSelectSection,
    onFix
}: OptimizationSidebarProps) {
    const items = useSidebarData(auditData, checklist)
    const [selectedId, setSelectedId] = React.useState<string | null>(null)
    const [view, setView] = React.useState<'list' | 'detail'>('list')
    const [expandedChecklistItem, setExpandedChecklistItem] = React.useState<number | null>(null)
    const [detailTab, setDetailTab] = React.useState<'review' | 'practices'>('review')
    // const { currentLanguage } = useLanguage() // Temporarily unused, can re-enable for i18n

    const selectedItem = React.useMemo(() => {
        const item = items.find(i => i.id === selectedId)
        if (item?.id === 'experience') {
            console.log('📊 Experience banner selected:', {
                hasExperienceEntries: !!(item as any).experienceEntries,
                experienceEntriesCount: (item as any).experienceEntries?.length || 0,
                experienceEntries: (item as any).experienceEntries,
                fullItem: item
            })
        }
        return item
    }, [items, selectedId])

    const handleItemClick = (id: string) => {
        setSelectedId(id)
        setView('detail')
        setExpandedChecklistItem(null) // Reset expanded item when switching sections
        setDetailTab('review') // Reset to review tab when switching sections
        onSelectSection?.(id)
    }

    const handleBack = () => {
        setView('list')
        setSelectedId(null)
        setExpandedChecklistItem(null) // Reset expanded item when going back
        setDetailTab('review') // Reset to review tab when going back
    }

    return (
        <div className="w-full h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden font-['Inter',sans-serif]">
            {/* LinkedIn Score Header - Enterprise Clean Design */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-slate-900 text-3xl font-semibold">LinkedIn Score</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Profile analysis results
                        </p>
                    </div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-gray-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                className="text-violet-600"
                                strokeDasharray={`${totalScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-slate-900">{totalScore}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Summary - Plain Text */}
                {view === 'list' && auditData && 'checklistAudit' in auditData && auditData.checklistAudit?.summary && (
                    <div className="mt-4 bg-violet-50 border-l-4 border-violet-500 rounded-r-md p-4">
                        <p className="text-sm leading-relaxed text-slate-700">
                            {auditData.checklistAudit.summary}
                        </p>
                    </div>
                )}
            </div>

            {/* Checklist View - Clean Enterprise List */}
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto custom-scrollbar"
                    >
                        <div className="divide-y divide-gray-50">
                            {items.map((item) => {
                                const scorePercent = item.maxScore && item.maxScore > 0 
                                    ? (item.score || 0) / item.maxScore * 100 
                                    : (item.status === 'pass' ? 100 : item.status === 'warning' ? 60 : 30)
                                
                                const displayScore = (item.score !== undefined && item.maxScore !== undefined)
                                    ? `${Math.round(item.score)}/${Math.round(item.maxScore)}`
                                    : null
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item.id)}
                                        className="w-full flex items-center justify-between py-4 px-6 transition-colors hover:bg-slate-50 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-base font-medium text-slate-900">
                                                {item.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {displayScore && (
                                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                                                    {displayScore}
                                                </span>
                                            )}
                                            {item.status === 'pass' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : item.status === 'warning' ? (
                                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            ) : item.status === 'critical' ? (
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Lightbulb className="w-5 h-5 text-slate-400" />
                                            )}
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
                {view === 'detail' && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col overflow-hidden bg-white"
                    >
                        {/* Clean Back Bar */}
                        <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <span className="text-xs text-slate-400 font-mono">
                                {items.findIndex(i => i.id === selectedId) + 1} / {items.length}
                            </span>
                        </div>

                        {/* Horizontal Score Pills - Clean Design */}
                        <div className="px-6 py-4 overflow-x-auto custom-scrollbar flex-shrink-0 border-b border-gray-100">
                            <div className="flex gap-2 min-w-max">
                                {items.map((item) => {
                                    const scorePercent = item.maxScore && item.maxScore > 0 
                                        ? (item.score || 0) / item.maxScore * 100 
                                        : (item.status === 'pass' ? 100 : item.status === 'warning' ? 60 : 30)
                                    
                                    const displayScore = (item.score !== undefined && item.maxScore !== undefined)
                                        ? `${Math.round(item.score)}/${Math.round(item.maxScore)}`
                                        : `${Math.round(scorePercent)}%`
                                    
                                    const IconComponent = item.icon
                                    const isSelected = item.id === selectedId
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(item.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg border transition-all whitespace-nowrap",
                                                isSelected 
                                                    ? "bg-violet-50 border-violet-200 text-violet-900" 
                                                    : "bg-white border-gray-200 text-slate-600 hover:border-gray-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="w-4 h-4" />
                                                <span className="text-xs font-semibold">{displayScore}</span>
                                            </div>
                                            <span className="text-[10px] font-medium opacity-70">
                                                {item.title}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Status Alert - Clean Design */}
                            {selectedItem?.status !== 'pass' && (
                                <div className={cn(
                                    "mx-6 mt-6 p-4 rounded-lg border-l-4",
                                    selectedItem?.status === 'critical'
                                        ? "bg-red-50 border-red-500"
                                        : "bg-amber-50 border-amber-500"
                                )}>
                                    <div className="flex items-start gap-3">
                                        {selectedItem?.status === 'critical' ? (
                                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div>
                                            <h3 className={cn(
                                                "font-semibold text-sm",
                                                selectedItem?.status === 'critical' ? "text-red-900" : "text-amber-900"
                                            )}>
                                                {selectedItem?.status === 'critical' ? "Action Required" : "Needs Improvement"}
                                            </h3>
                                            <p className={cn(
                                                "text-sm mt-1 leading-relaxed",
                                                selectedItem?.status === 'critical' ? "text-red-800" : "text-amber-800"
                                            )}>
                                                {selectedItem?.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Navigation - Segmented Control */}
                            <div className="px-6 pt-6">
                                <div className="inline-flex gap-0 p-1 bg-gray-100/50 rounded-lg">
                                    <button
                                        onClick={() => {
                                            setDetailTab('review')
                                            setExpandedChecklistItem(null)
                                        }}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                            detailTab === 'review'
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        Review
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDetailTab('practices')
                                            setExpandedChecklistItem(null)
                                        }}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                            detailTab === 'practices'
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        Best Practices
                                    </button>
                                </div>
                            </div>

                                {/* Tab Content */}
                                <div className="px-6 py-4">
                                {detailTab === 'review' ? (
                                    <div className="space-y-4">
                                    
                                    {/* Diagnostic Thread - Enterprise Audit Log Style */}
                                    <div className="space-y-0 mb-6">
                                        {/* Analysis Item */}
                                        <div className="flex gap-3">
                                            {/* Icon with connector line */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <div className="w-px h-full bg-gray-200 mt-2" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 pb-6">
                                                <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                                    Analysis
                                                </h5>
                                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                                                    {selectedItem?.bannerSummary || "Banner summary will appear here once the backend generates it. Currently testing UI layout."}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Recommendation Item */}
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                    <Wrench className="w-4 h-4 text-violet-600" />
                                                </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1">
                                                <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                                    Suggested Fix
                                                </h5>
                                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                                                    {selectedItem?.howToImprove || "Improvement directions will appear here once the backend generates them. Currently testing UI layout."}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Divider */}
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">
                                                {selectedItem?.id === 'experience' && selectedItem?.experienceEntries ? 'Individual Experiences' : 'Detailed Checklist'}
                                            </h4>
                                        </div>
                                    </div>
                                    
                                    {/* Special handling for Experience banner with individual entries */}
                                    {selectedItem?.id === 'experience' && selectedItem?.experienceEntries && selectedItem.experienceEntries.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedItem.experienceEntries.map((experience, expIdx) => {
                                                const expScore = experience.score || 0
                                                const expMaxScore = experience.maxScore || 1
                                                const expPercent = (expScore / expMaxScore) * 100
                                                const expStatus: SidebarItemStatus = expPercent >= 80 ? 'pass' : expPercent >= 50 ? 'warning' : 'critical'
                                                
                                                return (
                                                    <div key={expIdx} className="space-y-2">
                                                        {/* Experience Card */}
                                                        <button
                                                            onClick={() => {
                                                                setExpandedChecklistItem(expandedChecklistItem === expIdx ? null : expIdx)
                                                            }}
                                                            className={cn(
                                                                "w-full p-4 rounded-xl border transition-all text-left group shadow-sm",
                                                                expandedChecklistItem === expIdx 
                                                                    ? "border-violet-200 bg-violet-50 shadow-md" 
                                                                    : "border-gray-200 hover:border-gray-300 hover:bg-slate-50 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {/* Icon */}
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                    <Briefcase className="w-5 h-5 text-slate-600" />
                                                                </div>
                                                                
                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                                                            {experience.company} - {experience.jobTitle}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                                                                {Math.round(expScore)}/{Math.round(expMaxScore)}
                                                                            </span>
                                                                            {expStatus === 'pass' ? (
                                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                            ) : expStatus === 'warning' ? (
                                                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                                            ) : (
                                                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {experience.duration && (
                                                                        <p className="text-xs text-slate-500 mb-2">{experience.duration}</p>
                                                                    )}
                                                                    {!expandedChecklistItem && (
                                                                        <p className="text-xs text-slate-600 line-clamp-2">
                                                                            {experience.summary}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                
                                                                <ChevronRight className={cn(
                                                                    "w-4 h-4 flex-shrink-0 mt-1 transition-transform text-slate-400",
                                                                    expandedChecklistItem === expIdx && "rotate-90"
                                                                )} />
                                                            </div>
                                                        </button>
                                                        
                                                        {/* Expanded Experience Detail */}
                                                        <AnimatePresence>
                                                            {expandedChecklistItem === expIdx && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm"
                                                                >
                                                                    {/* Summary */}
                                                                    <div>
                                                                        <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                                                            Analysis
                                                                        </h5>
                                                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                                                            {experience.summary}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    {/* Checklist Items for this experience */}
                                                                    {experience.checklistItems && experience.checklistItems.length > 0 && (
                                                                        <ExperienceChecklistItems 
                                                                            items={experience.checklistItems}
                                                                            experience={experience}
                                                                            expIdx={expIdx}
                                                                            onFix={onFix}
                                                                        />
                                                                    )}
                                                                    
                                                                    {/* Improve with Copilot button */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            const contextMessage = `I need help improving my ${experience.jobTitle} experience at ${experience.company}. ${experience.summary}`
                                                                            onFix?.(`experience_${expIdx}`, contextMessage)
                                                                        }}
                                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
                                                                    >
                                                                        <Sparkles className="w-4 h-4" />
                                                                        Improve with Copilot
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                    /* Regular Checklist Items for non-Experience banners */
                                    <div className="space-y-3">
                                    {selectedItem?.checklistItems.map((item, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    setExpandedChecklistItem(expandedChecklistItem === idx ? null : idx)
                                                }}
                                                className={cn(
                                                    "w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left group shadow-sm",
                                                    expandedChecklistItem === idx 
                                                        ? "border-violet-200 bg-violet-50 shadow-md" 
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-slate-50 hover:shadow-md"
                                                )}
                                            >
                                                {item.status === 'pass' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                ) : item.status === 'warning' ? (
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {item.text}
                                                    </p>
                                                    {item.solution && item.status !== 'pass' && !expandedChecklistItem && (
                                                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                                            {item.solution}
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 flex-shrink-0 mt-0.5 transition-transform text-slate-400",
                                                    expandedChecklistItem === idx && "rotate-90"
                                                )} />
                                            </button>
                                            
                                            {/* Expanded Detail - Compact & Focused */}
                                            <AnimatePresence>
                                                {expandedChecklistItem === idx && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm"
                                                    >
                                                        {/* Status Badge */}
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm",
                                                                item.status === 'pass' 
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : item.status === 'warning'
                                                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                    : "bg-red-50 text-red-700 border border-red-200"
                                                            )}>
                                                                {item.status === 'pass' ? '✓ Passed' : item.status === 'warning' ? '⚠ Needs Work' : '✗ Failed'}
                                                            </div>
                                                        </div>

                                                        {/* Criterion */}
                                                        <div>
                                                            <h5 className="text-sm font-semibold text-slate-900 mb-2">
                                                                Criterion
                                                            </h5>
                                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                                {item.text}
                                                            </p>
                                                        </div>

                                                        {/* Diagnostic Thread: Analysis + Suggested Fix */}
                                                        {item.solution && (
                                                            <div className="space-y-4">
                                                                {/* Analysis Section */}
                                                                <div className="flex gap-3">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                                            <Info className="w-3.5 h-3.5 text-amber-600" />
                                                                        </div>
                                                                        {item.status !== 'pass' && (item.actionableFix || item.solution) && (
                                                                            <div className="w-px h-full bg-gray-200 mt-2" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 pb-2">
                                                                        <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                                                            {item.status === 'pass' ? 'What\'s Right' : 'Analysis'}
                                                                        </h5>
                                                                        <p className="text-xs text-slate-700 leading-relaxed">
                                                                            {item.solution}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Suggested Fix Section */}
                                                                {item.status !== 'pass' && (item.actionableFix || item.solution) && (
                                                                    <div className="flex gap-3">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                                                <Wrench className="w-3.5 h-3.5 text-violet-600" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h5 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
                                                                                Suggested Fix
                                                                            </h5>
                                                                            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                                                                {(item as any).actionableFix || item.solution}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                    </div>
                                    )}
                                    </div>
                                ) : (
                                    /* Best Practices Tab - Clean List */
                                    <div className="space-y-3">
                                        {selectedItem?.bestPractices && selectedItem.bestPractices.length > 0 ? (
                                            selectedItem.bestPractices.map((practice, idx) => (
                                                <div key={idx} className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                                                    <Lightbulb className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-slate-700 leading-relaxed">
                                                        {practice}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 rounded-lg border border-gray-200 bg-slate-50">
                                                <p className="text-sm text-slate-600">
                                                    No specific best practices available for this section.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Improve with Copilot Button - Modern Rounded Style */}
                                {selectedItem?.status !== 'pass' && detailTab === 'review' && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            
                                            const failedItems = selectedItem?.checklistItems.filter(item => item.status !== 'pass') || []
                                            const issuesList = failedItems.map(item => `- ${item.text}`).join('\n')
                                            
                                            const contextMessage = `I need help fixing my ${selectedItem?.title} section. Here are the issues:\n\n${issuesList}\n\nCan you provide specific advice on how to improve this?`
                                            
                                            onFix?.(selectedItem?.id || "", contextMessage)
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all bg-violet-600 hover:bg-violet-700 active:scale-[0.98] shadow-md hover:shadow-lg mt-6"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Improve with Copilot
                                    </button>
                                )}
                                </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
