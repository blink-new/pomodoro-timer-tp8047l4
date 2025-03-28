
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useLocalStorage } from 'react-use'
import './App.css'

type TimerPhase = 'work' | 'break'
type TimerStatus = 'running' | 'paused' | 'idle'

interface PomodoroStats {
  completedPomodoros: number
  totalFocusTime: number
  date: string
}

interface Todo {
  id: string
  text: string
  completed: boolean
  estimatedPomodoros: number
  completedPomodoros: number
}

function App() {
  // Timer state
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isSoundOn, setIsSoundOn] = useState(false)
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  
  // Statistics
  const [stats, setStats] = useLocalStorage<PomodoroStats[]>('pomodoro-stats', [])
  
  // Todo state
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [newTodo, setNewTodo] = useState('')
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)

  useEffect(() => {
    let interval: number | null = null
    
    if (status === 'running') {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Timer completed
            const newPhase = phase === 'work' ? 'break' : 'work'
            setPhase(newPhase)
            
            // Update stats and todo if work phase completed
            if (phase === 'work') {
              const today = new Date().toISOString().split('T')[0]
              const todayStats = stats?.find(s => s.date === today)
              
              // Update stats
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

              // Update selected todo if exists
              if (selectedTodoId) {
                setTodos(todos.map(todo => 
                  todo.id === selectedTodoId
                    ? {
                        ...todo,
                        completedPomodoros: todo.completedPomodoros + 1,
                        completed: todo.completedPomodoros + 1 >= todo.estimatedPomodoros
                      }
                    : todo
                ))
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
  }, [status, phase, workDuration, breakDuration, stats, selectedTodoId, todos])

  const toggleTimer = () => {
    if (!selectedTodoId && status !== 'running') {
      // Don't start timer without a selected task
      return
    }
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

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      estimatedPomodoros: 1,
      completedPomodoros: 0
    }

    setTodos([...todos, todo])
    setNewTodo('')
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
    if (selectedTodoId === id) {
      setSelectedTodoId(null)
      if (status === 'running') {
        setStatus('paused')
      }
    }
  }

  const toggleTodoComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ))
  }

  const adjustPomodoros = (id: string, change: number) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, estimatedPomodoros: Math.max(1, todo.estimatedPomodoros + change) }
        : todo
    ))
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
            {selectedTodoId && (
              <div className="text-sm text-slate-500 mt-2">
                {todos.find(t => t.id === selectedTodoId)?.text}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleTimer}
            className={`p-4 rounded-full transition-colors ${
              !selectedTodoId && status !== 'running'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {status === 'running' ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
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

        {/* Todo List */}
        <div className="mb-6">
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {todos.map(todo => (
              <div
                key={todo.id}
                className={`p-3 rounded-lg border ${
                  selectedTodoId === todo.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200'
                } ${
                  todo.completed ? 'bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTodoComplete(todo.id)}
                    className={`p-1 rounded ${
                      todo.completed ? 'text-green-500' : 'text-slate-400'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedTodoId(todo.id)}
                  >
                    <div className={`${todo.completed ? 'line-through text-slate-500' : ''}`}>
                      {todo.text}
                    </div>
                    <div className="text-sm text-slate-500">
                      {todo.completedPomodoros}/{todo.estimatedPomodoros} pomodoros
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustPomodoros(todo.id, -1)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adjustPomodoros(todo.id, 1)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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