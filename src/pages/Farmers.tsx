import { useState, useMemo, useEffect } from 'react'
import {
  MdPeople, MdPhone, MdLocationOn,
  MdGrass, MdBarChart, MdOpenInNew,
  MdLandscape,
} from 'react-icons/md'
import { TbPlant2 } from 'react-icons/tb'
import SearchBar from '../components/shared/SearchBar'
import FilterBar from '../components/shared/FilterBar'
import StatusBadge from '../components/ui/StatusBadge'
import Drawer from '../components/shared/Drawer'
import PageLoader from '../components/PageLoader/PageLoader'
import { farmersAPI, crops, locations } from '../services/api'
import './Farmers.css'

type Farmer = {
  id:       string
  userId:   string
  name:     string
  email:    string
  phone:    string | null
  location: string
  status:   string
  fields:   number
  area:     number
  ndvi:     number
  crop?:    string
}

export default function Farmers() {
  const [farmerList, setFarmerList]     = useState<Farmer[]>([])
  const [loading, setLoading]           = useState(true)
  const [apiError, setApiError]         = useState('')
  const [search, setSearch]             = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [cropFilter, setCropFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected]         = useState<Farmer | null>(null)
  const [sortKey, setSortKey]           = useState<keyof Farmer>('name')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    farmersAPI.getAll()
      .then(data => setFarmerList(data.farmers || []))
      .catch(err => setApiError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const locationOptions = locations.map((l: string) => ({ label: l, value: l }))
  const cropOptions     = crops.map((c: string) => ({ label: c, value: c }))
  const statusOptions   = [
    { label: 'Active',    value: 'active'    },
    { label: 'Warning',   value: 'warning'   },
    { label: 'Suspended', value: 'suspended' },
  ]

  const filtered = useMemo(() => {
    return farmerList
      .filter(f => {
        const q = search.toLowerCase()
        return (
          (f.name.toLowerCase().includes(q) ||
           f.location.toLowerCase().includes(q) ||
           (f.crop || '').toLowerCase().includes(q)) &&
          (locationFilter ? f.location === locationFilter : true) &&
          (cropFilter     ? f.crop     === cropFilter     : true) &&
          (statusFilter   ? f.status   === statusFilter   : true)
        )
      })
      .sort((a, b) => {
        const av = a[sortKey] ?? ''
        const bv = b[sortKey] ?? ''
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ?  1 : -1
        return 0
      })
  }, [search, locationFilter, cropFilter, statusFilter, sortKey, sortDir, farmerList])

  function handleSort(key: keyof Farmer) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: keyof Farmer }) {
    if (sortKey !== col) return <span className="sort-icon inactive">↕</span>
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  async function handleSuspend(farmer: Farmer) {
    const newStatus = farmer.status === 'active' ? 'suspended' : 'active'
    try {
      await farmersAPI.updateStatus(farmer.id, newStatus as 'active' | 'suspended')
      setFarmerList(prev => prev.map(f =>
        f.id === farmer.id ? { ...f, status: newStatus } : f
      ))
      setSelected(prev => prev?.id === farmer.id ? { ...prev, status: newStatus } : prev)
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <PageLoader />

  if (apiError) return (
    <div style={{ padding: '40px', color: '#C0392B', fontSize: 15 }}>
      Error: {apiError}
    </div>
  )

  return (
    <div className="farmers-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">All Farmers</h2>
          <p className="page-subtitle">{filtered.length} farmers found</p>
        </div>
      </div>

      <div className="farmers-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search farmers, location, crop..."
        />
        <FilterBar
          filters={[
            { key: 'location', label: 'Location', options: locationOptions, value: locationFilter, onChange: setLocationFilter },
            { key: 'crop',     label: 'Crop',     options: cropOptions,     value: cropFilter,     onChange: setCropFilter     },
            { key: 'status',   label: 'Status',   options: statusOptions,   value: statusFilter,   onChange: setStatusFilter   },
          ]}
        />
      </div>

      <div className="farmers-table-wrap">
        <table className="farmers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Farmer <SortIcon col="name" />
              </th>
              <th onClick={() => handleSort('location')}>
                Location <SortIcon col="location" />
              </th>
              <th onClick={() => handleSort('crop')}>
                Crop <SortIcon col="crop" />
              </th>
              <th onClick={() => handleSort('ndvi')}>
                NDVI <SortIcon col="ndvi" />
              </th>
              <th onClick={() => handleSort('area')}>
                Area (ha) <SortIcon col="area" />
              </th>
              <th onClick={() => handleSort('fields')}>
                Fields <SortIcon col="fields" />
              </th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="farmers-empty">
                  <MdPeople size={36} />
                  <p>No farmers found</p>
                </td>
              </tr>
            ) : (
              filtered.map(f => (
                <tr key={f.id} className="farmers-row" onClick={() => setSelected(f)}>
                  <td>
                    <div className="farmer-name-cell">
                      <div className="farmer-avatar">
                        {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="farmer-name">{f.name}</p>
                        <p className="farmer-id">{f.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MdLocationOn size={14} className="cell-icon" />
                      {f.location || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <TbPlant2 size={14} className="cell-icon" />
                      {f.crop || '—'}
                    </div>
                  </td>
                  <td>
                    <div className={`ndvi-pill ${f.ndvi >= 0.6 ? 'good' : f.ndvi >= 0.5 ? 'mid' : f.ndvi > 0 ? 'low' : ''}`}>
                      {f.ndvi > 0 ? f.ndvi.toFixed(2) : '—'}
                    </div>
                  </td>
                  <td className="cell-num">{f.area > 0 ? f.area.toLocaleString() : '—'}</td>
                  <td className="cell-num">{f.fields}</td>
                  <td><StatusBadge status={f.status as any} /></td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={e => { e.stopPropagation(); setSelected(f) }}
                    >
                      <MdOpenInNew size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Farmer Details"
      >
        {selected && (
          <div className="farmer-detail">
            <div className="farmer-detail-profile">
              <div className="farmer-detail-avatar">
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="farmer-detail-name">{selected.name}</h3>
                <p className="farmer-detail-id">{selected.email}</p>
                <StatusBadge status={selected.status as any} />
              </div>
            </div>

            <div className="farmer-detail-stats">
              <div className="fd-stat">
                <MdLandscape size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.fields}</p>
                <p className="fd-stat-label">Fields</p>
              </div>
              <div className="fd-stat">
                <MdBarChart size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.area > 0 ? selected.area + ' ha' : '—'}</p>
                <p className="fd-stat-label">Total Area</p>
              </div>
              <div className="fd-stat">
                <MdGrass size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.ndvi > 0 ? selected.ndvi.toFixed(2) : '—'}</p>
                <p className="fd-stat-label">NDVI</p>
              </div>
            </div>

            <div className="farmer-detail-section">
              <p className="fd-section-title">Farm Information</p>
              <div className="fd-info-list">
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdLocationOn size={15} /> Location</span>
                  <span className="fd-info-val">{selected.location || '—'}</span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><TbPlant2 size={15} /> Primary Crop</span>
                  <span className="fd-info-val">{selected.crop || '—'}</span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdPhone size={15} /> Phone</span>
                  <span className="fd-info-val">{selected.phone || '—'}</span>
                </div>
              </div>
            </div>

            {selected.ndvi > 0 && (
              <div className="farmer-detail-section">
                <p className="fd-section-title">Crop Health (NDVI)</p>
                <div className="fd-ndvi-bar-wrap">
                  <div className="fd-ndvi-bar-bg">
                    <div
                      className="fd-ndvi-bar-fill"
                      style={{ width: `${selected.ndvi * 100}%` }}
                    />
                  </div>
                  <span className="fd-ndvi-val">{(selected.ndvi * 100).toFixed(0)}%</span>
                </div>
                <p className="fd-ndvi-note">
                  {selected.ndvi >= 0.65
                    ? 'Crop health is excellent'
                    : selected.ndvi >= 0.5
                    ? 'Crop health is moderate — monitor closely'
                    : 'Crop health is low — action required'}
                </p>
              </div>
            )}

            <div className="farmer-detail-section">
              <p className="fd-section-title">Actions</p>
              <div className="fd-actions">
                <button
                  className={`fd-btn ${selected.status === 'active' ? 'danger' : 'primary'}`}
                  onClick={() => handleSuspend(selected)}
                >
                  {selected.status === 'active' ? 'Suspend Account' : 'Reinstate Account'}
                </button>
                <button className="fd-btn secondary" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}