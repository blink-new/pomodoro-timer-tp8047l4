
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
            const newPhase = phase === 'work' ? 'break' : 'work'
            setPhase(newPhase)
            
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left side - Timer */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-12 flex flex-col items-center justify-center border-r border-slate-100">
          <div className="relative aspect-square w-full max-w-lg">
            {/* Circular progress */}
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-slate-100 fill-none"
                strokeWidth="4%"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className={`${
                  phase === 'work' ? 'stroke-blue-500' : 'stroke-emerald-500'
                } fill-none transition-all duration-300 ease-in-out`}
                strokeWidth="4%"
                strokeDasharray={`${progress * 283} 283`}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))'
                }}
              />
            </svg>
            
            {/* Timer display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                {formatTime(timeLeft)}
              </div>
              <div className={`text-2xl font-medium mb-2 ${
                phase === 'work' ? 'text-blue-500' : 'text-emerald-500'
              }`}>
                {phase === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
              {selectedTodoId && (
                <div className="text-base text-slate-500 max-w-sm text-center">
                  {todos.find(t => t.id === selectedTodoId)?.text}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-6 mt-12">
            <button
              onClick={toggleTimer}
              className={`p-5 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                !selectedTodoId && status !== 'running'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {status === 'running' ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-5 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-8 h-8 text-slate-700" />
            </button>
            
            <button
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-5 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 transform hover:scale-105"
            >
              {isSoundOn ? (
                <Volume2 className="w-8 h-8 text-slate-700" />
              ) : (
                <VolumeX className="w-8 h-8 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Right side - Todo List and Stats */}
        <div className="flex-1 p-8 flex flex-col max-w-2xl bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Tasks</h2>
            <form onSubmit={addTodo} className="flex gap-3 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedTodoId === todo.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 hover:border-slate-200'
                  } ${
                    todo.completed ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTodoComplete(todo.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        todo.completed ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedTodoId(todo.id)}
                    >
                      <div className={`font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {todo.text}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {todo.completedPomodoros}/{todo.estimatedPomodoros} pomodoros
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-100 rounded-lg">
                        <button
                          onClick={() => adjustPomodoros(todo.id, -1)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-l-lg transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => adjustPomodoros(todo.id, 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-r-lg transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-medium mb-4">Today's Progress</h3>
            <div className="flex justify-between">
              <div>
                <div className="text-3xl font-bold mb-1">
                  {stats?.find(s => s.date === new Date().toISOString().split('T')[0])?.completedPomodoros || 0}
                </div>
                <div className="text-sm text-slate-400">Pomodoros</div>
              </div>
              <div className="h-12 w-px bg-slate-700"></div>
              <div>
                <div className="text-3xl font-bold mb-1">
                  {Math.round((stats?.find(s => s.date === new Date().toISOString().split('T')[0])?.totalFocusTime || 0) / 60)}h
                </div>
                <div className="text-sm text-slate-400">Focus Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App