'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getModule, getStep, getKnowledgeCheckAfterStep } from '@/lib/contentLoader'
import { CircuitSimulator } from '@/lib/circuitSim'
import { getAnalytics } from '@/lib/analytics'
import SimulationPanel from '@/components/SimulationPanel'
import AISupportPanel from '@/components/AISupportPanel'
import KnowledgeCheck from '@/components/KnowledgeCheck'

export default function LabPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  
  const currentStep = useAppStore((state) => state.currentStep)
  const sessionId = useAppStore((state) => state.sessionId)
  const preferences = useAppStore((state) => state.preferences)
  const setCurrentStep = useAppStore((state) => state.setCurrentStep)
  const setSessionId = useAppStore((state) => state.setSessionId)
  
  const [simulator] = useState(() => new CircuitSimulator())
  const [circuitState, setCircuitState] = useState(simulator.analyzeCircuit())
  const [textMode, setTextMode] = useState(false)
  const [showKnowledgeCheck, setShowKnowledgeCheck] = useState(false)
  const [knowledgeCheckResults, setKnowledgeCheckResults] = useState<any[]>([])
  
  const moduleData = getModule(moduleId)
  const step = getStep(moduleId, currentStep)
  const knowledgeCheck = getKnowledgeCheckAfterStep(moduleId, currentStep)
  
  // Initialize session if needed
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [sessionId, setSessionId])
  
  const analytics = sessionId ? getAnalytics(sessionId) : null

  useEffect(() => {
    if (!moduleData) {
      router.push('/modules')
      return
    }
    
    if (analytics) {
      analytics.log('step_viewed', { moduleId, stepIndex: currentStep, stepId: step?.id })
    }
  }, [currentStep, moduleData, step, analytics, moduleId, router])

  useEffect(() => {
    // Apply accessibility settings
    const root = document.documentElement
    if (preferences.accessibility.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (preferences.accessibility.reduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    // Apply font size
    const fontSizeMap = { 1: '0.875rem', 2: '1rem', 3: '1.125rem' }
    root.style.fontSize = fontSizeMap[preferences.accessibility.fontSize as keyof typeof fontSizeMap]
  }, [preferences.accessibility])

  if (!moduleData || !step) {
    return <div>Loading...</div>
  }

  const handleNext = () => {
    // Check if there's a knowledge check after this step
    if (knowledgeCheck && !showKnowledgeCheck) {
      setShowKnowledgeCheck(true)
      return
    }
    
    if (currentStep < moduleData.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowKnowledgeCheck(false)
    } else {
      // Lab complete
      if (analytics) {
        analytics.log('session_completed', { moduleId })
      }
      router.push(`/results/${moduleId}`)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowKnowledgeCheck(false)
    }
  }

  const handleCircuitChange = (state: ReturnType<CircuitSimulator['analyzeCircuit']>) => {
    setCircuitState(state)
    if (analytics) {
      analytics.log('sim_action', { moduleId, stepIndex: currentStep, topology: state.topology, closed: state.closed })
    }
  }

  const handleHintRequested = (level: number) => {
    if (analytics) {
      analytics.log('hint_requested', { moduleId, stepIndex: currentStep, level })
    }
  }

  const handleKnowledgeCheckComplete = (results: any[]) => {
    setKnowledgeCheckResults([...knowledgeCheckResults, ...results])
    const correctCount = results.filter(r => r.correct).length
    const totalQuestions = results.length
    
    if (analytics) {
      results.forEach(result => {
        analytics.log('check_answered', {
          moduleId,
          stepIndex: currentStep,
          questionId: result.questionId,
          correct: result.correct,
          attempts: result.attempts,
        })
      })
    }
    
    // Adaptive difficulty: if missed more than 1, suggest supports
    if (correctCount < totalQuestions - 1) {
      // Could trigger a recommendation here
      console.log('Recommendation: Consider using simplified language or glossary')
    }
    
    setShowKnowledgeCheck(false)
    handleNext()
  }

  const isStepComplete = () => {
    // Simple check: if circuit has expected topology and is closed
    if (step.simExpectedState) {
      const expected = step.simExpectedState
      if (expected.topology && circuitState.topology !== expected.topology) {
        return false
      }
      if (expected.closed !== undefined && circuitState.closed !== expected.closed) {
        return false
      }
    }
    return true
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Stepper */}
        <div className="mb-6" role="navigation" aria-label="Lab progress">
          <ol className="flex items-center justify-between mb-4">
            {moduleData.steps.map((s, idx) => (
              <li
                key={s.id}
                className={`flex-1 ${idx < moduleData.steps.length - 1 ? 'mr-2' : ''}`}
              >
                <div
                  className={`h-2 rounded ${
                    idx <= currentStep
                      ? 'bg-primary-600'
                      : 'bg-gray-300'
                  }`}
                  aria-current={idx === currentStep ? 'step' : undefined}
                />
                <span className="sr-only">
                  Step {idx + 1}: {s.title}
                  {idx === currentStep ? ' (current)' : ''}
                </span>
              </li>
            ))}
          </ol>
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              Step {currentStep + 1} of {moduleData.steps.length}: {step.title}
            </h2>
          </div>
        </div>

        {showKnowledgeCheck && knowledgeCheck ? (
          <KnowledgeCheck
            questions={knowledgeCheck.questions}
            onComplete={handleKnowledgeCheckComplete}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Step Content */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 whitespace-pre-line">
                    {preferences.udl.simplifiedLanguage
                      ? step.instructions.replace(/circuit/gi, 'path').replace(/current/gi, 'flow')
                      : step.instructions}
                  </p>
                </div>
                
                {preferences.udl.audioNarration && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // In a real app, this would use Web Speech API
                        alert('Audio narration: ' + step.audioScript)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      aria-label="Play audio narration"
                    >
                      🔊 Play Audio
                    </button>
                  </div>
                )}

                {preferences.udl.symbolGlossary && step.vocabulary.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border">
                    <h4 className="font-semibold mb-2">Glossary:</h4>
                    <div className="space-y-1 text-sm">
                      {step.vocabulary.map((vocab, idx) => (
                        <div key={idx}>
                          <strong>{vocab.term}</strong>
                          {vocab.symbol && <span className="ml-1">({vocab.symbol})</span>}
                          : {vocab.definition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AISupportPanel step={step} onHintRequested={handleHintRequested} />

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Previous step"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  aria-label="Next step"
                >
                  {currentStep < moduleData.steps.length - 1 ? 'Next' : 'Complete Lab'}
                </button>
              </div>
            </div>

            {/* Right: Simulation Panel */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Circuit Simulation</h3>
                <button
                  onClick={() => setTextMode(!textMode)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label={textMode ? 'Switch to visual mode' : 'Switch to text mode'}
                >
                  {textMode ? 'Visual Mode' : 'Text Mode'}
                </button>
              </div>
              <SimulationPanel
                simulator={simulator}
                onCircuitChange={handleCircuitChange}
                textMode={textMode}
              />
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm">
                  <strong>Note:</strong> AR Mode coming soon! For now, use the interactive simulation above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
