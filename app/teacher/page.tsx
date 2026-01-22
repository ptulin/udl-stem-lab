'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAnalytics, type AnalyticsEvent } from '@/lib/analytics'
import { getContentPack } from '@/lib/contentLoader'

interface StudentData {
  sessionId: string
  events: AnalyticsEvent[]
  timeOnTask: number
  hintRequests: number
  errorTypes: Record<string, number>
  mastery: Record<string, number>
  lastActivity: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const contentPack = getContentPack()

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = () => {
    // Get all events from localStorage
    const analytics = getAnalytics('dummy') // We'll get all events anyway
    const allEvents = analytics.getAllSessionsEvents()
    
    // Group events by session
    const sessions = new Map<string, AnalyticsEvent[]>()
    allEvents.forEach(event => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, [])
      }
      sessions.get(event.sessionId)!.push(event)
    })
    
    // Process each session
    const studentData: StudentData[] = []
    sessions.forEach((events, sessionId) => {
      const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp)
      const startTime = sortedEvents[0]?.timestamp || 0
      const endTime = sortedEvents[sortedEvents.length - 1]?.timestamp || startTime
      const timeOnTask = (endTime - startTime) / 1000 / 60 // minutes
      
      const hintRequests = events.filter(e => e.type === 'hint_requested').length
      
      const errorTypes: Record<string, number> = {}
      events.forEach(e => {
        if (e.type === 'sim_action' && e.data?.topology) {
          // Could track errors here
        }
        if (e.type === 'check_answered' && !e.data?.correct) {
          errorTypes['incorrect_answer'] = (errorTypes['incorrect_answer'] || 0) + 1
        }
      })
      
      // Calculate mastery (simplified)
      const checkEvents = events.filter(e => e.type === 'check_answered')
      const correctCount = checkEvents.filter(e => e.data?.correct).length
      const totalChecks = checkEvents.length
      const overallMastery = totalChecks > 0 ? correctCount / totalChecks : 0
      
      studentData.push({
        sessionId,
        events: sortedEvents,
        timeOnTask,
        hintRequests,
        errorTypes,
        mastery: {
          obj1: overallMastery * 0.9,
          obj2: overallMastery * 0.95,
          obj3: overallMastery,
        },
        lastActivity: endTime,
      })
    })
    
    // Sort by last activity
    studentData.sort((a, b) => b.lastActivity - a.lastActivity)
    setStudents(studentData)
  }

  const selectedStudentData = students.find(s => s.sessionId === selectedStudent)

  return (
    <main className="min-h-screen p-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-purple-900">Teacher Dashboard</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Back to home"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Student Overview</h2>
          
          {students.length === 0 ? (
            <p className="text-gray-600">No student data available yet. Start a lab session as a student to see data here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Session ID</th>
                    <th className="border p-2 text-left">Time on Task (min)</th>
                    <th className="border p-2 text-left">Hint Requests</th>
                    <th className="border p-2 text-left">Mastery (Obj 1)</th>
                    <th className="border p-2 text-left">Mastery (Obj 2)</th>
                    <th className="border p-2 text-left">Mastery (Obj 3)</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.sessionId} className="hover:bg-gray-50">
                      <td className="border p-2 font-mono text-sm">
                        {student.sessionId.slice(0, 20)}...
                      </td>
                      <td className="border p-2">{student.timeOnTask.toFixed(1)}</td>
                      <td className="border p-2">{student.hintRequests}</td>
                      <td className="border p-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${student.mastery.obj1 * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round(student.mastery.obj1 * 100)}%
                        </span>
                      </td>
                      <td className="border p-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${student.mastery.obj2 * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round(student.mastery.obj2 * 100)}%
                        </span>
                      </td>
                      <td className="border p-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${student.mastery.obj3 * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round(student.mastery.obj3 * 100)}%
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => setSelectedStudent(student.sessionId)}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                          aria-label={`View details for session ${student.sessionId}`}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Detail View */}
        {selectedStudentData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Session Timeline</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Close details"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedStudentData.events.map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{event.type}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div className="text-gray-600 text-xs mt-1">
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
              <h3 className="font-semibold mb-2">Common Error Types</h3>
              <div className="space-y-1">
                {Object.entries(selectedStudentData.errorTypes).map(([error, count]) => (
                  <div key={error} className="text-sm">
                    <strong>{error}:</strong> {count} occurrence{count !== 1 ? 's' : ''}
                  </div>
                ))}
                {Object.keys(selectedStudentData.errorTypes).length === 0 && (
                  <div className="text-sm text-gray-600">No errors recorded</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
