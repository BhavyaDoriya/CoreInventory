import { useState, useEffect } from 'react'
import { movesAPI } from '../../api'
import { Search, AlertCircle, RefreshCw } from 'lucide-react'

const STATUS_BADGE = {
  draft:     <span className="badge-draft">Draft</span>,
  ready:     <span className="badge-ready">Ready</span>,
  done:      <span className="badge-done">Done</span>,
  cancelled: <span className="badge-cancelled">Cancelled</span>,
}

export default function MoveHistory() {
  const [moves, setMoves] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMoves = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await movesAPI.getAll({ search })
      setMoves(data.results || data)
    } catch {
      setError('Failed to load move history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMoves() }, [])

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Move History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stock movements between locations</p>
        </div>
        <button onClick={fetchMoves} className="btn-secondary flex items-center gap-1.5 py-1.5">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchMoves() }} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by reference or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Reference</th>
              <th className="text-left px-4 py-3">From</th>
              <th className="text-left px-4 py-3">To</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Qty</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-600">Loading...</td></tr>
            ) : moves.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-600">No moves found</td></tr>
            ) : moves.map((m) => (
              <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-emerald-400 font-medium">{m.reference}</td>
                <td className="px-4 py-3 text-gray-400">{m.from_location || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{m.to_location || '—'}</td>
                <td className="px-4 py-3 text-gray-200">{m.product_name}</td>
                <td className="px-4 py-3 text-gray-300">{m.quantity}</td>
                <td className="px-4 py-3">{STATUS_BADGE[m.status] || m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}