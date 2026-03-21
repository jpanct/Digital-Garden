import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Quiz, QuizResult } from '../../types'
import { quizApi } from '../../api/quiz'
import axios from 'axios'
import QuizQuestionComponent from './QuizQuestion'
import QuizResults from './QuizResults'
import clsx from 'clsx'

interface QuizModalProps {
  quiz: Quiz;
  userId: number;
  onClose: () => void;
}

export default function QuizModal({ quiz, userId, onClose }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === totalQuestions

  const handleSelect = (index: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await quizApi.submitAttempt(quiz.id, userId, answers)
      setResult(response.data as QuizResult)
      setSubmitted(true)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to submit quiz')
      } else {
        setError('Failed to submit quiz')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
    setCurrentIndex(0)
  }

  const currentResult = result?.results.find((r) => r.question_id === currentQuestion?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Knowledge Check</h2>
            {!submitted && (
              <p className="text-sm text-gray-500">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {!submitted ? (
            <>
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6 flex-wrap">
                {quiz.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={clsx(
                      'w-2.5 h-2.5 rounded-full transition-all cursor-pointer',
                      idx === currentIndex
                        ? 'bg-garden-600 scale-125'
                        : answers[q.id] !== undefined
                        ? 'bg-garden-400'
                        : 'bg-gray-200 hover:bg-gray-300'
                    )}
                    aria-label={`Go to question ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Question */}
              <QuizQuestionComponent
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] ?? null}
                onSelect={handleSelect}
              />

              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs text-gray-400">
                  {answeredCount}/{totalQuestions} answered
                </span>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2 bg-garden-600 text-white rounded-xl text-sm font-medium hover:bg-garden-700 transition-colors cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-garden-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-garden-700 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Quiz'
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            result && (
              <>
                {/* Show current question result or results screen */}
                <QuizResults
                  result={result}
                  questions={quiz.questions}
                  onRetake={handleRetake}
                  onClose={onClose}
                />
                {/* Optionally show current question review */}
                {currentQuestion && currentResult && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                      Question Review
                    </p>
                    <QuizQuestionComponent
                      question={currentQuestion}
                      selectedAnswer={answers[currentQuestion.id] ?? null}
                      onSelect={() => {}}
                      showResult
                      isCorrect={currentResult.correct}
                    />
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
