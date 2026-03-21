import { useState } from 'react'
import { Trophy, RefreshCw, X, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'
import { QuizResult, QuizQuestion } from '../../types'
import clsx from 'clsx'

interface QuizResultsProps {
  result: QuizResult;
  questions: QuizQuestion[];
  onRetake: () => void;
  onClose: () => void;
}

function getGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent!', color: 'text-garden-600' }
  if (score >= 70) return { label: 'Good Job!', color: 'text-blue-600' }
  return { label: 'Keep Practicing!', color: 'text-amber-600' }
}

export default function QuizResults({ result, questions, onRetake, onClose }: QuizResultsProps) {
  const [showReview, setShowReview] = useState(false)
  const percentage = result.total_questions > 0
    ? Math.round((result.correct_count / result.total_questions) * 100)
    : 0
  const grade = getGrade(percentage)

  const resultMap = new Map(result.results.map((r) => [r.question_id, r]))

  return (
    <div className="flex flex-col gap-6">
      {/* Score display */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <Trophy className={clsx('w-12 h-12', percentage >= 70 ? 'text-amber-400' : 'text-gray-300')} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">
          {result.correct_count}/{result.total_questions} Correct
        </h2>
        <p className="text-xl font-semibold text-gray-600 mb-2">({percentage}%)</p>
        <span className={clsx('text-lg font-bold', grade.color)}>{grade.label}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700',
            percentage >= 70 ? 'bg-garden-500' : 'bg-amber-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Review toggle */}
      <button
        onClick={() => setShowReview(!showReview)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Review Answers
        {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showReview && (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {questions.map((question, idx) => {
            const qResult = resultMap.get(question.id)
            const isCorrect = qResult?.correct ?? false
            return (
              <div key={question.id} className={clsx(
                'p-3 rounded-lg border text-sm',
                isCorrect ? 'border-garden-200 bg-garden-50' : 'border-red-200 bg-red-50'
              )}>
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-garden-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <p className="font-medium text-gray-800">
                    {idx + 1}. {question.question}
                  </p>
                </div>
                {qResult && (
                  <p className="text-xs text-gray-600 ml-6">
                    Correct answer: <span className="font-semibold">{question.options[qResult.correct_index]}</span>
                  </p>
                )}
                {qResult?.explanation && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">{qResult.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-garden-300 text-garden-700 rounded-xl font-medium hover:bg-garden-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retake Quiz
        </button>
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-garden-600 text-white rounded-xl font-medium hover:bg-garden-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          Back to Module
        </button>
      </div>
    </div>
  )
}
