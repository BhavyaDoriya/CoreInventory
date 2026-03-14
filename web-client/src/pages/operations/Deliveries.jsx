import { useState, useEffect } from 'react'
import { deliveriesAPI } from '../../api'
import { Search, Plus, CheckCircle, XCircle, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react'

const STATUS_BADGE = {
  draft:     <span className="badge-draft">Draft</span>,
  ready:     <span className="badge-ready">Ready</span>,
  done:      <span className="badge-done">Done</span>,
  cancelled: <span className="badge-cancelled">Cancelled</span>,
}

function DeliveryDetail({ delivery, onBack, onAction }) {
  const [loading, setLoading] = useState(false)

  const act = async (fn) => {
    setLoading(true)
    try { await fn(delivery.id); onAction() }
    catch (e) { alert(e.response?.data?.detail || 'Action failed') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 mb-5 transition-colors">
        <ChevronLeft size={15} /> Back to Deliveries
      </button>

      <div className="card p-5">
        <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-white">{delivery.reference}</h2>
              {STATUS_BADGE[delivery.status]}
            </div>
            <p className="text-sm text-gray-500">Delivery #{delivery.id}</p>
          </div>
          <div className="flex gap-2">
            {(delivery.status === 'draft' || delivery.status === 'ready') && (
              <>
                <button onClick={() => act(deliveriesAPI.validate)} disabled={loading} className="btn-primary flex items-center gap-1.5">
                  <CheckCircle size={14} /> Validate
                </button>
                <button onClick={() => act(deliveriesAPI.cancel)} disabled={loading} className="btn-danger flex items-center gap-1.5">
                  <XCircle size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Delivery Address</p>
            <p className="text-gray-200">{delivery.address || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Scheduled Date</p>
            <p className="text-gray-200">{delivery.scheduled_date || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Responsible</p>
            <p className="text-gray-200">{delivery.responsible_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Operation Type</p>
            <p className="text-gray-200">{delivery.operation_type || '—'}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Products</p>
          <div className="divide-y divide-gray-800">
            {(delivery.lines || []).map((line, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <span className="text-gray-200">{line.product_name}</span>
                <span className="text-gray-400">{line.quantity} units</span>
              </div>
            ))}
            {!delivery.lines?.length && (
              <p className="text-gray-600 py-3 text-sm">No product lines</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchDeliveries = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await deliveriesAPI.getAll({ search })
      setDeliveries(data.results || data)
    } catch {
      setError('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDeliveries() }, [])

  const openDetail = async (id) => {
    try {
      const { data } = await deliveriesAPI.getOne(id)
      setSelected(data)
    } catch { alert('Could not load delivery') }
  }

  if (selected) return (
    <div className="p-6 max-w-3xl">
      <DeliveryDetail
        delivery={selected}
        onBack={() => { setSelected(null); fetchDeliveries() }}
        onAction={() => deliveriesAPI.getOne(selected.id).then(r => setSelected(r.data))}
      />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Deliveries</h1>
          <p className="text-sm text-gray-500 mt-0.5">Outgoing stock operations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDeliveries} className="btn-secondary flex items-center gap-1.5 py-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> New Delivery
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchDeliveries() }} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by reference or contact..."
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
              <th className="text-left px-4 py-3">Address</th>
              <th className="text-left px-4 py-3">Scheduled Date</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-600">Loading...</td></tr>
            ) : deliveries.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-600">No deliveries found</td></tr>
            ) : deliveries.map((d) => (
              <tr
                key={d.id}
                onClick={() => openDetail(d.id)}
                className="hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-emerald-400 font-medium">{d.reference}</td>
                <td className="px-4 py-3 text-gray-300">{d.address || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{d.scheduled_date || '—'}</td>
                <td className="px-4 py-3">{STATUS_BADGE[d.status] || d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}