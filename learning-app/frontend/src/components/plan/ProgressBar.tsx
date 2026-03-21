import clsx from 'clsx'

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
}

export default function ProgressBar({ value, max = 100, className, color }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            color || 'bg-garden-500'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
