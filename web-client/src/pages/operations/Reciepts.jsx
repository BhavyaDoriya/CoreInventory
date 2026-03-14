import { useState, useEffect } from 'react'
import { receiptsAPI } from '../../api'
import { Search, Plus, CheckCircle, XCircle, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react'

const STATUS_BADGE = {
  draft:     <span className="badge-draft">Draft</span>,
  ready:     <span className="badge-ready">Ready</span>,
  done:      <span className="badge-done">Done</span>,
  cancelled: <span className="badge-cancelled">Cancelled</span>,
}

function ReceiptDetail({ receipt, onBack, onAction }) {
  const [loading, setLoading] = useState(false)

  const act = async (fn) => {
    setLoading(true)
    try { await fn(receipt.id); onAction() }
    catch (e) { alert(e.response?.data?.detail || 'Action failed') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 mb-5 transition-colors">
        <ChevronLeft size={15} /> Back to Receipts
      </button>

      <div className="card p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-white">{receipt.reference}</h2>
              {STATUS_BADGE[receipt.status]}
            </div>
            <p className="text-sm text-gray-500">Receipt #{receipt.id}</p>
          </div>
          <div className="flex gap-2">
            {(receipt.status === 'draft' || receipt.status === 'ready') && (
              <>
                <button onClick={() => act(receiptsAPI.validate)} disabled={loading} className="btn-primary flex items-center gap-1.5">
                  <CheckCircle size={14} /> Validate
                </button>
                <button onClick={() => act(receiptsAPI.cancel)} disabled={loading} className="btn-danger flex items-center gap-1.5">
                  <XCircle size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
            <p className="text-gray-200">{receipt.vendor_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Deadline</p>
            <p className="text-gray-200">{receipt.deadline || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Responsible</p>
            <p className="text-gray-200">{receipt.responsible_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Scheduled Date</p>
            <p className="text-gray-200">{receipt.scheduled_date || '—'}</p>
          </div>
        </div>

        {/* Lines */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Products</p>
          <div className="divide-y divide-gray-800">
            {(receipt.lines || []).map((line, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <span className="text-gray-200">{line.product_name}</span>
                <span className="text-gray-400">{line.quantity} units</span>
              </div>
            ))}
            {!receipt.lines?.length && (
              <p className="text-gray-600 py-3 text-sm">No product lines</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchReceipts = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await receiptsAPI.getAll({ search })
      setReceipts(data.results || data)
    } catch {
      setError('Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReceipts() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchReceipts()
  }

  const openDetail = async (id) => {
    try {
      const { data } = await receiptsAPI.getOne(id)
      setSelected(data)
    } catch { alert('Could not load receipt') }
  }

  if (selected) return (
    <div className="p-6 max-w-3xl">
      <ReceiptDetail
        receipt={selected}
        onBack={() => { setSelected(null); fetchReceipts() }}
        onAction={() => receiptsAPI.getOne(selected.id).then(r => setSelected(r.data))}
      />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Receipts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Incoming stock operations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReceipts} className="btn-secondary flex items-center gap-1.5 py-1.5">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> New Receipt
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by reference or vendor..."
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

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Reference</th>
              <th className="text-left px-4 py-3">Vendor</th>
              <th className="text-left px-4 py-3">Deadline</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-600">Loading...</td></tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-600">No receipts found</td></tr>
            ) : receipts.map((r) => (
              <tr
                key={r.id}
                onClick={() => openDetail(r.id)}
                className="hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-emerald-400 font-medium">{r.reference}</td>
                <td className="px-4 py-3 text-gray-300">{r.vendor_name || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{r.deadline || '—'}</td>
                <td className="px-4 py-3">{STATUS_BADGE[r.status] || r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}