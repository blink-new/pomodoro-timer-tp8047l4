
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useLocalStorage } from 'react-use'
import './App.css'

type TimerPhase = 'work' | 'break'
type TimerStatus = 'running' | 'paused' | 'idle'

interface PomodoroStats {
  completedPomodoros: number
  totalFocusTime: number
  date: string
}

function App() {
  // Timer state
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isSoundOn, setIsSoundOn] = useState(false)
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  
  // Statistics
  const [stats, setStats] = useLocalStorage<PomodoroStats[]>('pomodoro-stats', [])

  useEffect(() => {
    let interval: number | null = null
    
    if (status === 'running') {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Timer completed
            const newPhase = phase === 'work' ? 'break' : 'work'
            setPhase(newPhase)
            
            // Update stats if work phase completed
            if (phase === 'work') {
              const today = new Date().toISOString().split('T')[0]
              const todayStats = stats?.find(s => s.date === today)
              
              if (todayStats) {
                setStats(stats.map(s => 
                  s.date === today 
                    ? { 
                        ...s, 
                        completedPomodoros: s.completedPomodoros + 1,
                        totalFocusTime: s.totalFocusTime + workDuration
                      }
                    : s
                ))
              } else {
                setStats([...(stats || []), {
                  date: today,
                  completedPomodoros: 1,
                  totalFocusTime: workDuration
                }])
              }
            }
            
            // Reset timer for next phase
            return newPhase === 'work' ? workDuration * 60 : breakDuration * 60
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, phase, workDuration, breakDuration, stats])

  const toggleTimer = () => {
    setStatus(status === 'running' ? 'paused' : 'running')
  }

  const resetTimer = () => {
    setStatus('idle')
    setPhase('work')
    setTimeLeft(workDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = 1 - (timeLeft / (phase === 'work' ? workDuration * 60 : breakDuration * 60))

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="relative aspect-square mb-8">
          {/* Circular progress */}
          <svg className="w-full h-full -rotate-90 transform">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-slate-100 fill-none"
              strokeWidth="5%"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className={`${
                phase === 'work' ? 'stroke-blue-500' : 'stroke-green-500'
              } fill-none transition-all duration-300`}
              strokeWidth="5%"
              strokeDasharray={`${progress * 283} 283`}
            />
          </svg>
          
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-slate-700 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className={`text-lg font-medium ${
              phase === 'work' ? 'text-blue-500' : 'text-green-500'
            }`}>
              {phase === 'work' ? 'Focus Time' : 'Break Time'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleTimer}
            className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {status === 'running' ? (
              <Pause className="w-6 h-6 text-slate-700" />
            ) : (
              <Play className="w-6 h-6 text-slate-700" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-6 h-6 text-slate-700" />
          </button>
          
          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {isSoundOn ? (
              <Volume2 className="w-6 h-6 text-slate-700" />
            ) : (
              <VolumeX className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-slate-700 font-medium mb-2">Today's Progress</h3>
          <div className="flex justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-700">
                {stats?.find(s => s.date === new Date().toISOString().split('T')[0])?.completedPomodoros || 0}
              </div>
              <div className="text-sm text-slate-500">Pomodoros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-700">
                {Math.round((stats?.find(s => s.date === new Date().toISOString().split('T')[0])?.totalFocusTime || 0) / 60)}h
              </div>
              <div className="text-sm text-slate-500">Focus Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App