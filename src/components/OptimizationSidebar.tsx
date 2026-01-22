import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Image as ImageIcon, AlignLeft, Briefcase,
    BookOpen, Link as LinkIcon, Award, Star,
    GraduationCap, ThumbsUp, ChevronRight, ChevronLeft,
    CheckCircle2, AlertTriangle, Lightbulb, Sparkles
} from "lucide-react"

import type { UnifiedLinkedInAudit, LinkedInAudit, ChecklistItem } from "@/services/api/types"

interface OptimizationSidebarProps {
    auditData: LinkedInAudit | UnifiedLinkedInAudit | null
    totalScore: number
    checklist: ChecklistItem[]
    isDark?: boolean
    onSelectSection?: (sectionId: string) => void
    onFix?: (itemId: string) => void
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
    }[]
}

function useSidebarData(auditData: LinkedInAudit | UnifiedLinkedInAudit | null, checklist: ChecklistItem[]) {
    return React.useMemo(() => {
        if (!auditData) return []

        const profile = auditData.userProfile
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
            checklistItems: [{ text: "Profile photo present", status: hasPhoto ? 'pass' : 'critical' }]
        })

        // 2. Banner
        const hasBanner = !!(profile.backgroundPictureUrl || profile.background_picture_url)
        items.push({
            id: "banner",
            title: "Banner",
            icon: ImageIcon,
            status: hasBanner ? 'pass' : 'info',
            description: "Use your banner to showcase your personal brand.",
            checklistItems: [{ text: "Custom banner uploaded", status: hasBanner ? 'pass' : 'info' }]
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
            checklistItems: headlineChecks.length ? headlineChecks : [{ text: "Headline present", status: profile.headline ? 'pass' : 'critical' }]
        })

        // 4. Open To Work
        // Mocking 'pass' as typically this is a setting not always visible in public scrape without deep auth
        items.push({
            id: "opentowork",
            title: "Open To Work",
            icon: Briefcase,
            status: 'pass',
            description: "Letting recruiters know you are open to opportunities is key.",
            checklistItems: [{ text: "Open to work status enabled", status: 'pass' }]
        })

        // 5. About
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
            checklistItems: aboutChecks.length ? aboutChecks : [{ text: "Summary section present", status: profile.about ? 'pass' : 'info' }]
        })

        // 6. Experience
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
            checklistItems: expChecks.length ? expChecks : [{ text: "Experience listed", status: hasExp ? 'pass' : 'critical' }]
        })

        // 7. Skills
        const skillsChecks = getChecklist('Skills')
        const hasSkills = (profile.skills?.length || 0) > 0
        items.push({
            id: "skills",
            title: "Skills",
            icon: Star,
            status: hasSkills ? 'pass' : 'critical',
            description: "Add at least 5 relevant skills.",
            checklistItems: skillsChecks.length ? skillsChecks : [{ text: "Skills added", status: hasSkills ? 'pass' : 'critical' }]
        })

        // 8. LinkedIn URL
        items.push({
            id: "url",
            title: "LinkedIn URL",
            icon: LinkIcon,
            status: 'pass',
            description: "A clean custom URL looks professional.",
            checklistItems: [{ text: "Custom URL claimed", status: 'pass' }]
        })

        // 9. Education
        const hasEdu = (profile.education?.length || 0) > 0
        items.push({
            id: "education",
            title: "Education",
            icon: GraduationCap,
            status: hasEdu ? 'pass' : 'critical',
            description: "List your educational background.",
            checklistItems: [{ text: "Education section present", status: hasEdu ? 'pass' : 'critical' }]
        })

        // 10. Featured
        items.push({
            id: "featured",
            title: "Featured",
            icon: Star,
            status: 'info',
            description: "Showcase your best work (posts, articles, links).",
            checklistItems: [{ text: "Featured items added", status: 'info' }]
        })

        // 11. Licences and Certs
        const certsChecks = getChecklist('Certifications')
        const hasCerts = (profile.certifications?.length || 0) > 0
        items.push({
            id: "certs",
            title: "Licence and Certs",
            icon: Award,
            status: hasCerts ? 'pass' : 'info',
            description: "Validate your expertise with certifications.",
            checklistItems: certsChecks.length ? certsChecks : [{ text: "Certifications added", status: hasCerts ? 'pass' : 'info' }]
        })

        // 12. Recommendations
        items.push({
            id: "recommendations",
            title: "Recommendations",
            icon: ThumbsUp,
            status: 'pass',
            description: "Social proof builds trust.",
            checklistItems: [{ text: "Recommendations received", status: 'pass' }]
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
    const [listMode, setListMode] = React.useState<'breakdown' | 'checklist'>('checklist')
    // const { currentLanguage } = useLanguage() // Temporarily unused, can re-enable for i18n

    const selectedItem = React.useMemo(() =>
        items.find(i => i.id === selectedId),
        [items, selectedId])

    const handleItemClick = (id: string) => {
        setSelectedId(id)
        setView('detail')
        onSelectSection?.(id)
    }

    const handleBack = () => {
        setView('list')
        setSelectedId(null)
    }

    return (
        <div className={cn(
            "w-full h-full flex flex-col rounded-xl overflow-hidden shadow-sm border transition-colors duration-300 font-['Inter',sans-serif]",
            isDark ? "bg-[#1f1f1f] border-zinc-700" : "bg-white border-gray-200"
        )}>
            {/* LinkedIn Score Header - Only show in List View or integrate? 
                Reference image shows it at top. We'll keep it fixed at top for both views or only list?
                CareerFlow usually keeps header.
            */}
            <div className={cn(
                "p-6 flex-shrink-0",
                isDark ? "bg-[#1e293b]" : "bg-[#684C8A]" // Darkest Purple
            )}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-white text-2xl font-medium">LinkedIn Score</h2>
                        <p className="text-[#DFC4FF] text-base opacity-90 mt-1">
                            Result from your LinkedIn Profile
                        </p>
                    </div>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-white/20"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className={cn(
                                    totalScore > 80 ? "text-green-400" : totalScore > 50 ? "text-orange-400" : "text-red-400"
                                )}
                                strokeDasharray={`${totalScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            {totalScore > 80 ? <span className="text-[10px] mb-0.5">🔥</span> : null}
                            <span className="text-sm font-bold">{totalScore}%</span>
                        </div>
                    </div>
                </div>

                {/* Toggle Buttons - Only in List View */}
                {view === 'list' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setListMode('breakdown')
                                setView('list')
                            }}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                listMode === 'breakdown'
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            Breakdown
                        </button>
                        <button
                            onClick={() => {
                                setListMode('checklist')
                                setView('list')
                            }}
                            className={cn(
                                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                listMode === 'checklist'
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            Checklist
                        </button>
                    </div>
                )}
            </div>

            {/* Score Breakdown Overview - Only in List View + Breakdown Mode */}
            {view === 'list' && listMode === 'breakdown' && (
                <div className="flex-1 overflow-y-auto linkedin-scrollbar px-6 py-6">
                    <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
                        Breakdown
                    </h3>
                    <p className={cn("text-sm mb-6", isDark ? "text-gray-400" : "text-gray-600")}>
                        Your score is based on these five sections.
                    </p>

                    <div className="space-y-6">
                        {/* Headline */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                                        <AlignLeft className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                    </div>
                                    <span className={cn("text-base font-medium", isDark ? "text-gray-200" : "text-gray-800")}>Headline</span>
                                </div>
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                    {Math.round((items.find(i => i.id === 'headline')?.status === 'pass' ? 10 : items.find(i => i.id === 'headline')?.status === 'warning' ? 7 : 3))}/10
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden ml-11">
                                <div
                                    className={cn("h-full rounded-full transition-all",
                                        items.find(i => i.id === 'headline')?.status === 'pass' ? "bg-blue-500" : "bg-blue-300"
                                    )}
                                    style={{ width: `${(items.find(i => i.id === 'headline')?.status === 'pass' ? 100 : items.find(i => i.id === 'headline')?.status === 'warning' ? 70 : 30)}%` }}
                                />
                            </div>
                        </div>

                        {/* Summary (About) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                                        <User className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                    </div>
                                    <span className={cn("text-base font-medium", isDark ? "text-gray-200" : "text-gray-800")}>Summary</span>
                                </div>
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                    {Math.round((items.find(i => i.id === 'about')?.status === 'pass' ? 10 : items.find(i => i.id === 'about')?.status === 'warning' ? 5 : 1))}/10
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden ml-11">
                                <div
                                    className={cn("h-full rounded-full transition-all",
                                        items.find(i => i.id === 'about')?.status === 'pass' ? "bg-blue-500" : "bg-blue-300"
                                    )}
                                    style={{ width: `${(items.find(i => i.id === 'about')?.status === 'pass' ? 100 : items.find(i => i.id === 'about')?.status === 'warning' ? 50 : 10)}%` }}
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                                        <Briefcase className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                    </div>
                                    <span className={cn("text-base font-medium", isDark ? "text-gray-200" : "text-gray-800")}>Experience</span>
                                </div>
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                    {Math.round((items.find(i => i.id === 'experience')?.status === 'pass' ? 10 : 5))}/10
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden ml-11">
                                <div
                                    className={cn("h-full rounded-full transition-all",
                                        items.find(i => i.id === 'experience')?.status === 'pass' ? "bg-blue-500" : "bg-gray-400"
                                    )}
                                    style={{ width: `${(items.find(i => i.id === 'experience')?.status === 'pass' ? 100 : 50)}%` }}
                                />
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                                        <GraduationCap className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                    </div>
                                    <span className={cn("text-base font-medium", isDark ? "text-gray-200" : "text-gray-800")}>Education</span>
                                </div>
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                    {Math.round((items.find(i => i.id === 'education')?.status === 'pass' ? 10 : 5))}/10
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden ml-11">
                                <div
                                    className={cn("h-full rounded-full transition-all",
                                        items.find(i => i.id === 'education')?.status === 'pass' ? "bg-blue-500" : "bg-blue-400"
                                    )}
                                    style={{ width: `${(items.find(i => i.id === 'education')?.status === 'pass' ? 100 : 50)}%` }}
                                />
                            </div>
                        </div>

                        {/* Other (Skills, Certs, etc.) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                                        <Award className={cn("w-4 h-4", isDark ? "text-gray-400" : "text-gray-600")} />
                                    </div>
                                    <span className={cn("text-base font-medium", isDark ? "text-gray-200" : "text-gray-800")}>Other</span>
                                </div>
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                    {Math.round(((items.find(i => i.id === 'skills')?.status === 'pass' ? 1 : 0) +
                                        (items.find(i => i.id === 'certs')?.status === 'pass' ? 1 : 0)) * 5)}/10
                                </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden ml-11">
                                <div
                                    className={cn("h-full rounded-full transition-all",
                                        items.find(i => i.id === 'skills')?.status === 'pass' ? "bg-blue-500" : "bg-blue-300"
                                    )}
                                    style={{ width: `${((items.find(i => i.id === 'skills')?.status === 'pass' ? 1 : 0) + (items.find(i => i.id === 'certs')?.status === 'pass' ? 1 : 0)) * 50}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <p className={cn("text-xs mt-4 text-center", isDark ? "text-gray-500" : "text-gray-500")}>
                        Click on any section to dive deeper
                    </p>
                </div>
            )}

            {/* Checklist View - Only when in list mode + checklist */}
            <AnimatePresence mode="wait">
                {view === 'list' && listMode === 'checklist' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto linkedin-scrollbar"
                    >
                        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between py-3 px-4 transition-colors group",
                                        isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                                            isDark ? "text-gray-400" : "text-gray-500 bg-transparent"
                                        )}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isDark ? "text-gray-200" : "text-[#684C8A]" // Darkest Purple
                                        )}>
                                            {item.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusIcon status={item.status} className="w-4 h-4" />
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-transform group-hover:translate-x-1",
                                            isDark ? "text-gray-600" : "text-gray-300"
                                        )} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
                {view === 'detail' && (
                    // Detail View
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]" // Light gray bg for detail
                    >
                        {/* Enhanced Back Bar with Navigation */}
                        <div className={cn(
                            "px-6 py-3 flex items-center justify-between",
                            isDark ? "bg-[#1e293b]" : "bg-[#684C8A]" // Darkest Purple
                        )}>
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            <span className="ml-auto text-white/60 text-xs font-mono">
                                {items.findIndex(i => i.id === selectedId) + 1}/{items.length}
                            </span>
                        </div>

                        {/* Section Title with Prev/Next Navigation */}
                        <div className={cn(
                            "px-6 py-4 flex items-center justify-between",
                            isDark ? "bg-[#2d3748]" : "bg-[#815FAA]" // Base Purple, slightly lighter
                        )}>
                            <button
                                onClick={() => {
                                    const currentIndex = items.findIndex(i => i.id === selectedId)
                                    if (currentIndex > 0) {
                                        const prevItem = items[currentIndex - 1]
                                        handleItemClick(prevItem.id)
                                    }
                                }}
                                disabled={items.findIndex(i => i.id === selectedId) === 0}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
                                    items.findIndex(i => i.id === selectedId) === 0
                                        ? "opacity-40 cursor-not-allowed"
                                        : "hover:bg-white/10"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                                <span className="text-sm font-medium text-white">Prev</span>
                            </button>

                            <h3 className="text-lg font-bold text-white">
                                {selectedItem?.title}
                            </h3>

                            <button
                                onClick={() => {
                                    const currentIndex = items.findIndex(i => i.id === selectedId)
                                    if (currentIndex < items.length - 1) {
                                        const nextItem = items[currentIndex + 1]
                                        handleItemClick(nextItem.id)
                                    }
                                }}
                                disabled={items.findIndex(i => i.id === selectedId) === items.length - 1}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
                                    items.findIndex(i => i.id === selectedId) === items.length - 1
                                        ? "opacity-40 cursor-not-allowed"
                                        : "hover:bg-white/10"
                                )}
                            >
                                <span className="text-sm font-medium text-white">Next</span>
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Status Banner */}
                        <div className={cn(
                            "p-5",
                            selectedItem?.status === 'pass'
                                ? "bg-[#dcfce7]" // Green-100
                                : selectedItem?.status === 'critical'
                                    ? "bg-[#fee2e2]" // Red-100
                                    : "bg-[#DFC4FF]/30" // Lightest Purple (with opacity)
                        )}>
                            <div className="flex items-start gap-3">
                                <StatusIcon status={selectedItem?.status || 'info'} className="w-6 h-6 mt-0.5" />
                                <div>
                                    <h3 className={cn("font-bold text-[16px]",
                                        selectedItem?.status === 'pass' ? "text-green-800" :
                                            selectedItem?.status === 'critical' ? "text-red-800" : "text-[#684C8A]" // Darkest Purple
                                    )}>
                                        {selectedItem?.status === 'pass' ? "Looking Good" : selectedItem?.status === 'critical' ? "Action Required" : "Suggestion"}
                                    </h3>
                                    <p className={cn("text-sm mt-1 leading-relaxed",
                                        selectedItem?.status === 'pass' ? "text-green-800" :
                                            selectedItem?.status === 'critical' ? "text-red-800" : "text-[#684C8A]" // Darkest Purple
                                    )}>
                                        {selectedItem?.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className={cn(
                            "flex-1 overflow-y-auto p-4 space-y-4",
                            isDark ? "bg-[#1f1f1f]" : "bg-white"
                        )}>
                            {/* Checklist Card */}
                            <div className={cn(
                                "rounded-lg border p-4",
                                isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"
                            )}>
                                <h4 className={cn("font-bold text-sm mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
                                    <CheckCircle2 className="w-4 h-4" /> CheckList
                                </h4>
                                <div className="space-y-4">
                                    {selectedItem?.checklistItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <StatusIcon status={item.status} className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className={cn("text-sm font-medium", isDark ? "text-gray-200" : "text-gray-700")}>
                                                    {item.text}
                                                </p>
                                                {item.solution && item.status !== 'pass' && (
                                                    <div className={cn(
                                                        "mt-2 p-2 rounded text-xs leading-relaxed",
                                                        isDark ? "bg-zinc-900 text-gray-400" : "bg-gray-50 text-gray-600 border border-gray-100"
                                                    )}>
                                                        💡 {item.solution}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* More Info Card */}
                            <div className={cn(
                                "rounded-lg border p-4",
                                isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200 shadow-sm"
                            )}>
                                <h4 className={cn("font-bold text-sm mb-2 flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
                                    <BookOpen className="w-4 h-4" /> Best Practices
                                </h4>
                                <div className={cn("text-sm leading-relaxed space-y-2", isDark ? "text-gray-400" : "text-gray-600")}>
                                    <p>
                                        <strong>"{selectedItem?.title}"</strong> is a key component of your profile.
                                    </p>
                                    <p>
                                        Optimizing this section improves your search visibility (SEO) and increases the likelihood of recruiters contacting you.
                                        Check typical best practices:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Be clear and concise.</li>
                                        <li>Use industry-standard keywords.</li>
                                        <li>proofread for any spelling errors.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Fix with Copilot Button */}
                            {selectedItem?.status !== 'pass' && (
                                <button
                                    onClick={() => onFix?.(selectedItem?.id || "")}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-[#815FAA] to-[#684C8A] hover:from-[#9D7FC1] hover:to-[#684C8A] shadow-md hover:shadow-lg active:scale-[0.98]"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Fix with Copilot
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
