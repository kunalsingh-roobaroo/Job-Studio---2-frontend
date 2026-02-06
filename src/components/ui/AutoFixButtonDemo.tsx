import React, { useState } from 'react'
import { AutoFixButton } from './AutoFixButton'
import type { AutoFixButtonVariant, AutoFixButtonSize } from './AutoFixButton'

/**
 * Demo component to preview all Auto-fix button variants
 * 
 * Soft Minimalist Design System (Digital Lavender):
 * - Primary:   #7C3AED (Violet-600)
 * - Surface:   #F3E8FF (Violet-100)
 * - Text:      #111827 (Gray-900)
 */
export const AutoFixButtonDemo: React.FC = () => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

    const simulateLoading = (key: string) => {
        setLoadingStates(prev => ({ ...prev, [key]: true }))
        setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, [key]: false }))
        }, 2000)
    }

    const variants: { id: AutoFixButtonVariant; name: string; description: string }[] = [
        {
            id: 'primary',
            name: 'Primary',
            description: 'Full pill shape, solid violet background (#7C3AED), white text. Soft diffused shadow with lift on hover. Best for: Primary CTAs, main actions.'
        },
        {
            id: 'soft',
            name: 'Soft',
            description: 'Full pill shape, soft violet surface (#F3E8FF), violet text. Subtle shadow with gentle lift. Best for: Secondary actions, paired with primary.'
        },
        {
            id: 'ghost',
            name: 'Ghost',
            description: 'Transparent base, violet text. Fills with soft violet on hover. Best for: Tertiary actions, low noise contexts, dense interfaces.'
        }
    ]
    
    const sizes: AutoFixButtonSize[] = ['sm', 'md', 'lg']

    return (
        <div className="p-8 space-y-12 bg-[#F9FAFB] min-h-screen font-['Inter',sans-serif]">
            {/* Header */}
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
                    Component Preview
                </p>
                <h1 className="text-3xl font-bold text-[#111827] tracking-tight mb-3">
                    Auto-fix Button Variants
                </h1>
                <p className="text-[#4B5563] text-[15px]">
                    Soft minimalist button component using the Digital Lavender palette
                </p>
                
                {/* Color Palette Reference */}
                <div className="flex gap-3 mt-6">
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] shadow-[0_8px_30px_rgb(124_58_237/0.2)]" />
                        <span className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Primary</span>
                        <span className="text-[10px] text-[#D1D5DB]">#7C3AED</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] shadow-[0_4px_20px_rgb(0_0_0/0.04)]" />
                        <span className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Surface</span>
                        <span className="text-[10px] text-[#D1D5DB]">#F3E8FF</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-[0_4px_20px_rgb(0_0_0/0.04)]" />
                        <span className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Background</span>
                        <span className="text-[10px] text-[#D1D5DB]">#FFFFFF</span>
                    </div>
                </div>
            </div>

            {/* Variants Showcase */}
            <div className="space-y-10">
                {variants.map((variant) => (
                    <div key={variant.id} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0_0_0/0.04)]">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-[#111827] tracking-tight mb-2">
                                    {variant.name}
                                </h2>
                                <p className="text-[14px] text-[#4B5563] max-w-xl leading-relaxed">
                                    {variant.description}
                                </p>
                            </div>
                        </div>

                        {/* Size variations */}
                        <div className="space-y-6">
                            {sizes.map((size) => {
                                const key = `${variant.id}-${size}`
                                return (
                                    <div key={key} className="flex items-center gap-6">
                                        <span className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-wider w-8">
                                            {size}
                                        </span>
                                        
                                        {/* Default */}
                                        <AutoFixButton
                                            variant={variant.id}
                                            size={size}
                                            onClick={() => simulateLoading(`${key}-1`)}
                                            isLoading={loadingStates[`${key}-1`]}
                                        />
                                        
                                        {/* Loading */}
                                        <AutoFixButton
                                            variant={variant.id}
                                            size={size}
                                            onClick={() => {}}
                                            isLoading={true}
                                        />
                                        
                                        {/* Disabled */}
                                        <AutoFixButton
                                            variant={variant.id}
                                            size={size}
                                            onClick={() => {}}
                                            disabled={true}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage Example */}
            <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0_0_0/0.04)]">
                <h2 className="text-xl font-semibold text-[#111827] tracking-tight mb-6">
                    Usage Example
                </h2>
                <div className="bg-[#F9FAFB] rounded-2xl p-6 font-mono text-[13px]">
                    <pre className="text-[#4B5563] overflow-x-auto">
{`import { AutoFixButton } from '@/components/ui/AutoFixButton'

// Primary (default) - for main actions
<AutoFixButton
    variant="primary"
    onClick={() => handleFix()}
/>

// Soft - for secondary actions
<AutoFixButton
    variant="soft"
    label="Quick Fix"
    onClick={() => handleQuickFix()}
/>

// Ghost - for low-noise contexts
<AutoFixButton
    variant="ghost"
    onClick={() => handleMinorFix()}
/>`}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default AutoFixButtonDemo
