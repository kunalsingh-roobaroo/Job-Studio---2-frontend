import { WorkspaceLayout } from "@/components/layouts/WorkspaceLayout"
import { FileText, ZoomIn, ZoomOut } from "lucide-react"

export default function WorkspaceDemo() {
  return (
    <WorkspaceLayout
      leftHeader={
        <>
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Resume.pdf</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </>
      }
      leftContent={
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Left Panel Content</h2>
          <p className="text-gray-600 mb-4">
            This is where your PDF viewer, audit checklist, or diff feed would appear.
          </p>
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Section {i + 1}</h3>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
        </div>
      }
      rightHeader={
        <span className="text-sm font-medium text-gray-900">LinkedIn Preview</span>
      }
      rightContent={
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Right Panel Content</h2>
          <p className="text-gray-600 mb-4">
            This is where your LinkedIn profile preview would appear.
          </p>
          <div className="space-y-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Preview Section {i + 1}</h3>
                <p className="text-sm text-gray-600">
                  Preview content goes here.
                </p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
