'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getContentPack } from '@/lib/contentLoader'
import { getAnalytics } from '@/lib/analytics'
import { useEffect } from 'react'

export default function ModulesPage() {
  const router = useRouter()
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const setSessionId = useAppStore((state) => state.setSessionId)
  const sessionId = useAppStore((state) => state.sessionId)
  
  const contentPack = getContentPack()
  const moduleData = contentPack.modules[0] // Only one module for MVP

  useEffect(() => {
    // Initialize session if not exists
    if (!sessionId) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      const analytics = getAnalytics(newSessionId)
      analytics.log('module_started', { moduleId: moduleData.id })
    }
  }, [sessionId, setSessionId, moduleData.id])

  const handleStartModule = () => {
    setCurrentModule(moduleData.id)
    router.push(`/lab/${moduleData.id}`)
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary-900">Available Modules</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-primary-800">{moduleData.title}</h2>
          <p className="text-lg text-gray-700">{moduleData.description}</p>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Estimated Time:</strong> {moduleData.estimatedTime}
            </p>
            <div>
              <strong className="text-gray-700">Learning Objectives:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {moduleData.objectives.map((obj) => (
                  <li key={obj.id} className="text-gray-600">{obj.text}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <strong className="text-gray-700">How You&apos;ll Be Assessed:</strong>
              <p className="text-gray-600 mt-1">{moduleData.assessment.description}</p>
            </div>
          </div>

          <button
            onClick={handleStartModule}
            className="w-full mt-6 px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
            aria-label={`Start ${moduleData.title} module`}
          >
            Start Module
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-primary-600 hover:text-primary-700 underline"
            aria-label="Go back to onboarding"
          >
            Change Preferences
          </button>
        </div>
      </div>
    </main>
  )
}
