'use client'

import { useState } from 'react'
import { type Question } from '@/lib/contentLoader'

interface KnowledgeCheckProps {
  questions: Question[]
  onComplete: (results: { questionId: string; correct: boolean; attempts: number }[]) => void
}

export default function KnowledgeCheck({ questions, onComplete }: KnowledgeCheckProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [attempts, setAttempts] = useState<number[]>(new Array(questions.length).fill(0))
  const [results, setResults] = useState<{ questionId: string; correct: boolean; attempts: number }[]>([])
  const [showRemediation, setShowRemediation] = useState<number | null>(null)

  const question = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion] ?? null

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const newAttempts = [...attempts]
    newAttempts[currentQuestion] += 1
    setAttempts(newAttempts)

    const isCorrect = selectedAnswer === question.correctAnswer
    const newResults = [...results]
    newResults[currentQuestion] = {
      questionId: question.id,
      correct: isCorrect,
      attempts: newAttempts[currentQuestion],
    }
    setResults(newResults)

    if (isCorrect) {
      setShowRemediation(currentQuestion)
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1)
          setShowRemediation(null)
        } else {
          onComplete(newResults)
        }
      }, 2000)
    } else {
      setShowRemediation(currentQuestion)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowRemediation(null)
    } else {
      onComplete(results)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Knowledge Check</h2>
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const isCorrect = idx === question.correctAnswer
            const showFeedback = showRemediation === currentQuestion

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!showFeedback) {
                    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: idx })
                  }
                }}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? showFeedback && isCorrect
                      ? 'bg-green-100 border-green-500'
                      : showFeedback && !isCorrect
                      ? 'bg-red-100 border-red-500'
                      : 'bg-blue-100 border-blue-500'
                    : showFeedback && isCorrect
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-primary-300`}
                aria-label={`Option ${idx + 1}: ${option}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {showRemediation === currentQuestion && (
          <div
            className={`p-4 rounded-lg ${
              results[currentQuestion]?.correct
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
            role="alert"
          >
            <p className="font-semibold mb-2">
              {results[currentQuestion]?.correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-sm text-gray-700">{question.remediation}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {showRemediation === currentQuestion ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Next question"
            >
              {currentQuestion < questions.length - 1 ? 'Next' : 'Complete'}
            </button>
          ) : (
            <button
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Submit answer"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
