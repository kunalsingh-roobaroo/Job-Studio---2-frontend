import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    User, Image as ImageIcon, AlignLeft, Briefcase,
    BookOpen, Link as LinkIcon, Award, Star,
    GraduationCap, ThumbsUp, ChevronRight, ChevronLeft,
    CheckCircle2, AlertTriangle, Lightbulb, Sparkles,
    Info
} from "lucide-react"
import { AutoFixButton } from "@/components/ui/AutoFixButton"

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

// ==================== Spikes Data (Hardcoded) ====================
interface SpikeData {
    id: string
    title: string
    subtitle: string
    icon: React.ElementType
    keyDrivers: string[]
}

const SPIKES_DATA: SpikeData[] = [
    {
        id: "search_discovery",
        title: "Search & Discovery Spike",
        subtitle: "Algorithmic Visibility",
        icon: Star,
        keyDrivers: [
            "Keyword density in headline",
            "Keywords in about section",
            "Experience titles with standard role names",
            "Skills section comprehensiveness",
            "Location + industry tagging",
            "Profile completeness score"
        ]
    },
    {
        id: "positioning",
        title: "Positioning Spike",
        subtitle: "Identity Clarity",
        icon: User,
        keyDrivers: [
            "Headline clarity (role + domain + value)",
            "Narrative consistency across sections",
            "Niche clarity",
            "Vertical specificity (e.g., 'AI in education ops' vs 'AI enthusiast')"
        ]
    },
    {
        id: "credibility",
        title: "Credibility Spike",
        subtitle: "Trust Signals",
        icon: Award,
        keyDrivers: [
            "Brand associations (companies, institutes)",
            "Recommendations",
            "Endorsements",
            "Verifiable timelines",
            "Public work artifacts (portfolio)",
            "Media mentions / publications"
        ]
    },
    {
        id: "authority",
        title: "Authority Spike",
        subtitle: "Perceived Expertise",
        icon: BookOpen,
        keyDrivers: [
            "Insight posts",
            "Technical breakdowns",
            "Case studies",
            "Long-form content",
            "Educational threads",
            "Opinionated but informed takes",
            "Frameworks and models"
        ]
    },
    {
        id: "social_proof",
        title: "Social Proof Spike",
        subtitle: "Third-Party Validation",
        icon: ThumbsUp,
        keyDrivers: [
            "Engagement on posts",
            "Comments by respected people",
            "Tagged collaborations",
            "Mentions by others",
            "Testimonials",
            "Community presence"
        ]
    },
    {
        id: "network_proximity",
        title: "Network Proximity Spike",
        subtitle: "Graph Advantage",
        icon: LinkIcon,
        keyDrivers: [
            "Proximity to decision-makers",
            "Alumni networks",
            "Founder circles",
            "Operator clusters",
            "Recruiter clusters",
            "Community hubs"
        ]
    },
    {
        id: "activity",
        title: "Activity Spike",
        subtitle: "Feed Presence",
        icon: Briefcase,
        keyDrivers: [
            "Posting frequency",
            "Commenting quality",
            "Thoughtful replies",
            "Engagement loops",
            "Recurring themes"
        ]
    },
    {
        id: "narrative",
        title: "Narrative Spike",
        subtitle: "Story Power",
        icon: AlignLeft,
        keyDrivers: [
            "Journey storytelling",
            "Transformation narratives",
            "Mission clarity",
            "Purpose-driven content",
            "Founder/operator identity arc"
        ]
    },
    {
        id: "conversion",
        title: "Conversion Spike",
        subtitle: "Profile Funnel Design",
        icon: CheckCircle2,
        keyDrivers: [
            "Clear CTA in About",
            "Contact clarity",
            "Calendly / email accessibility",
            "'Open to work / collaborate' clarity",
            "Service offering clarity",
            "Role interest clarity"
        ]
    },
    {
        id: "signal_noise",
        title: "Signal-to-Noise Spike",
        subtitle: "Profile Quality Control",
        icon: AlertTriangle,
        keyDrivers: [
            "No spammy buzzwords",
            "No generic fluff",
            "No cringe motivational quotes",
            "No vague claims",
            "Clean structure",
            "Professional tone"
        ]
    }
]

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

