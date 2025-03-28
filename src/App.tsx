
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Check, X, Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { useLocalStorage } from 'react-use'
import './App.css'

type TimerPhase = 'work' | 'break'
type TimerStatus = 'running' | 'paused' | 'idle'

interface Todo {
  id: string
  text: string
  completed: boolean
  pomodoros: number
  completedPomodoros: number
  notes?: string
}

interface PomodoroStats {
  completedPomodoros: number
  totalFocusTime: number
  date: string
}

function App() {
  // Timer state
  const [phase, setPhase] = useState<TimerPhase>('work')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isSoundOn, setIsSoundOn] = useState(false)
  
  // Todo state
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [newTodo, setNewTodo] = useState('')
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [taskNotes, setTaskNotes] = useState('')
  const [isTaskListExpanded, setIsTaskListExpanded] = useState(true)
  
  // Settings
  const [workDuration] = useState(25)
  const [breakDuration] = useState(5)
  
  // Statistics
  const [stats, setStats] = useLocalStorage<PomodoroStats[]>('pomodoro-stats', [])

  useEffect(() => {
    if (selectedTodoId) {
      const todo = todos.find(t => t.id === selectedTodoId)
      setTaskNotes(todo?.notes || '')
    }
  }, [selectedTodoId, todos])

  useEffect(() => {
    let interval: number | null = null
    
    if (status === 'running') {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            const newPhase = phase === 'work' ? 'break' : 'work'
            setPhase(newPhase)
            
            if (phase === 'work' && selectedTodoId) {
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

              setTodos(todos.map(todo => 
                todo.id === selectedTodoId
                  ? {
                      ...todo,
                      completedPomodoros: todo.completedPomodoros + 1,
                      completed: todo.completedPomodoros + 1 >= todo.pomodoros
                    }
                  : todo
              ))
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
      pomodoros: 1,
      completedPomodoros: 0,
      notes: ''
    }

    setTodos([...todos, todo])
    setNewTodo('')
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
    if (selectedTodoId === id) {
      setSelectedTodoId(null)
      setTaskNotes('')
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
        ? { ...todo, pomodoros: Math.max(1, todo.pomodoros + change) }
        : todo
    ))
  }

  const updateTaskNotes = () => {
    if (!selectedTodoId) return
    setTodos(todos.map(todo =>
      todo.id === selectedTodoId
        ? { ...todo, notes: taskNotes }
        : todo
    ))
  }

  const selectedTask = selectedTodoId ? todos.find(t => t.id === selectedTodoId) : null
  const progress = 1 - (timeLeft / (phase === 'work' ? workDuration * 60 : breakDuration * 60))
  const incompleteTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Focus Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-0">
        <div className="w-full max-w-4xl">
          {selectedTask ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">
                  {selectedTask.text}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 px-3 py-2 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600 mr-2" />
                    <span className="text-lg font-medium text-slate-700">
                      {selectedTask.completedPomodoros}/{selectedTask.pomodoros}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleTodoComplete(selectedTask.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedTask.completed
                        ? 'bg-green-500 text-white'
                        : 'border-2 border-slate-300 hover:border-green-500'
                    }`}
                  >
                    {selectedTask.completed && <Check className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="relative aspect-square">
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
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-slate-800 mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className={`text-xl font-medium ${
                      phase === 'work' ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {phase === 'work' ? 'Focus Time' : 'Break Time'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={toggleTimer}
                      className={`flex-1 py-4 px-6 rounded-xl text-white font-medium transition-all ${
                        status === 'running'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } active:scale-95`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {status === 'running' ? (
                          <>
                            <Pause className="w-6 h-6" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-6 h-6" />
                            <span>Start Focus</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    <button
                      onClick={resetTimer}
                      className="p-4 rounded-xl bg-slate-200 hover:bg-slate-300 transition-colors active:scale-95"
                    >
                      <RotateCcw className="w-6 h-6 text-slate-700" />
                    </button>
                    
                    <button
                      onClick={() => setIsSoundOn(!isSoundOn)}
                      className="p-4 rounded-xl bg-slate-200 hover:bg-slate-300 transition-colors active:scale-95"
                    >
                      {isSoundOn ? (
                        <Volume2 className="w-6 h-6 text-slate-700" />
                      ) : (
                        <VolumeX className="w-6 h-6 text-slate-700" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      onBlur={updateTaskNotes}
                      placeholder="Add notes for this task..."
                      className="w-full h-full min-h-[200px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-700 mb-4">Select a Task to Start Focusing</h2>
              <p className="text-slate-600">Choose a task from your list below to begin your focus session.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task List Panel */}
      <div className="relative">
        <button
          onClick={() => setIsTaskListExpanded(!isTaskListExpanded)}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full shadow-lg p-2"
        >
          {isTaskListExpanded ? (
            <ChevronDown className="w-6 h-6 text-slate-600" />
          ) : (
            <ChevronUp className="w-6 h-6 text-slate-600" />
          )}
        </button>

        <div className={`bg-white shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)] transition-all duration-300 ${
          isTaskListExpanded ? 'h-96' : 'h-16'
        }`}>
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tasks</h2>
              <div className="text-sm text-slate-600">
                {incompleteTodos.length} remaining
              </div>
            </div>

            <form onSubmit={addTodo} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </form>

            <div className="space-y-2 max-h-[calc(24rem-130px)] overflow-y-auto pr-2">
              {incompleteTodos.map(todo => (
                <div
                  key={todo.id}
                  onClick={() => setSelectedTodoId(selectedTodoId === todo.id ? null : todo.id)}
                  className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTodoId === todo.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleTodoComplete(todo.id)
                      }}
                      className="p-1.5 rounded-full border-2 border-slate-300 hover:border-green-500 transition-colors"
                    />
                    
                    <span className="flex-1 text-lg text-slate-700">
                      {todo.text}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          adjustPomodoros(todo.id, -1)
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        -
                      </button>
                      <div className="flex items-center bg-slate-100 px-2 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-500 mr-1" />
                        <span className="text-sm font-medium text-slate-700">
                          {todo.completedPomodoros}/{todo.pomodoros}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          adjustPomodoros(todo.id, 1)
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTodo(todo.id)
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {completedTodos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Completed Tasks</h3>
                  {completedTodos.map(todo => (
                    <div
                      key={todo.id}
                      className="group p-4 rounded-xl border border-slate-200 mb-2 opacity-60 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTodoComplete(todo.id)}
                          className="p-1.5 rounded-full bg-green-500 text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <span className="flex-1 text-lg text-slate-500 line-through">
                          {todo.text}
                        </span>

                        <div className="flex items-center bg-slate-100 px-2 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-slate-500 mr-1" />
                          <span className="text-sm font-medium text-slate-700">
                            {todo.completedPomodoros}/{todo.pomodoros}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App