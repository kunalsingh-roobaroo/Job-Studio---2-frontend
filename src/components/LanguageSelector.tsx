import * as Dialog from "@radix-ui/react-dialog"
import { Check, Globe, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext"

interface LanguageSelectorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isDark?: boolean
}

export function LanguageSelector({ open, onOpenChange, isDark = false }: LanguageSelectorProps) {
    const { currentLanguage, setLanguage } = useLanguage()

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity" />
                <Dialog.Content className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
                    isDark ? "bg-[#1C1C1E] border-[#303437] text-white" : "bg-white border-gray-200 text-gray-900"
                )}>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Globe className="w-5 h-5 opacity-70" />
                                Select Language
                            </Dialog.Title>
                            <Dialog.Close className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 outline-none">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                            Choose your preferred language for the interface.
                        </Dialog.Description>
                    </div>

                    <div className="grid gap-2 py-4">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code)
                                    onOpenChange(false)
                                }}
                                className={cn(
                                    "flex items-center justify-between w-full p-4 rounded-lg border transition-all",
                                    currentLanguage.code === lang.code
                                        ? isDark
                                            ? "bg-[#815FAA]/20 border-[#815FAA]/50"
                                            : "bg-[#DFC4FF]/30 border-[#BC9CE2]"
                                        : isDark
                                            ? "bg-[#202325] border-[#303437] hover:bg-[#2A2D30]"
                                            : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                )}
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                        {lang.nativeName}
                                    </span>
                                    <span className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                                        {lang.name}
                                    </span>
                                </div>
                                {currentLanguage.code === lang.code && (
                                    <div className="bg-[#815FAA] rounded-full p-1">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