// Best Practice Images - Add your image URLs here
// Best Practice Images - mapped to actual files in /public/images/best-practices/
// Available images: headshot-example.png, headline-example.png, about-hook.png,
// action-verbs.png, skills-section.png, custom-url.png, education-section.png, certifications.jpg.png
const BEST_PRACTICE_IMAGES: Record<string, string> = {
    // Photo/Headshot practices
    "headshot": "/images/best-practices/headshot-example.png",
    "photo": "/images/best-practices/headshot-example.png",
    "professional attire": "/images/best-practices/headshot-example.png",
    "eye contact": "/images/best-practices/headshot-example.png",
    "background": "/images/best-practices/headshot-example.png",
    "lighting": "/images/best-practices/headshot-example.png",
    
    // Banner practices (no banner image yet - will use headline as fallback)
    "banner": "/images/best-practices/headline-example.png",
    "1584x396": "/images/best-practices/headline-example.png",
    
    // Headline practices
    "headline": "/images/best-practices/headline-example.png",
    "120-220": "/images/best-practices/headline-example.png",
    "120": "/images/best-practices/headline-example.png",
    "220": "/images/best-practices/headline-example.png",
    "value proposition": "/images/best-practices/headline-example.png",
    "keyword": "/images/best-practices/headline-example.png",
    "recruiter": "/images/best-practices/headline-example.png",
    
    // About section practices
    "hook": "/images/best-practices/about-hook.png",
    "opening": "/images/best-practices/about-hook.png",
    "first-person": "/images/best-practices/about-hook.png",
    "first person": "/images/best-practices/about-hook.png",
    "call-to-action": "/images/best-practices/about-hook.png",
    "contact": "/images/best-practices/about-hook.png",
    "metric": "/images/best-practices/about-hook.png",
    
    // Experience practices
    "action verb": "/images/best-practices/action-verbs.png",
    "action verbs": "/images/best-practices/action-verbs.png",
    "bullet": "/images/best-practices/action-verbs.png",
    "star": "/images/best-practices/action-verbs.png",
    "situation": "/images/best-practices/action-verbs.png",
    "achievement": "/images/best-practices/action-verbs.png",
    "technologies": "/images/best-practices/action-verbs.png",
    "tools": "/images/best-practices/action-verbs.png",
    
    // Skills practices
    "skill": "/images/best-practices/skills-section.png",
    "skills": "/images/best-practices/skills-section.png",
    "endorsement": "/images/best-practices/skills-section.png",
    "30+": "/images/best-practices/skills-section.png",
    "30": "/images/best-practices/skills-section.png",
    "pin": "/images/best-practices/skills-section.png",
    
    // URL practices
    "custom url": "/images/best-practices/custom-url.png",
    "linkedin.com/in": "/images/best-practices/custom-url.png",
    "url": "/images/best-practices/custom-url.png",
    
    // Education practices
    "education": "/images/best-practices/education-section.png",
    "gpa": "/images/best-practices/education-section.png",
    "honors": "/images/best-practices/education-section.png",
    "dean": "/images/best-practices/education-section.png",
    "coursework": "/images/best-practices/education-section.png",
    "student": "/images/best-practices/education-section.png",
    
    // Certification practices
    "certification": "/images/best-practices/certifications.png",
    "certifications": "/images/best-practices/certifications.png",
    "credential": "/images/best-practices/certifications.png",
}

// Function to get image URL for a practice
function getBestPracticeImage(practice: string): string | null {
    const lowerPractice = practice.toLowerCase()
    
    for (const [keyword, imageUrl] of Object.entries(BEST_PRACTICE_IMAGES)) {
        if (lowerPractice.includes(keyword.toLowerCase())) {
            return imageUrl
        }
    }
    
    return null // Return null if no matching image
}

