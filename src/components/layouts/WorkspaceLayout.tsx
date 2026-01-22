import * as React from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Maximize2, Minimize2 } from "lucide-react"

interface WorkspaceLayoutProps {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  leftHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  defaultLeftSize?: number
  minLeftSize?: number
  maxLeftSize?: number
}

type ViewMode = "balanced" | "left-max" | "right-max"

export function WorkspaceLayout({
  leftContent,
  rightContent,
  leftHeader,
  rightHeader,
  defaultLeftSize = 50,
  minLeftSize = 20,
  maxLeftSize = 80,
}: WorkspaceLayoutProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("balanced")

  const toggleViewMode = () => {
    if (viewMode === "balanced") {
      setViewMode("left-max")
    } else if (viewMode === "left-max") {
      setViewMode("right-max")
    } else {
      setViewMode("balanced")
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel */}
        <ResizablePanel
          defaultSize={defaultLeftSize}
          minSize={minLeftSize}
          maxSize={maxLeftSize}
        >
          <div className="h-full flex flex-col bg-white">
            {/* Left Header */}
            {leftHeader && (
              <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
                {leftHeader}
                <button
                  onClick={toggleViewMode}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title={
                    viewMode === "balanced"
                      ? "Maximize left"
                      : viewMode === "left-max"
                      ? "Maximize right"
                      : "Reset view"
                  }
                >
                  {viewMode === "right-max" ? (
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            )}

            {/* Left Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {leftContent}
            </div>
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel */}
        <ResizablePanel
          defaultSize={100 - defaultLeftSize}
          minSize={100 - maxLeftSize}
          maxSize={100 - minLeftSize}
        >
          <div className="h-full flex flex-col bg-white">
            {/* Right Header */}
            {rightHeader && (
              <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
                {rightHeader}
              </div>
            )}

            {/* Right Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {rightContent}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
