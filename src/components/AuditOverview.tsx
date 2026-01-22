import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    ShieldAlert,
    Target,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LinkedInAudit } from "@/services/api/types"

interface AuditOverviewProps {
    auditData: LinkedInAudit
    isDark: boolean
}

export function AuditOverview({ auditData, isDark }: AuditOverviewProps) {
    const [activeTab, setActiveTab] = useState<"strengths" | "risks" | "opportunities">("risks")

    const summaryData = (() => {
        const summary = auditData.reviewModule.summary
        if (typeof summary === 'string') {
            return { strengths: [], gaps: [], opportunities: [], hasStructured: false }
        }
        return { ...summary, hasStructured: true }
    })()

    const score = auditData.reviewModule.overallScore || 0
    const size = 160
    const strokeWidth = 10
    const center = size / 2
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference

    // Status Logic
    const getStatusColor = (s: number) => {
        if (s >= 80) return { color: "emerald", hex: "#10b981", bg: "bg-emerald-500", text: "text-emerald-600" }
        if (s >= 50) return { color: "amber", hex: "#f59e0b", bg: "bg-amber-500", text: "text-amber-600" }
        return { color: "red", hex: "#ef4444", bg: "bg-red-500", text: "text-red-600" }
    }
    const status = getStatusColor(score)

    const tabs = [
        { id: "strengths", label: "Strengths", icon: TrendingUp, activeColor: "bg-emerald-500 text-white", iconColor: "text-emerald-500" },
        { id: "risks", label: "Critical Risks", icon: ShieldAlert, activeColor: "bg-red-500 text-white", iconColor: "text-red-500" },
        { id: "opportunities", label: "Opportunities", icon: Target, activeColor: "bg-blue-500 text-white", iconColor: "text-blue-500" },
    ] as const

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden transition-all duration-300 mb-8",
            isDark
                ? "bg-zinc-900 border border-white/5"
                : "bg-white border border-gray-100 shadow-sm"
        )}>
            <div className="flex flex-col md:flex-row">

                {/* Left: Score Card */}
                <div className={cn(
                    "md:w-72 lg:w-80 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r text-center relative overflow-hidden",
                    isDark ? "border-white/5 bg-black/20" : "border-gray-100 bg-gray-50/50"
                )}>
                    <div className="relative mb-6">
                        <svg width={size} height={size} className="transform -rotate-90">
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            <motion.circle
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - progress }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={status.hex}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={circumference}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                            <span className={cn(
                                "text-5xl font-bold tracking-tighter",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                {score}
                            </span>
                            <span className={cn(
                                "text-xs font-medium uppercase tracking-widest mt-1",
                                isDark ? "text-gray-500" : "text-gray-400"
                            )}>
                                Total Score
                            </span>
                        </div>
                    </div>

                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        isDark ? "bg-white/5 text-white" : "bg-white border border-gray-200 text-gray-700 shadow-sm"
                    )}>
                        <BarChart3 className={cn("w-3.5 h-3.5", status.text)} />
                        {score >= 80 ? "Excellent" : score >= 50 ? "Needs Work" : "Critical"}
                    </div>
                </div>

                {/* Right: Insights Tabs */}
                <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                        isActive
                                            ? tab.activeColor
                                            : cn("hover:bg-gray-100", isDark ? "text-gray-400 hover:bg-white/5" : "text-gray-600")
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", !isActive && tab.iconColor)} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="min-h-[160px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                {!summaryData.hasStructured ? (
                                    <p className={cn("leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
                                        {typeof auditData.reviewModule.summary === 'string'
                                            ? auditData.reviewModule.summary
                                            : "Analyzing your profile..."}
                                    </p>
                                ) : (
                                    <>
                                        {(activeTab === "strengths" ? summaryData.strengths :
                                            activeTab === "risks" ? summaryData.gaps :
                                                summaryData.opportunities)?.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "flex items-start gap-3 p-3 rounded-xl transition-colors",
                                                            isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                                            activeTab === "strengths" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                                activeTab === "risks" ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" :
                                                                    "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                                        )}>
                                                            {activeTab === "strengths" ? <Check className="w-3 h-3" /> :
                                                                activeTab === "risks" ? <AlertCircle className="w-3 h-3" /> :
                                                                    <Lightbulb className="w-3 h-3" />}
                                                        </div>
                                                        <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-300" : "text-gray-700")}>
                                                            {item}
                                                        </p>
                                                    </div>
                                                ))}

                                        {/* Empty States */}
                                        {((activeTab === "strengths" && !summaryData.strengths?.length) ||
                                            (activeTab === "risks" && !summaryData.gaps?.length) ||
                                            (activeTab === "opportunities" && !summaryData.opportunities?.length)) && (
                                                <div className="flex flex-col items-center justify-center py-8 opacity-60">
                                                    <p className="text-sm">No specific items found for this category.</p>
                                                </div>
                                            )}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
