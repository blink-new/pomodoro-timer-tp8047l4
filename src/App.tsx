
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useLocalStorage } from 'react-use'
import './App.css'

// ... keep existing types ...

function App() {
  // ... keep existing state and effects ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Timer */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <div className="relative aspect-square w-full max-w-lg">
            {/* ... keep existing timer SVG and display ... */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                {formatTime(timeLeft)}
              </div>
              <div className={`text-xl md:text-2xl font-medium mb-2 ${
                phase === 'work' ? 'text-blue-500' : 'text-emerald-500'
              }`}>
                {phase === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
              {selectedTodoId && (
                <div className="text-base text-slate-500 max-w-[280px] md:max-w-sm text-center px-4">
                  <div className="truncate">
                    {todos.find(t => t.id === selectedTodoId)?.text}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ... keep existing controls ... */}
        </div>

        {/* Right side - Todo List and Stats */}
        <div className="flex-1 p-6 md:p-8 flex flex-col max-w-2xl bg-white">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Tasks</h2>
            <form onSubmit={addTodo} className="flex gap-3 mb-6">
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
                      onClick={() => toggleTodoComplete(todo.id)}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        todo.completed ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedTodoId(todo.id)}
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