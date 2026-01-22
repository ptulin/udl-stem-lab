import contentPack from '@/data/contentPack.json'

export interface ContentPack {
  modules: Module[]
}

export interface Module {
  id: string
  title: string
  description: string
  estimatedTime: string
  objectives: Objective[]
  assessment: Assessment
  steps: Step[]
  knowledgeChecks: KnowledgeCheck[]
  rubric: Rubric
  misconceptions: Misconception[]
}

export interface Objective {
  id: string
  text: string
}

export interface Assessment {
  type: string
  description: string
}

export interface Step {
  id: string
  title: string
  instructions: string
  simExpectedState?: any
  commonMistakes: CommonMistake[]
  hints: Hint[]
  explainers: Explainer[]
  vocabulary: VocabularyItem[]
  audioScript: string
}

export interface CommonMistake {
  type: string
  detection: string
  message: string
}

export interface Hint {
  level: number
  text: string
}

export interface Explainer {
  topic: string
  text: string
}

export interface VocabularyItem {
  term: string
  definition: string
  symbol?: string
}

export interface KnowledgeCheck {
  id: string
  stepAfter: number
  questions: Question[]
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  remediation: string
}

export interface Rubric {
  criteria: Criterion[]
}

export interface Criterion {
  id: string
  name: string
  levels: Level[]
}

export interface Level {
  level: string
  description: string
}

export interface Misconception {
  id: string
  misconception: string
  detectionSignals: string[]
  explanation: string
  correctiveActivity: string
}

export function getContentPack(): ContentPack {
  return contentPack as ContentPack
}

export function getModule(moduleId: string): Module | undefined {
  const pack = getContentPack()
  return pack.modules.find(m => m.id === moduleId)
}

export function getStep(moduleId: string, stepIndex: number): Step | undefined {
  const moduleData = getModule(moduleId)
  if (!moduleData) return undefined
  return moduleData.steps[stepIndex]
}

export function getKnowledgeCheck(moduleId: string, checkId: string): KnowledgeCheck | undefined {
  const moduleData = getModule(moduleId)
  if (!moduleData) return undefined
  return moduleData.knowledgeChecks.find(kc => kc.id === checkId)
}

export function getKnowledgeCheckAfterStep(moduleId: string, stepIndex: number): KnowledgeCheck | undefined {
  const moduleData = getModule(moduleId)
  if (!moduleData) return undefined
  return moduleData.knowledgeChecks.find(kc => kc.stepAfter === stepIndex)
}
