
export interface Todo {
  id: string
  text: string
  completed: boolean
  estimatedPomodoros: number
  completedPomodoros: number
}

export interface DailyStats {
  date: string
  completedPomodoros: number
  totalFocusTime: number
}

export interface TimerProps {
  timeLeft: number
  isRunning: boolean
  phase: 'work' | 'break'
  isMuted: boolean
  selectedTodo?: Todo | null
  onToggleTimer: () => void
  onResetTimer: () => void
  onToggleMute: () => void
}

export interface TodoListProps {
  todos: Todo[]
  selectedTodoId: string | null
  onTodoSelect: (id: string) => void
  onTodoComplete: (id: string) => void
  onTodoDelete: (id: string) => void
  onPomodorosAdjust: (id: string, change: number) => void
}

export interface StatsProps {
  stats: DailyStats[]
}