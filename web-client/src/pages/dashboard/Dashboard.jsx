import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../../api'
import { PackageOpen, Truck, History, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../services/AuthContext'

function StatCard({ icon: Icon, label, count, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:border-gray-700 transition-all hover:bg-gray-800/50 w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">View all →</span>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{count ?? '—'}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </button>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: res } = await dashboardAPI.getSummary()
      setData(res)
    } catch {
      setError('Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Welcome, <span className="text-gray-300">{user?.username}</span></span>
          <button onClick={fetchData} className="btn-secondary flex items-center gap-1.5 py-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={PackageOpen}
          label="Receipts"
          count={loading ? null : data?.pending_receipts ?? 0}
          sub={`${data?.pending_receipts ?? 0} operations pending`}
          color="bg-blue-600/20 text-blue-400"
          onClick={() => navigate('/receipts')}
        />
        <StatCard
          icon={Truck}
          label="Deliveries"
          count={loading ? null : data?.pending_deliveries ?? 0}
          sub={`${data?.pending_deliveries ?? 0} operations pending`}
          color="bg-emerald-600/20 text-emerald-400"
          onClick={() => navigate('/deliveries')}
        />
        <StatCard
          icon={History}
          label="Move History"
          count={loading ? null : data?.total_moves_today ?? 0}
          sub="moves today"
          color="bg-purple-600/20 text-purple-400"
          onClick={() => navigate('/move-history')}
        />
      </div>

      {/* Info panel */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-300">Operations Schedule</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Lots schedule date = today's date</p>
          <p>• Operations schedule date = today's date</p>
          <p>• Picking: waiting for the checks</p>
        </div>
      </div>
    </div>
  )
}