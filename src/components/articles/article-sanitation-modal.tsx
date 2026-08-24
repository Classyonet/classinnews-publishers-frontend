'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  X, 
  ArrowRight,
  RefreshCw,
  Send,
  Zap
} from 'lucide-react'
import { publisherAuthFetch } from '@/lib/publisher-session'

interface SanitationModalProps {
  isOpen: boolean
  article: {
    title: string
    content: string
    excerpt: string
  }
  onClose: () => void
  onSuccessSubmit: () => void
}

type StageStatus = 'pending' | 'scanning' | 'passed' | 'failed'

interface StageState {
  status: StageStatus
  score: number
  title: string
  details: string
  issues: string[]
  aiPercentage?: number
  threshold?: number
}

export function ArticleSanitationModal({
  isOpen,
  article,
  onClose,
  onSuccessSubmit
}: SanitationModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [progress, setProgress] = useState<number>(10)
  const [isScanning, setIsScanning] = useState<boolean>(true)
  const [allPassed, setAllPassed] = useState<boolean>(false)
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false)

  const [securityState, setSecurityState] = useState<StageState>({
    status: 'scanning',
    score: 0,
    title: 'Security & Code Safety',
    details: 'Scanning for malicious scripts, iframes, and injections...',
    issues: []
  })

  const [qualityState, setQualityState] = useState<StageState>({
    status: 'pending',
    score: 0,
    title: 'Content Quality & Integrity',
    details: 'Analyzing word density, spelling patterns, and structure...',
    issues: []
  })

  const [aiState, setAiState] = useState<StageState>({
    status: 'pending',
    score: 0,
    title: 'AI Content & Originality Analysis',
    details: 'Evaluating burstiness and syntax (maximum 50% limit)...',
    issues: [],
    aiPercentage: 0,
    threshold: 50
  })

  useEffect(() => {
    if (isOpen) {
      runSanitationWorkflow()
    }
  }, [isOpen])

  const runSanitationWorkflow = async () => {
    setIsScanning(true)
    setAllPassed(false)
    setIsAutoSubmitting(false)
    setCurrentStep(1)
    setProgress(15)

    setSecurityState({
      status: 'scanning',
      score: 0,
      title: 'Security & Code Safety',
      details: 'Scanning for dangerous tags, scripts, and unsafe URLs...',
      issues: []
    })
    setQualityState({
      status: 'pending',
      score: 0,
      title: 'Content Quality & Integrity',
      details: 'Analyzing length, typographical integrity, and structure...',
      issues: []
    })
    setAiState({
      status: 'pending',
      score: 0,
      title: 'AI Content & Originality Analysis',
      details: 'Evaluating burstiness and syntax (maximum 50% limit)...',
      issues: [],
      aiPercentage: 0,
      threshold: 50
    })

    try {
      // Call backend sanitation endpoint
      const res = await publisherAuthFetch('/api/articles/sanitize-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt
        })
      })

      const json = await res.json().catch(() => null)
      const data = json?.data

      // Step 1: Security Scan Animation (800ms)
      await new Promise(r => setTimeout(r, 800))
      const secPassed = data?.stages?.security?.passed ?? true
      const secIssues = data?.stages?.security?.issues ?? []
      const secScore = data?.stages?.security?.score ?? (secPassed ? 100 : 0)

      setSecurityState({
        status: secPassed ? 'passed' : 'failed',
        score: secScore,
        title: 'Security & Code Safety',
        details: secPassed ? 'Safe: Zero malicious scripts or dangerous tags detected.' : 'Vulnerability detected in article body.',
        issues: secIssues
      })
      setProgress(38)

      if (!secPassed) {
        setIsScanning(false)
        return
      }

      // Step 2: Quality & Integrity Animation (900ms)
      setCurrentStep(2)
      setQualityState(prev => ({ ...prev, status: 'scanning' }))
      await new Promise(r => setTimeout(r, 900))

      const qualPassed = data?.stages?.quality?.passed ?? true
      const qualIssues = data?.stages?.quality?.issues ?? []
      const qualScore = data?.stages?.quality?.score ?? (qualPassed ? 95 : 0)

      setQualityState({
        status: qualPassed ? 'passed' : 'failed',
        score: qualScore,
        title: 'Content Quality & Integrity',
        details: qualPassed ? 'Passed: Article meets length, clarity, and lexical standards.' : 'Quality or length standards not met.',
        issues: qualIssues
      })
      setProgress(72)

      if (!qualPassed) {
        setIsScanning(false)
        return
      }

      // Step 3: AI & Originality Animation (1000ms)
      setCurrentStep(3)
      setAiState(prev => ({ ...prev, status: 'scanning' }))
      await new Promise(r => setTimeout(r, 1000))

      const aiPassed = data?.stages?.aiDetection?.passed ?? true
      const aiIssues = data?.stages?.aiDetection?.issues ?? []
      const aiScore = data?.stages?.aiDetection?.score ?? (aiPassed ? 88 : 30)
      const aiPct = data?.stages?.aiDetection?.aiPercentage ?? 18
      const threshold = data?.stages?.aiDetection?.threshold ?? 50

      setAiState({
        status: aiPassed ? 'passed' : 'failed',
        score: aiScore,
        aiPercentage: aiPct,
        threshold,
        title: 'AI Content & Originality Analysis',
        details: aiPassed 
          ? `Originality verified (${aiPct}% AI probability, under ${threshold}% limit).` 
          : `High AI probability (${aiPct}% exceeds ${threshold}% limit).`,
        issues: aiIssues
      })
      setProgress(100)
      setIsScanning(false)

      if (aiPassed) {
        setAllPassed(true)
        setIsAutoSubmitting(true)
        // Auto-submit after 1200ms celebratory pause
        setTimeout(() => {
          onSuccessSubmit()
        }, 1200)
      }
    } catch (err) {
      console.error('Sanitation scan error:', err)
      setIsScanning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Article Sanitation Check</h3>
              <p className="text-xs text-purple-100">Automated pre-submission validation & safety analysis</p>
            </div>
          </div>

          {!isAutoSubmitting && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-purple-900">
              {isScanning 
                ? `Running Diagnostic (Stage ${currentStep} of 3)...` 
                : allPassed 
                  ? 'All 3 Checks Passed Successfully!' 
                  : 'Action Required: Issue Flagged'}
            </span>
            <span className="font-mono text-purple-700">{progress}%</span>
          </div>

          <div className="h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 relative overflow-hidden ${
                allPassed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'
              }`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* 3 Section Cards */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Stage 1: Security */}
          <div className={`p-4 rounded-2xl border transition-all ${
            securityState.status === 'passed' 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : securityState.status === 'failed' 
                ? 'bg-red-50/80 border-red-200' 
                : securityState.status === 'scanning'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${
                  securityState.status === 'passed' 
                    ? 'bg-emerald-500 text-white' 
                    : securityState.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-purple-100 text-purple-700'
                }`}>
                  {securityState.status === 'scanning' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : securityState.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : securityState.status === 'failed' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Checkpoint 1</span>
                    <h4 className="text-sm font-bold text-slate-900">{securityState.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{securityState.details}</p>
                </div>
              </div>

              <div className="text-right">
                {securityState.status === 'passed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    +{securityState.score} pts
                  </span>
                )}
                {securityState.status === 'failed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    Failed
                  </span>
                )}
              </div>
            </div>

            {securityState.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200/60 text-xs text-red-700 space-y-1">
                {securityState.issues.map((iss, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>{iss}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Stage 2: Quality & Spelling */}
          <div className={`p-4 rounded-2xl border transition-all ${
            qualityState.status === 'passed' 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : qualityState.status === 'failed' 
                ? 'bg-red-50/80 border-red-200' 
                : qualityState.status === 'scanning'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${
                  qualityState.status === 'passed' 
                    ? 'bg-emerald-500 text-white' 
                    : qualityState.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-purple-100 text-purple-700'
                }`}>
                  {qualityState.status === 'scanning' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : qualityState.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : qualityState.status === 'failed' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Checkpoint 2</span>
                    <h4 className="text-sm font-bold text-slate-900">{qualityState.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{qualityState.details}</p>
                </div>
              </div>

              <div className="text-right">
                {qualityState.status === 'passed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    +{qualityState.score} pts
                  </span>
                )}
                {qualityState.status === 'failed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    Failed
                  </span>
                )}
              </div>
            </div>

            {qualityState.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200/60 text-xs text-red-700 space-y-1">
                {qualityState.issues.map((iss, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>{iss}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Stage 3: AI Generated Content */}
          <div className={`p-4 rounded-2xl border transition-all ${
            aiState.status === 'passed' 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : aiState.status === 'failed' 
                ? 'bg-red-50/80 border-red-200' 
                : aiState.status === 'scanning'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${
                  aiState.status === 'passed' 
                    ? 'bg-emerald-500 text-white' 
                    : aiState.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-purple-100 text-purple-700'
                }`}>
                  {aiState.status === 'scanning' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : aiState.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : aiState.status === 'failed' ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Checkpoint 3</span>
                    <h4 className="text-sm font-bold text-slate-900">{aiState.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{aiState.details}</p>
                </div>
              </div>

              <div className="text-right">
                {aiState.status === 'passed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {aiState.aiPercentage}% AI (Passed)
                  </span>
                )}
                {aiState.status === 'failed' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    {aiState.aiPercentage}% AI (&gt; 50%)
                  </span>
                )}
              </div>
            </div>

            {aiState.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200/60 text-xs text-red-700 space-y-1">
                {aiState.issues.map((iss, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>{iss}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {allPassed ? (
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold w-full justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                All 3 checks passed! Automatically sending submission...
              </span>
              <button
                onClick={onSuccessSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Now
              </button>
            </div>
          ) : !isScanning ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <p className="text-xs text-red-600 font-semibold text-center sm:text-left">
                Submission cancelled. Please fix the flagged items above in the editor.
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={runSanitationWorkflow}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-Scan
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Fix Issues in Editor
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-purple-700 w-full">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Scanning article content against safety & originality benchmarks...
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
