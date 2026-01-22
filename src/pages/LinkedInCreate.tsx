import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Upload, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import resumeService from "@/services/api/resumeService"
import { useApp } from "@/contexts/AppContext"

export default function LinkedInCreate() {
  const navigate = useNavigate()
  const { setParsedProfile } = useApp()
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please select a PDF file")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)

      // Create a local URL for the file to view later
      const localFileUrl = URL.createObjectURL(file)

      const result = await resumeService.uploadAndCreateLinkedInProject(file)
      
      // Store parsed profile in context
      setParsedProfile(result.parsedProfile)
      
      // Navigate to workspace with resume URL for viewing
      navigate(`/linkedin/workspace/${result.projectId}`, {
        state: {
          parsedProfile: result.parsedProfile,
          startMode: "create",
          resumeUrl: localFileUrl,
        },
      })
    } catch (err: any) {
      setError(err.message || "Failed to upload resume")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Button
          onClick={() => navigate("/linkedin")}
          variant="ghost"
          size="sm"
          className="mb-8 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-3">
            Create LinkedIn Profile
          </h1>
          <p className="text-gray-500">
            Upload your resume and we'll generate an optimized LinkedIn profile
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-gray-200 rounded-3xl p-12",
            "hover:border-gray-300 transition-colors cursor-pointer",
            "flex flex-col items-center justify-center text-center"
          )}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            {file ? file.name : "Click to upload your resume"}
          </p>
          <p className="text-xs text-gray-500">PDF format only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-4 text-center">{error}</p>
        )}

        {file && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full mt-6 h-12 rounded-full bg-[#815FAA] hover:bg-[#6B4E8A] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create LinkedIn Profile"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
