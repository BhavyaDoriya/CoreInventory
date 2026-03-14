import { useState, useEffect } from 'react'
import { stockAPI } from '../../api'
import { Search, AlertCircle, RefreshCw, Edit2, Check, X } from 'lucide-react'

function EditableQty({ entry, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(entry.on_hand)

  const save = async () => {
    try {
      await stockAPI.updateStock(entry.id, { on_hand: Number(val) })
      onSave()
      setEditing(false)
    } catch { alert('Failed to update stock') }
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        className="input w-20 py-1 text-xs"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
      />
      <button onClick={save} className="text-emerald-400 hover:text-emerald-300"><Check size={13} /></button>
      <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-300"><X size={13} /></button>
    </div>
  )

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-gray-200">{entry.on_hand}</span>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 transition-all"
      >
        <Edit2 size={11} />
      </button>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [pRes, sRes] = await Promise.all([
        stockAPI.getProducts(),
        stockAPI.getStockEntries(),
      ])
      setProducts(pRes.data.results || pRes.data)
      setStock(sRes.data.results || sRes.data)
    } catch {
      setError('Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Merge product + stock entry
  const merged = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    .map(p => {
      const entry = stock.find(s => s.product === p.id) || {}
      return { ...p, entry }
    })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Products and inventory levels</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-1.5 py-1.5">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 text-xs text-gray-500">
          User can update the stock from here
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Per Unit Cost</th>
              <th className="text-left px-4 py-3">On Hand</th>
              <th className="text-left px-4 py-3">Free to Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-600">Loading...</td></tr>
            ) : merged.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-600">No products found</td></tr>
            ) : merged.map((p) => (
              <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-200 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                <td className="px-4 py-3 text-gray-300">₹{p.unit_cost ?? '—'}</td>
                <td className="px-4 py-3">
                  {p.entry?.id
                    ? <EditableQty entry={p.entry} onSave={fetchData} />
                    : <span className="text-gray-600">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-gray-300">{p.entry?.free_to_use ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}