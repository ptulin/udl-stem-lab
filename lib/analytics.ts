export type EventType =
  | 'step_viewed'
  | 'sim_action'
  | 'hint_requested'
  | 'check_answered'
  | 'support_toggled'
  | 'mastery_updated'
  | 'session_completed'
  | 'preference_saved'
  | 'module_started'
  | 'module_completed'

export interface AnalyticsEvent {
  type: EventType
  timestamp: number
  sessionId: string
  userId?: string
  data?: Record<string, any>
}

const STORAGE_KEY = 'udl-stem-lab-analytics'

export class AnalyticsLogger {
  private sessionId: string
  private events: AnalyticsEvent[] = []

  constructor(sessionId: string) {
    this.sessionId = sessionId
    this.loadEvents()
  }

  private loadEvents() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allEvents = JSON.parse(stored) as AnalyticsEvent[]
        this.events = allEvents.filter(e => e.sessionId === this.sessionId)
      }
    } catch (e) {
      console.error('Failed to load analytics events:', e)
    }
  }

  private saveEvents() {
    if (typeof window === 'undefined') return
    
    try {
      // Load all events from all sessions
      const stored = localStorage.getItem(STORAGE_KEY)
      let allEvents: AnalyticsEvent[] = []
      
      if (stored) {
        allEvents = JSON.parse(stored) as AnalyticsEvent[]
        // Remove old events for this session
        allEvents = allEvents.filter(e => e.sessionId !== this.sessionId)
      }
      
      // Add current session events
      allEvents.push(...this.events)
      
      // Keep only last 1000 events to prevent storage bloat
      if (allEvents.length > 1000) {
        allEvents = allEvents.slice(-1000)
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents))
    } catch (e) {
      console.error('Failed to save analytics events:', e)
    }
  }

  log(eventType: EventType, data?: Record<string, any>) {
    const event: AnalyticsEvent = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
    }
    
    this.events.push(event)
    this.saveEvents()
    
    // Also log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics:', event)
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getAllSessionsEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as AnalyticsEvent[]
      }
    } catch (e) {
      console.error('Failed to load all analytics events:', e)
    }
    
    return []
  }

  exportSession(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      events: this.events,
      exportedAt: new Date().toISOString(),
    }, null, 2)
  }
}

// Singleton instance (will be initialized per session)
let analyticsInstance: AnalyticsLogger | null = null

export function getAnalytics(sessionId: string): AnalyticsLogger {
  if (!analyticsInstance || analyticsInstance['sessionId'] !== sessionId) {
    analyticsInstance = new AnalyticsLogger(sessionId)
  }
  return analyticsInstance
}
