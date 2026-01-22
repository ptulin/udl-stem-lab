'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function LandingPage() {
  const router = useRouter()
  const setRole = useAppStore((state) => state.setRole)

  const handleStartAsStudent = () => {
    setRole('student')
    router.push('/onboarding')
  }

  const handleSwitchToTeacher = () => {
    setRole('teacher')
    router.push('/teacher')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-primary-900 mb-4">
          UDL STEM Lab
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Mobile-first learning with UDL supports, AI scaffolding, and
          accessibility-first design
        </p>
        <div className="space-y-4">
          <button
            onClick={handleStartAsStudent}
            className="w-full px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-colors"
            aria-label="Start as Student"
          >
            Start as Student
          </button>
          <button
            onClick={handleSwitchToTeacher}
            className="w-full px-6 py-4 bg-gray-200 text-gray-800 rounded-lg font-semibold text-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-colors"
            aria-label="Switch to Teacher Dashboard"
          >
            Switch to Teacher
          </button>
        </div>
      </div>
    </main>
  )
}
