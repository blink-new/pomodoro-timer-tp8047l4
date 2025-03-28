
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { TimerProps } from '../types'

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function Timer({
  timeLeft,
  isRunning,
  phase,
  isMuted,
  selectedTodo,
  onToggleTimer,
  onResetTimer,
  onToggleMute
}: TimerProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
      <div className="relative aspect-square w-full max-w-lg">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={phase === 'work' ? '#3b82f6' : '#10b981'}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / (phase === 'work' ? 25 * 60 : 5 * 60))}`}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
            {formatTime(timeLeft)}
          </div>
          <div className={`text-xl md:text-2xl font-medium mb-2 ${
            phase === 'work' ? 'text-blue-500' : 'text-emerald-500'
          }`}>
            {phase === 'work' ? 'Focus Time' : 'Break Time'}
          </div>
          {selectedTodo && (
            <div className="text-base text-slate-500 max-w-[280px] md:max-w-sm text-center px-4">
              <div className="truncate">{selectedTodo.text}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onToggleTimer}
          className={`p-4 rounded-2xl ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } transition-all duration-200 shadow-lg hover:shadow-xl`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={onResetTimer}
          className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={onToggleMute}
          className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}