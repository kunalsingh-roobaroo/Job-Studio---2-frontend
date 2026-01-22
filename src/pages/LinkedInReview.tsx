import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Upload, ArrowLeft, Loader2, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import resumeService from "@/services/api/resumeService"
import { useApp } from "@/contexts/AppContext"

export default function LinkedInReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLinkedInAudit } = useApp()
  const [file, setFile] = React.useState<File | null>(null)
  const [linkedInUrl, setLinkedInUrl] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Get LinkedIn URL from navigation state if provided
  React.useEffect(() => {
    const navLinkedInUrl = (location.state as { linkedInUrl?: string })?.linkedInUrl
    if (navLinkedInUrl) {
      setLinkedInUrl(navLinkedInUrl)
    }
  }, [location.state])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please select a PDF file (LinkedIn profile export)")
      }
    }
  }

  const handleUploadPDF = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)

      const result = await resumeService.reviewLinkedInProfile(file)

      // Store audit in context
      setLinkedInAudit(result.audit)

      // Navigate to workspace in review mode
      navigate(`/linkedin/workspace/${result.projectId}`, {
        state: {
          linkedInAudit: result.audit,
          startMode: "review",
        },
      })
    } catch (err: any) {
      setError(err.message || "Failed to review LinkedIn profile")
    } finally {
      setIsUploading(false)
    }
  }

  const handleExtractFromUrl = async () => {
    if (!linkedInUrl.trim()) {
      setError("Please enter a LinkedIn URL")
      return
    }

    try {
      setIsExtracting(true)
      setError(null)

      const result = await resumeService.extractLinkedInFromUrl(linkedInUrl.trim())

      // Store audit in context
      setLinkedInAudit(result.audit)

      // Navigate to workspace in review mode
      navigate(`/linkedin/workspace/${result.projectId}`, {
        state: {
          linkedInAudit: result.audit,
          startMode: "review",
        },
      })
    } catch (err: any) {
      setError(err.message || "Failed to extract LinkedIn profile from URL")
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <div className="max-w-2xl mx-auto pt-20 px-8 pb-12">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="mb-8 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-3">
            Review Your LinkedIn Profile
          </h1>
          <p className="text-gray-500">
            Enter your LinkedIn URL or upload your profile PDF
          </p>
        </div>

        {/* LinkedIn URL Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile URL
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-profile"
                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 focus:border-[#815FAA] focus:ring-2 focus:ring-[#815FAA]/20 outline-none transition-all"
              />
            </div>
            <Button
              onClick={handleExtractFromUrl}
              disabled={isExtracting || !linkedInUrl.trim()}
              className="h-12 px-6 rounded-full bg-[#815FAA] hover:bg-[#6B4E8A] text-white"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                "Extract Profile"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            We'll automatically extract your profile data using the URL
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or upload PDF</span>
          </div>
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
            {file ? file.name : "Click to upload LinkedIn profile PDF"}
          </p>
          <p className="text-xs text-gray-500">
            Export your profile as PDF from LinkedIn
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {file && (
          <Button
            onClick={handleUploadPDF}
            disabled={isUploading}
            className="w-full mt-6 h-12 rounded-full bg-[#815FAA] hover:bg-[#6B4E8A] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              "Review Profile"
            )}
          </Button>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            How to export your LinkedIn profile:
          </h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Go to your LinkedIn profile</li>
            <li>Click "More" in your profile section</li>
            <li>Select "Save to PDF"</li>
            <li>Upload the downloaded PDF here</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
