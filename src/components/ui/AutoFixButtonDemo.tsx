import React, { useState } from 'react'
import { AutoFixButton, AutoFixButtonVariant, AutoFixButtonSize } from './AutoFixButton'

/**
 * Demo component to preview all Auto-fix button variants
 * 
 * Purple Palette Reference:
 * - Lightest: #DFC4FF
 * - Lighter:  #BC9CE2
 * - Light:    #9D7FC1
 * - Base:     #815FAA
 * - Darkest:  #684C8A
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
            id: 'glass-glow',
            name: 'Glass/Glow',
            description: 'Gradient from Base (#815FAA) to Light (#9D7FC1), glass edge with Lightest (#DFC4FF) border, colored glow shadow. Best for: Primary CTAs, premium feel.'
        },
        {
            id: 'solid-tactile',
            name: 'Solid & Tactile',
            description: 'Solid Base (#815FAA) with physical depth from Darkest (#684C8A) bottom shadow. Hover shifts to Light and presses down. Best for: SaaS standard, utility actions.'
        },
        {
            id: 'ghost',
            name: 'Ghost',
            description: 'Transparent with faint Lightest (#DFC4FF) background. Text in Base (#815FAA). Fills on hover. Best for: Secondary actions, low noise contexts.'
        }
    ]
    
    const sizes: AutoFixButtonSize[] = ['sm', 'md', 'lg']

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Auto-fix Button Variants
                </h1>
                <p className="text-slate-600 mb-4">
                    Premium button component using the purple design system palette
                </p>
                
                {/* Color Palette Reference */}
                <div className="flex gap-2 mb-6">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#DFC4FF] shadow-sm" />
                        <span className="text-[10px] text-slate-500 mt-1">Lightest</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#BC9CE2] shadow-sm" />
                        <span className="text-[10px] text-slate-500 mt-1">Lighter</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#9D7FC1] shadow-sm" />
                        <span className="text-[10px] text-slate-500 mt-1">Light</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#815FAA] shadow-sm" />
                        <span className="text-[10px] text-slate-500 mt-1">Base</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#684C8A] shadow-sm" />
                        <span className="text-[10px] text-slate-500 mt-1">Darkest</span>
                    </div>
                </div>
            </div>

            {/* Variant Showcase */}
            {variants.map((variant) => (
                <div key={variant.id} className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {variant.name} Variant
                        </h2>
                        <p className="text-sm text-slate-500 max-w-2xl">
                            {variant.description}
                        </p>
                    </div>
                    
                    {/* Size variations */}
                    <div className="flex items-end gap-6 flex-wrap">
                        {sizes.map((size) => {
                            const key = `${variant.id}-${size}`
                            return (
                                <div key={key} className="flex flex-col items-center gap-2">
                                    <AutoFixButton
                                        variant={variant.id}
                                        size={size}
                                        isLoading={loadingStates[key]}
                                        onClick={() => simulateLoading(key)}
                                    />
                                    <span className="text-xs text-slate-400">{size}</span>
                                </div>
                            )
                        })}
                        
                        {/* Disabled state */}
                        <div className="flex flex-col items-center gap-2">
                            <AutoFixButton
                                variant={variant.id}
                                size="md"
                                disabled
                                onClick={() => {}}
                            />
                            <span className="text-xs text-slate-400">disabled</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* In-context Preview */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">
                    In-Context Preview (Experience Card)
                </h2>
                
                {/* Mock Experience Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 max-w-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                        {/* Company Icon Placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-slate-900">
                                    roobaroo.ai - Product Engineer
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <AutoFixButton
                                        variant="glass-glow"
                                        size="sm"
                                        isLoading={loadingStates['context-preview']}
                                        onClick={() => simulateLoading('context-preview')}
                                    />
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                        3/4
                                    </span>
                                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">Dec 2025 - Present</p>
                            <p className="text-xs text-slate-600 line-clamp-2">
                                This entry is completely blank, making it impossible to evaluate your contributions or impact. You are in a Product Engineer role at an AI...
                            </p>
                        </div>
                    </div>
                </div>

                {/* All variants in card context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                    {variants.map((variant) => (
                        <div 
                            key={`context-${variant.id}`} 
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-700">
                                    {variant.name}
                                </span>
                                <AutoFixButton
                                    variant={variant.id}
                                    size="sm"
                                    isLoading={loadingStates[`ctx-${variant.id}`]}
                                    onClick={() => simulateLoading(`ctx-${variant.id}`)}
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Click to test loading state
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full-width button examples */}
            <div className="space-y-4 max-w-md">
                <h2 className="text-lg font-semibold text-slate-800">
                    Full-Width Buttons
                </h2>
                
                <AutoFixButton
                    variant="glass-glow"
                    size="lg"
                    label="Get personalized fix with AI"
                    loadingLabel="Generating fix..."
                    className="w-full justify-center"
                    isLoading={loadingStates['full-glass']}
                    onClick={() => simulateLoading('full-glass')}
                />
                
                <AutoFixButton
                    variant="solid-tactile"
                    size="lg"
                    label="Fix with Copilot"
                    loadingLabel="Fixing..."
                    className="w-full justify-center"
                    isLoading={loadingStates['full-solid']}
                    onClick={() => simulateLoading('full-solid')}
                />
                
                <AutoFixButton
                    variant="ghost"
                    size="lg"
                    label="Auto-fix this section"
                    loadingLabel="Processing..."
                    className="w-full justify-center"
                    isLoading={loadingStates['full-ghost']}
                    onClick={() => simulateLoading('full-ghost')}
                />
            </div>
        </div>
    )
}

export default AutoFixButtonDemo
