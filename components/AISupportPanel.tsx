'use client'

import { useState } from 'react'
import { type Step } from '@/lib/contentLoader'

interface AISupportPanelProps {
  step: Step
  onHintRequested: (level: number) => void
}

export default function AISupportPanel({ step, onHintRequested }: AISupportPanelProps) {
  const [currentHintLevel, setCurrentHintLevel] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [showSmallerSteps, setShowSmallerSteps] = useState(false)

  const handleHint = () => {
    if (currentHintLevel < step.hints.length) {
      const nextLevel = currentHintLevel + 1
      setCurrentHintLevel(nextLevel)
      onHintRequested(nextLevel)
    }
  }

  const handleExplain = () => {
    setShowExplain(!showExplain)
  }

  const handleSmallerSteps = () => {
    setShowSmallerSteps(!showSmallerSteps)
  }

  const currentHint = currentHintLevel > 0 ? step.hints[currentHintLevel - 1] : null
  const hasMoreHints = currentHintLevel < step.hints.length

  return (
    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 space-y-4">
      <h3 className="text-lg font-semibold text-purple-900">AI Support</h3>
      
      <div className="space-y-3">
        <button
          onClick={handleHint}
          disabled={!hasMoreHints}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300"
          aria-label={hasMoreHints ? `Get hint level ${currentHintLevel + 1}` : 'No more hints available'}
        >
          {hasMoreHints ? `Hint (Level ${currentHintLevel + 1})` : 'No More Hints'}
        </button>
        
        {currentHint && (
          <div className="p-3 bg-white rounded border border-purple-200">
            <p className="text-sm text-gray-700">{currentHint.text}</p>
          </div>
        )}

        <button
          onClick={handleExplain}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Explain why"
        >
          Explain Why
        </button>
        
        {showExplain && step.explainers.length > 0 && (
          <div className="p-3 bg-white rounded border border-blue-200 space-y-2">
            {step.explainers.map((explainer, idx) => (
              <div key={idx}>
                <strong className="text-sm text-gray-800">{explainer.topic}:</strong>
                <p className="text-sm text-gray-700 mt-1">{explainer.text}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSmallerSteps}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Try a smaller step"
        >
          Try a Smaller Step
        </button>
        
        {showSmallerSteps && (
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="text-sm text-gray-700 mb-2">
              Let&apos;s break this step into smaller parts:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Read the instructions carefully</li>
              <li>Identify what components you need</li>
              <li>Place the first component on the canvas</li>
              <li>Add the remaining components one at a time</li>
              <li>Connect them following the instructions</li>
              <li>Check if your circuit matches the expected state</li>
            </ol>
          </div>
        )}
      </div>

      {step.vocabulary.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded border border-purple-200">
          <h4 className="font-semibold text-sm mb-2">Vocabulary:</h4>
          <div className="space-y-1">
            {step.vocabulary.map((vocab, idx) => (
              <div key={idx} className="text-sm">
                <strong>{vocab.term}</strong>
                {vocab.symbol && <span className="ml-1">({vocab.symbol})</span>}
                : {vocab.definition}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
