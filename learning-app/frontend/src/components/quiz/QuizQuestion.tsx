import { QuizQuestion as QuizQuestionType } from '../../types'
import clsx from 'clsx'

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

const optionLabels = ['A', 'B', 'C', 'D']

export default function QuizQuestion({
  question,
  selectedAnswer,
  onSelect,
  showResult,
  isCorrect,
}: QuizQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-800 leading-relaxed">{question.question}</p>

      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrectAnswer = showResult && question.correct_index === index
          const isWrongSelected = showResult && isSelected && !isCorrect

          return (
            <button
              key={index}
              onClick={() => !showResult && onSelect(index)}
              disabled={showResult}
              className={clsx(
                'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200',
                showResult
                  ? isCorrectAnswer
                    ? 'border-garden-500 bg-garden-50 text-garden-800'
                    : isWrongSelected
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-gray-200 bg-gray-50 text-gray-500 cursor-default'
                  : isSelected
                  ? 'border-garden-500 bg-garden-50 text-garden-800 cursor-pointer'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-garden-300 hover:bg-garden-50 cursor-pointer'
              )}
            >
              <span className={clsx(
                'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                showResult
                  ? isCorrectAnswer
                    ? 'bg-garden-500 text-white'
                    : isWrongSelected
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-200 text-gray-500'
                  : isSelected
                  ? 'bg-garden-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}>
                {optionLabels[index]}
              </span>
              <span className="text-sm leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>

      {showResult && question.explanation && (
        <div className={clsx(
          'mt-3 p-3 rounded-lg text-sm',
          isCorrect ? 'bg-garden-50 text-garden-700 border border-garden-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}>
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  )
}
