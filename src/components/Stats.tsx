
import { StatsProps } from '../types'

export function Stats({ stats }: StatsProps) {
  const today = new Date().toISOString().split('T')[0]
  const todayStats = stats.find(s => s.date === today)

  return (
    <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-medium mb-4">Today's Progress</h3>
      <div className="flex justify-between">
        <div>
          <div className="text-3xl font-bold mb-1">
            {todayStats?.completedPomodoros || 0}
          </div>
          <div className="text-sm text-slate-400">Pomodoros</div>
        </div>
        <div className="h-12 w-px bg-slate-700"></div>
        <div>
          <div className="text-3xl font-bold mb-1">
            {Math.round((todayStats?.totalFocusTime || 0) / 60)}h
          </div>
          <div className="text-sm text-slate-400">Focus Time</div>
        </div>
      </div>
    </div>
  )
}