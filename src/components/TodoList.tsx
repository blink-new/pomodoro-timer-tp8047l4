
import { Plus, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { TodoListProps, Todo } from '../types'

interface ExtendedTodoListProps extends TodoListProps {
  onAddTodo: (text: string) => void
}

export function TodoList({
  todos,
  selectedTodoId,
  onTodoSelect,
  onTodoComplete,
  onTodoDelete,
  onPomodorosAdjust,
  onAddTodo
}: ExtendedTodoListProps) {
  const [newTodo, setNewTodo] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    onAddTodo(newTodo)
    setNewTodo('')
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col max-w-2xl bg-white">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Tasks</h2>
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            maxLength={100}
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
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onTodoComplete(todo.id)}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    todo.completed ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>
                
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onTodoSelect(todo.id)}
                >
                  <div 
                    className={`font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                    title={todo.text}
                  >
                    <div className="line-clamp-2">{todo.text}</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {todo.completedPomodoros}/{todo.estimatedPomodoros} pomodoros
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex bg-slate-100 rounded-lg">
                    <button
                      onClick={() => onPomodorosAdjust(todo.id, -1)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-l-lg transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPomodorosAdjust(todo.id, 1)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-r-lg transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => onTodoDelete(todo.id)}
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
    </div>
  )
}