import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react"
import type { ChecklistItem as ChecklistItemType } from "@/services/api/types"

interface ChecklistItemProps {
  item: ChecklistItemType
  isExpanded: boolean
  onToggle: () => void
  onAutoFix: () => void
  onFocusSection: () => void
  isDark?: boolean
}

export function ChecklistItem({
  item,
  isExpanded,
  onToggle,
  onAutoFix,
  onFocusSection,
}: ChecklistItemProps) {
  const [activeTab, setActiveTab] = React.useState<"why" | "examples" | "fix">("why")

  // Status icon and color - Custom SVG circles
  const StatusIcon = item.status === "pass" ? CheckCircle2 : item.status === "warning" ? AlertTriangle : XCircle
  const statusColor = item.status === "pass" ? "#10B981" : item.status === "warning" ? "#F59E0B" : "#EF4444"

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 transition-all group",
        isExpanded && "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* Collapsed State */}
      <button
        onClick={() => {
          onToggle()
          onFocusSection()
        }}
        className="w-full p-3 flex items-center gap-3 hover:border-gray-300 transition-all cursor-pointer"
      >
        {/* Status Icon */}
        <StatusIcon 
          className="w-5 h-5 flex-shrink-0" 
          style={{ color: statusColor }}
        />

        {/* Title */}
        <span 
          className="flex-1 text-left text-sm font-medium text-gray-700 group-hover:text-gray-900"
          style={{ letterSpacing: '-0.01em' }}
        >
          {item.title}
        </span>

        {/* Score Badge */}
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono">
          +{item.scoreImpact}
        </span>

        {/* Expand Arrow */}
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform flex-shrink-0 text-gray-300",
            isExpanded && "transform rotate-180"
          )}
        />
      </button>

      {/* Expanded State - The "Education" Deck */}
      {isExpanded && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-4">
          {/* Segmented Control Tabs */}
          <div className="bg-gray-200 p-0.5 rounded-lg inline-flex mb-4">
            <TabButton
              label="Why it matters"
              isActive={activeTab === "why"}
              onClick={() => setActiveTab("why")}
            />
            <TabButton
              label="Examples"
              isActive={activeTab === "examples"}
              onClick={() => setActiveTab("examples")}
            />
            <TabButton
              label="Fix it"
              isActive={activeTab === "fix"}
              onClick={() => setActiveTab("fix")}
            />
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === "why" && (
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="mb-3">{item.reasoning}</p>
                {/* Pro-tip callout */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-900 mb-1">Pro Tip</p>
                      <p className="text-xs text-purple-700">{item.bestPractice}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "examples" && (
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Good Example
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed font-mono">
                    {item.example}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "fix" && (
              <div className="space-y-3">
                {/* Auto-Fix Button */}
                <button
                  onClick={onAutoFix}
                  className="w-full h-10 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto-Fix with Copilot
                </button>

                {/* Fix Suggestion Preview */}
                {item.fixSuggestion && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      Suggested Fix:
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                      defaultValue={item.fixSuggestion}
                      placeholder="Edit your content here..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-md transition-all",
        isActive
          ? "bg-white text-black shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      )}
    >
      {label}
    </button>
  )
}
