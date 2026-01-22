'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getModule } from '@/lib/contentLoader'
import { getAnalytics } from '@/lib/analytics'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  
  const sessionId = useAppStore((state) => state.sessionId)
  const preferences = useAppStore((state) => state.preferences)
  const [mastery, setMastery] = useState({ obj1: 0.7, obj2: 0.8, obj3: 0.9 }) // Mock data for MVP
  
  const moduleData = getModule(moduleId)
  const analytics = sessionId ? getAnalytics(sessionId) : null

  useEffect(() => {
    if (!moduleData) {
      router.push('/modules')
      return
    }
    
    // Calculate mastery from analytics events (simplified for MVP)
    if (analytics) {
      const events = analytics.getEvents()
      const checkEvents = events.filter(e => e.type === 'check_answered')
      const correctCount = checkEvents.filter(e => e.data?.correct).length
      const totalChecks = checkEvents.length
      
      if (totalChecks > 0) {
        const overallMastery = correctCount / totalChecks
        setMastery({
          obj1: overallMastery * 0.9,
          obj2: overallMastery * 0.95,
          obj3: overallMastery,
        })
      }
    }
  }, [moduleData, analytics, router])

  const handleExport = () => {
    if (!analytics) return
    
    const summary = {
      moduleId,
      sessionId,
      mastery,
      supportsUsed: {
        audioNarration: preferences.udl.audioNarration,
        simplifiedLanguage: preferences.udl.simplifiedLanguage,
        symbolGlossary: preferences.udl.symbolGlossary,
        difficultyLevel: preferences.udl.difficultyLevel,
      },
      events: analytics.getEvents(),
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lab-summary-${moduleId}-${sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!moduleData) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary-900">Lab Results</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold">{moduleData.title}</h2>
          
          {/* Mastery Snapshot */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Mastery Snapshot</h3>
            <div className="space-y-4">
              {moduleData.objectives.map((obj, idx) => {
                const masteryValue = mastery[`obj${idx + 1}` as keyof typeof mastery]
                const percentage = Math.round(masteryValue * 100)
                
                return (
                  <div key={obj.id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{obj.text}</span>
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${obj.text}: ${percentage}% mastery`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Supports Used */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Supports Used</h3>
            <div className="space-y-2">
              {preferences.udl.audioNarration && (
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Audio narration</span>
                </div>
              )}
              {preferences.udl.simplifiedLanguage && (
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Simplified language</span>
                </div>
              )}
              {preferences.udl.symbolGlossary && (
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Symbol glossary</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span>✓</span>
                <span>Difficulty: {preferences.udl.difficultyLevel}</span>
              </div>
            </div>
          </div>

          {/* Badges & Points (if enabled) */}
          {(preferences.udl.showBadges || preferences.udl.showPoints) && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Achievements</h3>
              <div className="flex flex-wrap gap-4">
                {preferences.udl.showPoints && (
                  <div className="px-4 py-2 bg-yellow-100 rounded-lg border border-yellow-300">
                    <span className="font-semibold">Points: </span>
                    <span>{Math.round(Object.values(mastery).reduce((a, b) => a + b, 0) * 100)}</span>
                  </div>
                )}
                {preferences.udl.showBadges && (
                  <>
                    {mastery.obj1 > 0.7 && (
                      <div className="px-4 py-2 bg-blue-100 rounded-lg border border-blue-300">
                        🏆 Circuit Master
                      </div>
                    )}
                    {mastery.obj2 > 0.7 && (
                      <div className="px-4 py-2 bg-green-100 rounded-lg border border-green-300">
                        🎯 Prediction Pro
                      </div>
                    )}
                    {mastery.obj3 > 0.7 && (
                      <div className="px-4 py-2 bg-purple-100 rounded-lg border border-purple-300">
                        🔧 Builder Badge
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Next Recommended Action */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">Next Recommended Action</h3>
            <p className="text-sm text-gray-700">
              {Object.values(mastery).some(m => m < 0.7)
                ? 'Consider repeating steps where you struggled, or try the challenge mode for extra practice.'
                : 'Great work! You\'ve mastered the concepts. Try the challenge mode to test your skills further.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Export summary"
            >
              Export Summary
            </button>
            <button
              onClick={() => router.push('/modules')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Back to modules"
            >
              Back to Modules
            </button>
            <button
              onClick={() => router.push('/teacher')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="View teacher dashboard"
            >
              Teacher Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
