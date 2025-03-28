
import { useState, useEffect } from 'react'
import { useLocalStorage } from 'react-use'
import { Timer } from './components/Timer'
import { TodoList } from './components/TodoList'
import { Stats } from './components/Stats'
import { Todo, DailyStats } from './types'
import './App.css'

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const [isMuted, setIsMuted] = useState(false)
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [stats, setStats] = useLocalStorage<DailyStats[]>('stats', [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (!isMuted) {
        const audio = new Audio('/notification.mp3')
        audio.play()
      }
      
      if (phase === 'work') {
        setTimeLeft(5 * 60) // 5 minute break
        setPhase('break')
        
        // Update stats
        const today = new Date().toISOString().split('T')[0]
        const todayStats = stats.find(s => s.date === today)
        
        if (todayStats) {
          setStats(stats.map(s => 
            s.date === today 
              ? { ...s, completedPomodoros: s.completedPomodoros + 1, totalFocusTime: s.totalFocusTime + 25 * 60 }
              : s
          ))
        } else {
          setStats([...stats, { date: today, completedPomodoros: 1, totalFocusTime: 25 * 60 }])
        }

        // Update selected todo if exists
        if (selectedTodoId) {
          setTodos(todos.map(todo =>
            todo.id === selectedTodoId
              ? { ...todo, completedPomodoros: todo.completedPomodoros + 1 }
              : todo
          ))
        }
      } else {
        setTimeLeft(25 * 60) // 25 minute work session
        setPhase('work')
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, phase, isMuted, selectedTodoId, todos, stats])

  const handleToggleTimer = () => setIsRunning(!isRunning)
  const handleResetTimer = () => {
    setIsRunning(false)
    setTimeLeft(phase === 'work' ? 25 * 60 : 5 * 60)
  }
  const handleToggleMute = () => setIsMuted(!isMuted)

  const handleTodoComplete = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const handleTodoDelete = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
    if (selectedTodoId === id) {
      setSelectedTodoId(null)
    }
  }

  const handlePomodorosAdjust = (id: string, change: number) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, estimatedPomodoros: Math.max(1, todo.estimatedPomodoros + change) }
        : todo
    ))
  }

  const selectedTodo = todos.find(todo => todo.id === selectedTodoId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <Timer
          timeLeft={timeLeft}
          isRunning={isRunning}
          phase={phase}
          isMuted={isMuted}
          selectedTodo={selectedTodo}
          onToggleTimer={handleToggleTimer}
          onResetTimer={handleResetTimer}
          onToggleMute={handleToggleMute}
        />
        <div className="flex-1 flex flex-col">
          <TodoList
            todos={todos}
            selectedTodoId={selectedTodoId}
            onTodoSelect={setSelectedTodoId}
            onTodoComplete={handleTodoComplete}
            onTodoDelete={handleTodoDelete}
            onPomodorosAdjust={handlePomodorosAdjust}
          />
          <Stats stats={stats} />
        </div>
      </div>
    </div>
  )
}

export default App