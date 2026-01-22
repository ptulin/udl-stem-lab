'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'student' | 'teacher'

export type DifficultyLevel = 'guided' | 'standard' | 'challenge'

export type ResponseMode = 'multiple-choice' | 'short-answer' | 'voice'

export interface UDLPreferences {
  // Representation
  audioNarration: boolean
  simplifiedLanguage: boolean
  symbolGlossary: boolean
  
  // Engagement
  difficultyLevel: DifficultyLevel
  showPoints: boolean
  showBadges: boolean
  
  // Action/Expression
  responseMode: ResponseMode
}

export interface AccessibilitySettings {
  highContrast: boolean
  reduceMotion: boolean
  fontSize: number // 1-3 scale
  keyboardOnlyMode: boolean
}

export interface UserPreferences {
  udl: UDLPreferences
  accessibility: AccessibilitySettings
}

export interface AppState {
  role: Role
  preferences: UserPreferences
  currentModule: string | null
  currentStep: number
  sessionId: string | null
  setRole: (role: Role) => void
  setPreferences: (prefs: UserPreferences) => void
  setCurrentModule: (moduleId: string) => void
  setCurrentStep: (step: number) => void
  setSessionId: (sessionId: string) => void
}

const defaultPreferences: UserPreferences = {
  udl: {
    audioNarration: false,
    simplifiedLanguage: false,
    symbolGlossary: false,
    difficultyLevel: 'standard',
    showPoints: true,
    showBadges: true,
    responseMode: 'multiple-choice',
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    fontSize: 2, // medium
    keyboardOnlyMode: false,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: 'student',
      preferences: defaultPreferences,
      currentModule: null,
      currentStep: 0,
      sessionId: null,
      setRole: (role) => set({ role }),
      setPreferences: (prefs) => set({ preferences: prefs }),
      setCurrentModule: (moduleId) => set({ currentModule: moduleId }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setSessionId: (sessionId) => set({ sessionId }),
    }),
    {
      name: 'udl-stem-lab-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined as any)),
    }
  )
)
