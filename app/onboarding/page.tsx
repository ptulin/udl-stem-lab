'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore, type UDLPreferences, type AccessibilitySettings } from '@/lib/store'

export default function OnboardingPage() {
  const router = useRouter()
  const setPreferences = useAppStore((state) => state.setPreferences)
  const preferences = useAppStore((state) => state.preferences)
  
  const [udl, setUdl] = useState<UDLPreferences>(preferences.udl)
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(preferences.accessibility)

  const handleSave = () => {
    setPreferences({ udl, accessibility })
    router.push('/modules')
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary-900">Choose Your Supports</h1>
        <p className="text-lg text-gray-700">
          Customize your learning experience with UDL supports and accessibility settings.
        </p>

        {/* UDL Preferences */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold text-primary-800">UDL Supports</h2>
          
          {/* Representation */}
          <div>
            <h3 className="text-xl font-medium mb-4">Representation</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={udl.audioNarration}
                  onChange={(e) => setUdl({ ...udl, audioNarration: e.target.checked })}
                  className="w-5 h-5"
                  aria-label="Enable audio narration"
                />
                <span>Audio narration</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={udl.simplifiedLanguage}
                  onChange={(e) => setUdl({ ...udl, simplifiedLanguage: e.target.checked })}
                  className="w-5 h-5"
                  aria-label="Use simplified language"
                />
                <span>Simplified language</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={udl.symbolGlossary}
                  onChange={(e) => setUdl({ ...udl, symbolGlossary: e.target.checked })}
                  className="w-5 h-5"
                  aria-label="Show symbol glossary"
                />
                <span>Symbol glossary</span>
              </label>
            </div>
          </div>

          {/* Engagement */}
          <div>
            <h3 className="text-xl font-medium mb-4">Engagement</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-2 font-medium">Difficulty Level</label>
                <select
                  value={udl.difficultyLevel}
                  onChange={(e) => setUdl({ ...udl, difficultyLevel: e.target.value as any })}
                  className="w-full p-2 border rounded-lg"
                  aria-label="Select difficulty level"
                >
                  <option value="guided">Guided</option>
                  <option value="standard">Standard</option>
                  <option value="challenge">Challenge</option>
                </select>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={udl.showPoints}
                  onChange={(e) => setUdl({ ...udl, showPoints: e.target.checked })}
                  className="w-5 h-5"
                  aria-label="Show points"
                />
                <span>Show points</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={udl.showBadges}
                  onChange={(e) => setUdl({ ...udl, showBadges: e.target.checked })}
                  className="w-5 h-5"
                  aria-label="Show badges"
                />
                <span>Show badges</span>
              </label>
            </div>
          </div>

          {/* Action/Expression */}
          <div>
            <h3 className="text-xl font-medium mb-4">Action & Expression</h3>
            <div>
              <label className="block mb-2 font-medium">Response Mode</label>
              <select
                value={udl.responseMode}
                onChange={(e) => setUdl({ ...udl, responseMode: e.target.value as any })}
                className="w-full p-2 border rounded-lg"
                aria-label="Select response mode"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="short-answer">Short Answer</option>
                <option value="voice">Voice Input (Coming Soon)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Accessibility Settings */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold text-primary-800">Accessibility Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.highContrast}
                onChange={(e) => setAccessibility({ ...accessibility, highContrast: e.target.checked })}
                className="w-5 h-5"
                aria-label="Enable high contrast mode"
              />
              <span>High contrast mode</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.reduceMotion}
                onChange={(e) => setAccessibility({ ...accessibility, reduceMotion: e.target.checked })}
                className="w-5 h-5"
                aria-label="Reduce motion"
              />
              <span>Reduce motion</span>
            </label>
            <div>
              <label className="block mb-2 font-medium">Font Size</label>
              <input
                type="range"
                min="1"
                max="3"
                value={accessibility.fontSize}
                onChange={(e) => setAccessibility({ ...accessibility, fontSize: parseInt(e.target.value) })}
                className="w-full"
                aria-label="Adjust font size"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
            </div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accessibility.keyboardOnlyMode}
                onChange={(e) => setAccessibility({ ...accessibility, keyboardOnlyMode: e.target.checked })}
                className="w-5 h-5"
                aria-label="Enable keyboard-only mode helper"
              />
              <span>Keyboard-only mode helper tips</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400"
            aria-label="Go back"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
            aria-label="Save preferences and continue"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </main>
  )
}