// Expandable Best Practice Item Component
function BestPracticeItem({ practice }: { practice: string; index: number }) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)
    
    const imageUrl = getBestPracticeImage(practice)
    
    // Generate detailed content based on the practice
    const getDetailedContent = (practice: string): string => {
        // Add more context/explanation for each practice
        const lowerPractice = practice.toLowerCase()
        
        if (lowerPractice.includes('headshot') || lowerPractice.includes('photo')) {
            return "A professional headshot significantly increases your profile's credibility. Studies show profiles with photos receive 21x more views and 9x more connection requests. Ensure good lighting, a neutral background, and professional attire appropriate for your industry."
        }
        if (lowerPractice.includes('banner') || lowerPractice.includes('background')) {
            return "Your banner image is prime real estate for personal branding. Use it to showcase your expertise, company culture, or professional achievements. The recommended size is 1584x396 pixels. Consider including your value proposition or key accomplishments."
        }
        if (lowerPractice.includes('headline') || lowerPractice.includes('120') || lowerPractice.includes('220')) {
            return "Your headline appears in search results, connection requests, and comments. Maximize the 220-character limit by including your role, value proposition, and 2-3 keywords recruiters search for. Top performers use formats like: 'Role | Achievement | Value Proposition'."
        }
        if (lowerPractice.includes('keyword')) {
            return "LinkedIn's algorithm matches profiles to job searches based on keywords. Research job postings in your target role and include those terms naturally in your headline, about section, and experience. Focus on skills, tools, and industry-specific terminology."
        }
        if (lowerPractice.includes('hook') || lowerPractice.includes('opening')) {
            return "The first 3 lines of your About section appear before the 'see more' button. Make them count with a compelling hook that showcases your unique value. Lead with an achievement, a bold statement, or a question that resonates with your target audience."
        }
        if (lowerPractice.includes('metric') || lowerPractice.includes('achievement') || lowerPractice.includes('number')) {
            return "Quantified achievements are 40% more likely to catch a recruiter's attention. Instead of 'improved sales,' say 'increased sales by 150% ($2M ARR).' Include revenue generated, users impacted, efficiency gains, or team sizes managed."
        }
        if (lowerPractice.includes('action verb')) {
            return "Strong action verbs make your experience more dynamic and impactful. Use words like 'Spearheaded,' 'Architected,' 'Transformed,' 'Accelerated,' instead of passive phrases like 'Responsible for' or 'Worked on.'"
        }
        if (lowerPractice.includes('skill') && lowerPractice.includes('30')) {
            return "LinkedIn allows up to 50 skills. Profiles with 30+ skills appear in more searches. Include a mix of hard skills (technical tools, software) and soft skills (leadership, communication). Pin your top 3 most relevant skills."
        }
        if (lowerPractice.includes('endorsement')) {
            return "Skill endorsements add social proof to your profile. Request endorsements from colleagues who can vouch for your abilities. Profiles with 99+ endorsements on top skills appear more credible to recruiters."
        }
        if (lowerPractice.includes('custom url') || lowerPractice.includes('linkedin.com/in')) {
            return "A custom URL (linkedin.com/in/yourname) looks more professional than one with random numbers. It's easier to share on resumes, email signatures, and business cards. Claim yours in Settings > Public Profile."
        }
        if (lowerPractice.includes('certification')) {
            return "Certifications demonstrate commitment to professional development. Prioritize industry-recognized credentials from providers like Google, AWS, Microsoft, or professional associations. Keep them current and include credential IDs."
        }
        if (lowerPractice.includes('education') || lowerPractice.includes('gpa') || lowerPractice.includes('honors')) {
            return "For recent graduates, education carries more weight. Include relevant coursework, honors, Dean's List, and extracurricular leadership roles. As you gain experience, shift focus to professional achievements."
        }
        if (lowerPractice.includes('call-to-action') || lowerPractice.includes('contact')) {
            return "End your About section with a clear call-to-action. Tell visitors what you want them to do: 'Open to new opportunities in [field],' 'Connect with me to discuss [topic],' or include your email for direct contact."
        }
        if (lowerPractice.includes('first-person') || lowerPractice.includes('first person')) {
            return "Writing in first person ('I lead...' vs 'John leads...') creates a more personal, authentic connection with readers. It makes your profile feel like a conversation rather than a formal resume."
        }
        if (lowerPractice.includes('star') || lowerPractice.includes('situation')) {
            return "The STAR format (Situation, Task, Action, Result) helps structure your experience descriptions. Briefly describe the context, what you were tasked with, what actions you took, and the measurable results you achieved."
        }
        
        // Default detailed content
        return "Following this best practice will help optimize your LinkedIn profile for better visibility and engagement. Recruiters and connections will be more likely to find and engage with your profile when you implement this recommendation."
    }
    
    return (
        <div className="rounded-[20px] bg-[#FAFAFA] border border-[#F3F4F6] overflow-hidden transition-all hover:border-[#E5E7EB] hover:shadow-[0_4px_20px_rgb(0_0_0/0.04)]">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors"
            >
                                <div className="w-10 h-10 rounded-2xl bg-[#DFC4FF]/30 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb className="w-5 h-5 text-[#815FAA]" />
                </div>
                <p className="flex-1 text-[14px] font-medium text-[#111827]">{practice}</p>
                <ChevronRight className={cn(
                    "w-5 h-5 text-[#D1D5DB] transition-transform duration-300",
                    isExpanded && "rotate-90"
                )} />
            </button>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-0 space-y-4">
                            {/* Image */}
                            {imageUrl && !imageError && (
                                <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
                                    <img 
                                        src={imageUrl}
                                        alt={`Best practice example for: ${practice}`}
                                        className="w-full h-auto object-contain"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            )}
                            
                            {/* Detailed Content */}
                            <div className="bg-white rounded-2xl p-5 border border-[#F3F4F6]">
                                <p className="text-[14px] text-[#4B5563] leading-relaxed">
                                    {getDetailedContent(practice)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
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

// function StatusIcon({ status, className }: { status: SidebarItemStatus, className?: string }) {
//     if (status === 'pass') return <CheckCircle2 className={cn("text-green-500", className)} />
//     if (status === 'warning') return <AlertTriangle className={cn("text-[#ea580c]", className)} />
//     if (status === 'critical') return <AlertTriangle className={cn("text-red-500", className)} />
//     return <Lightbulb className={cn("text-yellow-500", className)} />
// }

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
            <h5 className="text-sm font-medium text-gray-900 mb-4">
                Checklist
            </h5>
            <div className="space-y-3">
                {items.map((item, itemIdx) => {
                    const isExpanded = expandedSubItem === itemIdx
                    const isCritical = item.status === 'fail'
                    const isWarning = item.status === 'warning'
                    
                    return (
                        <div key={itemIdx} className="space-y-3">
                            {/* Clickable Checklist Item Card */}
                            <button
                                onClick={() => setExpandedSubItem(isExpanded ? null : itemIdx)}
                                className={cn(
                                    "w-full flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm transition-all text-left group hover:shadow-md border border-gray-100"
                                )}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium text-gray-900">{item.criterion}</p>
                                        {isCritical && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                                                Failed
                                            </span>
                                        )}
                                        {isWarning && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
                                                Warning
                                            </span>
                                        )}
                                        {item.status === 'pass' && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        )}
                                    </div>
                                    {!isExpanded && item.reasoning && (
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.reasoning}</p>
                                    )}
                                </div>
                                <ChevronRight className={cn(
                                    "w-5 h-5 flex-shrink-0 mt-0.5 transition-transform text-gray-400 group-hover:text-gray-600",
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
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-white rounded-xl p-6 space-y-6 border border-slate-200 shadow-sm">
                                            {/* Analysis Section */}
                                            {item.reasoning && (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                            <Info className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <h6 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                            Analysis
                                                        </h6>
                                                    </div>
                                                    <div className="pl-11">
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                            {item.reasoning}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Suggested Fix Section - only show if different from analysis */}
                                            {item.actionableFix && item.actionableFix.trim() !== item.reasoning.trim() && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#DFC4FF]/30 flex items-center justify-center flex-shrink-0">
                                                                <Lightbulb className="w-4 h-4 text-[#815FAA]" />
                                                            </div>
                                                            <h6 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                                Suggested fix
                                                            </h6>
                                                        </div>
                                                        <AutoFixButton
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                const contextMessage = `Help me fix: ${item.criterion} for my ${experience.jobTitle} role at ${experience.company}. ${item.reasoning}`
                                                                onFix?.(`experience_${expIdx}_item_${itemIdx}`, contextMessage)
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="pl-11">
                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                            {item.actionableFix}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Action button when no specific fix is available */}
                                            {(!item.actionableFix || item.actionableFix.trim() === item.reasoning.trim()) && (
                                                <div className="pt-2">
                                                    <AutoFixButton
                                                        variant="primary"
                                                        size="md"
                                                        label="Get personalized fix with AI"
                                                        loadingLabel="Generating fix..."
                                                        className="w-full justify-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            const contextMessage = `Help me fix: ${item.criterion} for my ${experience.jobTitle} role at ${experience.company}. ${item.reasoning}`
                                                            onFix?.(`experience_${expIdx}_item_${itemIdx}`, contextMessage)
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
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

// Spike Item Component for the Spikes view
function SpikeItem({ spike, isExpanded, onToggle }: { 
    spike: SpikeData
    isExpanded: boolean
    onToggle: () => void 
}) {
    return (
        <div className="rounded-[20px] bg-[#FAFAFA] border border-[#F3F4F6] overflow-hidden transition-all hover:border-[#E5E7EB] hover:shadow-[0_4px_20px_rgb(0_0_0/0.04)]">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors"
            >
                <div className="w-11 h-11 rounded-2xl bg-[#DFC4FF]/30 flex items-center justify-center flex-shrink-0">
                    <spike.icon className="w-5 h-5 text-[#815FAA]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#111827]">{spike.title}</p>
                    <p className="text-[12px] text-[#6B7280]">{spike.subtitle}</p>
                </div>
                <ChevronRight className={cn(
                    "w-5 h-5 text-[#D1D5DB] transition-transform duration-300 flex-shrink-0",
                    isExpanded && "rotate-90"
                )} />
            </button>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                                Key Drivers
                            </p>
                            <div className="space-y-2">
                                {spike.keyDrivers.map((driver, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E5E7EB]"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[#DFC4FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#815FAA]" />
                                        </div>
                                        <p className="text-[13px] text-[#374151] leading-relaxed">{driver}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function OptimizationSidebar({
    auditData,
    totalScore,
    checklist,
    onSelectSection,
    onFix
}: OptimizationSidebarProps) {
    const items = useSidebarData(auditData, checklist)
    const [selectedId, setSelectedId] = React.useState<string | null>(null)
    const [view, setView] = React.useState<'list' | 'detail'>('list')
    const [expandedChecklistItem, setExpandedChecklistItem] = React.useState<number | null>(null)
    const [detailTab, setDetailTab] = React.useState<'review' | 'practices'>('review')
    const [mainTab, setMainTab] = React.useState<'checklist' | 'spikes'>('checklist')
    const [expandedSpikeId, setExpandedSpikeId] = React.useState<string | null>(null)
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
        <div className="w-full h-full flex flex-col bg-white overflow-hidden font-['Inter',sans-serif]">
            {/* LinkedIn Score Header - Hero Card with Gradient Mesh */}
            <div className="p-8 flex-shrink-0 relative overflow-hidden border-b border-[#F3F4F6]">
                {/* Soft purple gradient mesh background */}
                <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                        background: 'radial-gradient(ellipse at 70% 30%, rgba(124, 58, 237, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)'
                    }}
                />
                
                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
                            Profile Score
                        </p>
                        <h2 className="text-[#111827] text-3xl font-bold tracking-tight">LinkedIn Score</h2>
                    </div>
                    
                    {/* Score Circle - Thick stroke, massive number */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#F3F4F6"
                                strokeWidth="3"
                            />
                            <path
                                strokeDasharray={`${totalScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#815FAA"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                                style={{ 
                                    filter: 'drop-shadow(0 0 6px rgba(129, 95, 170, 0.3))',
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-[#111827] tracking-tight">{totalScore}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Summary - Soft rounded card with stronger shadow */}
                {view === 'list' && auditData && 'checklistAudit' in auditData && auditData.checklistAudit?.summary && (
                    <div className="relative mt-6 rounded-[20px] p-5 bg-[#FAFAFA] border border-[#F3F4F6]">
                        <p className="text-[15px] leading-relaxed text-[#4B5563]">
                            {auditData.checklistAudit.summary}
                        </p>
                    </div>
                )}
            </div>

            {/* Checklist View - Floating Strips */}
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar bg-white"
                    >
                        {/* Toggle between Spikes and Optimization Checklist */}
                        <div className="flex items-center gap-2 mb-4 p-1 rounded-full bg-[#F3F4F6]">
                            <button
                                onClick={() => setMainTab('spikes')}
                                className={cn(
                                    "flex-1 px-4 py-2 rounded-full text-[12px] font-semibold transition-all",
                                    mainTab === 'spikes'
                                        ? "bg-white text-[#815FAA] shadow-sm"
                                        : "text-[#6B7280] hover:text-[#374151]"
                                )}
                            >
                                Spikes
                            </button>
                            <button
                                onClick={() => setMainTab('checklist')}
                                className={cn(
                                    "flex-1 px-4 py-2 rounded-full text-[12px] font-semibold transition-all",
                                    mainTab === 'checklist'
                                        ? "bg-white text-[#815FAA] shadow-sm"
                                        : "text-[#6B7280] hover:text-[#374151]"
                                )}
                            >
                                Optimization Checklist
                            </button>
                        </div>
                        
                        {/* Spikes View */}
                        {mainTab === 'spikes' && (
                            <div className="space-y-3">
                                {SPIKES_DATA.map((spike, index) => (
                                    <motion.div
                                        key={spike.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                    >
                                        <SpikeItem 
                                            spike={spike}
                                            isExpanded={expandedSpikeId === spike.id}
                                            onToggle={() => setExpandedSpikeId(expandedSpikeId === spike.id ? null : spike.id)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        
                        {/* Optimization Checklist View */}
                        {mainTab === 'checklist' && (
                        <div className="space-y-3">
                            {items.map((item, index) => {
                                // Calculate status based on score percentage
                                const scorePercent = item.maxScore && item.maxScore > 0 
                                    ? (item.score || 0) / item.maxScore * 100 
                                    : null
                                
                                const computedStatus: SidebarItemStatus = scorePercent !== null
                                    ? (scorePercent >= 80 ? 'pass' : scorePercent >= 50 ? 'warning' : 'critical')
                                    : item.status
                                
                                const displayScore = (item.score !== undefined && item.maxScore !== undefined)
                                    ? `${Math.round(item.score)}/${Math.round(item.maxScore)}`
                                    : null
                                
                                return (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        onClick={() => handleItemClick(item.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-5 rounded-[20px] bg-[#FAFAFA] transition-all duration-300 group",
                                            "border border-[#F3F4F6] hover:border-[#E5E7EB]",
                                            "hover:shadow-[0_8px_30px_rgb(0_0_0/0.06)] hover:-translate-y-[2px]"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                                                computedStatus === 'pass' ? "bg-emerald-50 text-emerald-600" :
                                                computedStatus === 'warning' ? "bg-amber-50 text-amber-600" :
                                                computedStatus === 'critical' ? "bg-red-50 text-red-500" :
                                                "bg-[#F3F4F6] text-[#6B7280]"
                                            )}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[15px] font-medium text-[#111827]">
                                                {item.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Status pill badge */}
                                            {computedStatus !== 'pass' && (
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-[12px] font-medium",
                                                    computedStatus === 'warning' 
                                                        ? "bg-amber-50 text-amber-600" 
                                                        : "bg-red-50 text-red-600"
                                                )}>
                                                    {computedStatus === 'warning' ? 'Needs work' : 'Action needed'}
                                                </span>
                                            )}
                                            {displayScore && (
                                                <span className="px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[12px] font-semibold text-[#6B7280]">
                                                    {displayScore}
                                                </span>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-[#D1D5DB] group-hover:text-[#9CA3AF] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                        )}
                    </motion.div>
                )}
                {view === 'detail' && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                        className="flex-1 flex flex-col overflow-hidden bg-white"
                    >
                        {/* Back Bar - Minimal */}
                        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0 border-b border-[#F3F4F6]">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAFAFA] border border-[#F3F4F6] text-[#4B5563] hover:text-[#111827] hover:border-[#E5E7EB] transition-all text-[14px] font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <span className="text-[12px] text-[#9CA3AF] font-medium">
                                {items.findIndex(i => i.id === selectedId) + 1} of {items.length}
                            </span>
                        </div>

                        {/* Horizontal Scrollable Tab Bar - Pill tabs with dot indicator */}
                        <div className="px-6 py-4 overflow-x-auto custom-scrollbar flex-shrink-0 border-b border-[#F3F4F6]">
                            <div className="inline-flex gap-2 p-1.5 bg-[#F9FAFB] rounded-full min-w-max">
                                {items.map((item) => {
                                    const displayScore = (item.score !== undefined && item.maxScore !== undefined)
                                        ? `${Math.round(item.score)}/${Math.round(item.maxScore)}`
                                        : null
                                    
                                    const IconComponent = item.icon
                                    const isSelected = item.id === selectedId
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleItemClick(item.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[14px] font-medium whitespace-nowrap",
                                                isSelected 
                                                    ? "bg-[#DFC4FF]/40 text-[#815FAA]" 
                                                    : "text-[#6B7280] hover:text-[#374151]"
                                            )}
                                        >
                                            {/* Brand purple dot for active */}
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#815FAA]" />
                                            )}
                                            <IconComponent className="w-4 h-4" />
                                            <span>{item.title}</span>
                                            {displayScore && (
                                                <span className={cn(
                                                    "text-[11px] px-2 py-0.5 rounded-full font-semibold",
                                                    isSelected ? "bg-[#815FAA]/15" : "bg-white/60"
                                                )}>
                                                    {displayScore}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Content Area - Soft cards */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 bg-white">
                            {/* Status Badge - Soft pill */}
                            {selectedItem?.status !== 'pass' && (
                                <div className="mb-6">
                                    <span className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium",
                                        selectedItem?.status === 'critical' 
                                            ? "bg-red-50 text-red-600" 
                                            : "bg-amber-50 text-amber-600"
                                    )}>
                                        {selectedItem?.status === 'critical' ? 'Action required' : 'Needs improvement'}
                                    </span>
                                </div>
                            )}

                            {/* Tab Navigation - Pill tabs with dot indicator */}
                            <div className="px-6 pt-4">
                                <div className="inline-flex gap-2 p-1.5 bg-[#F9FAFB] border border-[#F3F4F6] rounded-full">
                                    <button
                                        onClick={() => {
                                            setDetailTab('review')
                                            setExpandedChecklistItem(null)
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-all",
                                            detailTab === 'review'
                                                ? "bg-[#DFC4FF]/40 text-[#815FAA]"
                                                : "text-[#6B7280] hover:text-[#374151]"
                                        )}
                                    >
                                        {detailTab === 'review' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#815FAA]" />
                                        )}
                                        Review
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDetailTab('practices')
                                            setExpandedChecklistItem(null)
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-all",
                                            detailTab === 'practices'
                                                ? "bg-[#DFC4FF]/40 text-[#815FAA]"
                                                : "text-[#6B7280] hover:text-[#374151]"
                                        )}
                                    >
                                        {detailTab === 'practices' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#815FAA]" />
                                        )}
                                        Best practices
                                    </button>
                                </div>
                            </div>

                                {/* Tab Content */}
                                <div className="px-6 py-6">
                                {detailTab === 'review' ? (
                                    <div className="space-y-6">
                                    
                                    {/* Summary Section - High-level overview only */}
                                    {selectedItem?.breakdown && (
                                        <div className="bg-[#FAFAFA] rounded-[20px] p-5 border border-[#F3F4F6]">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-5 h-5 text-[#6B7280]" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2">
                                                        Quick Summary
                                                    </h4>
                                                    <p className="text-[14px] text-[#4B5563] leading-relaxed">
                                                        {selectedItem.breakdown}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Checklist Section Header */}
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-4">
                                            {selectedItem?.id === 'experience' && selectedItem?.experienceEntries ? 'Individual experiences' : 'Detailed checklist'}
                                        </h4>
                                    </div>
                                    
                                    {/* Special handling for Experience banner with individual entries */}
                                    {selectedItem?.id === 'experience' && selectedItem?.experienceEntries && selectedItem.experienceEntries.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedItem.experienceEntries.map((experience, expIdx) => {
                                                const expScore = experience.score || 0
                                                const expMaxScore = experience.maxScore || 1
                                                const expPercent = (expScore / expMaxScore) * 100
                                                const expStatus: SidebarItemStatus = expPercent >= 80 ? 'pass' : expPercent >= 50 ? 'warning' : 'critical'
                                                
                                                return (
                                                    <div key={expIdx} className="space-y-3">
                                                        {/* Experience Card */}
                                                        <button
                                                            onClick={() => {
                                                                setExpandedChecklistItem(expandedChecklistItem === expIdx ? null : expIdx)
                                                            }}
                                                            className={cn(
                                                                "w-full p-5 rounded-[20px] border transition-all text-left group",
                                                                expandedChecklistItem === expIdx 
                                                                    ? "border-[#815FAA]/30 bg-[#DFC4FF]/20" 
                                                                    : "bg-[#FAFAFA] border-[#F3F4F6] hover:border-[#E5E7EB] hover:shadow-[0_4px_20px_rgb(0_0_0/0.04)]"
                                                            )}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {/* Icon */}
                                                                <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                                                                    <Briefcase className="w-5 h-5 text-[#6B7280]" />
                                                                </div>
                                                                
                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                        <h4 className="text-[14px] font-semibold text-[#111827] line-clamp-1">
                                                                            {experience.company} - {experience.jobTitle}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            {/* Auto-fix button */}
                                                                            <AutoFixButton
                                                                                variant="primary"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    const contextMessage = `Auto-fix my ${experience.jobTitle} experience at ${experience.company}. ${experience.summary}`
                                                                                    onFix?.(`experience_${expIdx}_autofix`, contextMessage)
                                                                                }}
                                                                            />
                                                                            <span className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[12px] font-semibold text-[#6B7280]">
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
                                                                        <p className="text-[12px] text-[#9CA3AF] mb-2">{experience.duration}</p>
                                                                    )}
                                                                    {!expandedChecklistItem && (
                                                                        <p className="text-[13px] text-[#6B7280] line-clamp-2">
                                                                            {experience.summary}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                
                                                                <ChevronRight className={cn(
                                                                    "w-4 h-4 flex-shrink-0 mt-1 transition-transform text-[#D1D5DB]",
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
                                                                    transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                                                                    className="overflow-hidden rounded-[20px] border border-[#F3F4F6] bg-white p-5 space-y-4"
                                                                >
                                                                    {/* Summary */}
                                                                    <div>
                                                                        <h5 className="text-[11px] font-semibold tracking-[0.08em] text-[#9CA3AF] uppercase mb-2">
                                                                            Analysis
                                                                        </h5>
                                                                        <p className="text-[14px] text-[#4B5563] leading-relaxed whitespace-pre-line">
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
                                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all shadow-md hover:shadow-lg"
                                                                        style={{ 
                                                                            background: 'linear-gradient(135deg, #815FAA 0%, #9D7FC1 100%)',
                                                                            boxShadow: '0 4px 12px rgba(129, 95, 170, 0.25)'
                                                                        }}
                                                                    >
                                                                        <Sparkles className="w-4 h-4 text-[#DFC4FF]" />
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
                                                        ? "border-[#BC9CE2] bg-[#815FAA]/5 shadow-md" 
                                                        : "border-gray-200 hover:border-[#DFC4FF] hover:bg-slate-50 hover:shadow-md"
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
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-white rounded-xl p-6 space-y-6 border border-slate-200 shadow-sm">
                                                            {/* Analysis Section */}
                                                            {item.solution && (
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                                            <Info className="w-4 h-4 text-amber-600" />
                                                                        </div>
                                                                        <h6 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                                            {item.status === 'pass' ? 'What\'s Working Well' : 'Analysis'}
                                                                        </h6>
                                                                    </div>
                                                                    <div className="pl-11">
                                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                                            {item.solution}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Suggested Fix Section */}
                                                            {item.status !== 'pass' && ((item as any).actionableFix || item.solution) && (
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(129, 95, 170, 0.1)' }}>
                                                                                <Lightbulb className="w-4 h-4 text-[#815FAA]" />
                                                                            </div>
                                                                            <h6 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                                                                Suggested fix
                                                                            </h6>
                                                                        </div>
                                                                        <AutoFixButton
                                                                            variant="primary"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                const contextMessage = `Help me fix: ${item.text} in my ${selectedItem?.title} section`
                                                                                onFix?.(`${selectedItem?.id}_item_${idx}`, contextMessage)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="pl-11">
                                                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                                            {(item as any).actionableFix || item.solution}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Action button when no specific fix is available but item failed */}
                                                            {item.status !== 'pass' && !((item as any).actionableFix || item.solution) && (
                                                                <div className="pt-2">
                                                                    <AutoFixButton
                                                                        variant="primary"
                                                                        size="md"
                                                                        label="Get personalized fix with AI"
                                                                        loadingLabel="Generating fix..."
                                                                        className="w-full justify-center"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            const contextMessage = `Help me fix: ${item.text} in my ${selectedItem?.title} section`
                                                                            onFix?.(`${selectedItem?.id}_item_${idx}`, contextMessage)
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                    </div>
                                    )}
                                    </div>
                                ) : (
                                    /* Best Practices Tab - Expandable Banners */
                                    <div className="space-y-2">
                                        {selectedItem?.bestPractices && selectedItem.bestPractices.length > 0 ? (
                                            selectedItem.bestPractices.map((practice, idx) => (
                                                <BestPracticeItem key={idx} practice={practice} index={idx} />
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
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] mt-6"
                                        style={{
                                            background: 'linear-gradient(135deg, #815FAA 0%, #9D7FC1 100%)',
                                            boxShadow: '0 4px 14px rgba(129, 95, 170, 0.35)'
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 text-[#DFC4FF]" />
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
