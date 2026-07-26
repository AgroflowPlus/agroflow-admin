import { useState, useMemo, useEffect } from 'react'
import PageLoader from '../components/PageLoader/PageLoader'
import {
  MdLandscape, MdLocationOn, MdWaterDrop,
  MdOpenInNew, MdAccessTime,
} from 'react-icons/md'
import { TbPlant2 } from 'react-icons/tb'
import { GiWateringCan } from 'react-icons/gi'
import SearchBar from '../components/shared/SearchBar'
import FilterBar from '../components/shared/FilterBar'
import StatusBadge from '../components/ui/StatusBadge'
import Drawer from '../components/shared/Drawer'
import { fieldsAPI, crops, locations } from '../services/api'
import './Fields.css'

type Field = {
  id:             string
  farmerId:       string
  farmerName:     string
  location:       string
  crop:           string
  area:           number
  ndvi:           number
  soilMoisture:   number
  lastIrrigation: string | null
  status:         string
  activeAlerts:   number
}

export default function Fields() {
  const [fieldList, setFieldList]           = useState<Field[]>([])
  const [loading, setLoading]               = useState(true)
  const [apiError, setApiError]             = useState('')
  const [search, setSearch]                 = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [cropFilter, setCropFilter]         = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [selected, setSelected]             = useState<Field | null>(null)
  const [sortKey, setSortKey]               = useState<keyof Field>('id')
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fieldsAPI.getAll()
      .then(data => setFieldList(data.fields || []))
      .catch(err => setApiError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const locationOptions = locations.map((l: string) => ({ label: l, value: l }))
  const cropOptions     = crops.map((c: string) => ({ label: c, value: c }))
  const statusOptions   = [
    { label: 'Active',  value: 'active'  },
    { label: 'Warning', value: 'warning' },
    { label: 'Danger',  value: 'danger'  },
  ]

  const filtered = useMemo(() => {
    return fieldList
      .filter(f => {
        const q = search.toLowerCase()
        return (
          (f.id.toLowerCase().includes(q)           ||
           f.farmerName.toLowerCase().includes(q)   ||
           f.location.toLowerCase().includes(q)     ||
           f.crop.toLowerCase().includes(q))        &&
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
  }, [search, locationFilter, cropFilter, statusFilter, sortKey, sortDir, fieldList])

  function handleSort(key: keyof Field) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: keyof Field }) {
    if (sortKey !== col) return <span className="sort-icon inactive">↕</span>
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function getMoistureClass(val: number) {
    if (val >= 60) return 'good'
    if (val >= 40) return 'mid'
    return 'low'
  }

  if (loading) return <PageLoader />

  if (apiError) return (
    <div style={{ padding: '40px', color: '#C0392B', fontSize: 15 }}>
      Error: {apiError}
    </div>
  )

  return (
    <div className="fields-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">All Fields</h2>
          <p className="page-subtitle">{filtered.length} fields found across Akure</p>
        </div>
      </div>

      <div className="fields-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search fields, farmer, location..."
        />
        <FilterBar
          filters={[
            { key: 'location', label: 'Location', options: locationOptions, value: locationFilter, onChange: setLocationFilter },
            { key: 'crop',     label: 'Crop',     options: cropOptions,     value: cropFilter,     onChange: setCropFilter     },
            { key: 'status',   label: 'Status',   options: statusOptions,   value: statusFilter,   onChange: setStatusFilter   },
          ]}
        />
      </div>

      <div className="fields-table-wrap">
        <table className="fields-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>Field ID <SortIcon col="id" /></th>
              <th onClick={() => handleSort('farmerName')}>Farmer <SortIcon col="farmerName" /></th>
              <th onClick={() => handleSort('location')}>Location <SortIcon col="location" /></th>
              <th onClick={() => handleSort('crop')}>Crop <SortIcon col="crop" /></th>
              <th onClick={() => handleSort('area')}>Area (ha) <SortIcon col="area" /></th>
              <th onClick={() => handleSort('ndvi')}>NDVI <SortIcon col="ndvi" /></th>
              <th onClick={() => handleSort('soilMoisture')}>Soil Moisture <SortIcon col="soilMoisture" /></th>
              <th>Last Irrigation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="fields-empty">
                  <MdLandscape size={36} />
                  <p>No fields found</p>
                </td>
              </tr>
            ) : (
              filtered.map(f => (
                <tr key={f.id} className="fields-row" onClick={() => setSelected(f)}>
                  <td><span className="field-id-tag">{f.id.slice(0, 8)}</span></td>
                  <td>
                    <div className="farmer-name-cell">
                      <div className="farmer-avatar">
                        {f.farmerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="farmer-name">{f.farmerName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MdLocationOn size={14} className="cell-icon" />
                      {f.location}
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <TbPlant2 size={14} className="cell-icon" />
                      {f.crop}
                    </div>
                  </td>
                  <td className="cell-num">{f.area}</td>
                  <td>
                    <div className={`ndvi-pill ${f.ndvi >= 0.6 ? 'good' : f.ndvi >= 0.5 ? 'mid' : 'low'}`}>
                      {f.ndvi.toFixed(2)}
                    </div>
                  </td>
                  <td>
                    <div className="moisture-cell">
                      <MdWaterDrop size={14} className={`moisture-icon ${getMoistureClass(f.soilMoisture)}`} />
                      <div className="moisture-bar-bg">
                        <div
                          className={`moisture-bar-fill ${getMoistureClass(f.soilMoisture)}`}
                          style={{ width: `${f.soilMoisture}%` }}
                        />
                      </div>
                      <span className="moisture-val">{f.soilMoisture}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MdAccessTime size={14} className="cell-icon" />
                      {f.lastIrrigation
                        ? new Date(f.lastIrrigation).toLocaleDateString('en-GB')
                        : '—'}
                    </div>
                  </td>
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
        title="Field Details"
      >
        {selected && (
          <div className="field-detail">
            <div className="field-detail-header">
              <div className="field-detail-icon">
                <MdLandscape size={26} />
              </div>
              <div>
                <h3 className="field-detail-id">{selected.id.slice(0, 8)}</h3>
                <p className="field-detail-farmer">Owned by {selected.farmerName}</p>
                <StatusBadge status={selected.status as any} />
              </div>
            </div>

            <div className="field-detail-stats">
              <div className="fd-stat">
                <TbPlant2 size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.crop}</p>
                <p className="fd-stat-label">Crop</p>
              </div>
              <div className="fd-stat">
                <MdLandscape size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.area} ha</p>
                <p className="fd-stat-label">Area</p>
              </div>
              <div className="fd-stat">
                <MdWaterDrop size={18} className="fd-stat-icon" />
                <p className="fd-stat-val">{selected.soilMoisture}%</p>
                <p className="fd-stat-label">Moisture</p>
              </div>
            </div>

            <div className="farmer-detail-section">
              <p className="fd-section-title">Field Information</p>
              <div className="fd-info-list">
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdLocationOn size={15} /> Location</span>
                  <span className="fd-info-val">{selected.location}</span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><TbPlant2 size={15} /> Crop</span>
                  <span className="fd-info-val">{selected.crop}</span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><GiWateringCan size={15} /> Last Irrigation</span>
                  <span className="fd-info-val">
                    {selected.lastIrrigation
                      ? new Date(selected.lastIrrigation).toLocaleDateString('en-GB')
                      : '—'}
                  </span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdAccessTime size={15} /> Active Alerts</span>
                  <span className="fd-info-val">{selected.activeAlerts}</span>
                </div>
              </div>
            </div>

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

            <div className="farmer-detail-section">
              <p className="fd-section-title">Soil Moisture</p>
              <div className="fd-ndvi-bar-wrap">
                <div className="fd-ndvi-bar-bg">
                  <div
                    className={`moisture-bar-fill ${getMoistureClass(selected.soilMoisture)}`}
                    style={{ width: `${selected.soilMoisture}%`, height: '10px', borderRadius: '999px' }}
                  />
                </div>
                <span className="fd-ndvi-val">{selected.soilMoisture}%</span>
              </div>
              <p className="fd-ndvi-note">
                {selected.soilMoisture >= 60
                  ? 'Soil moisture is adequate'
                  : selected.soilMoisture >= 40
                  ? 'Soil moisture is moderate — consider irrigation soon'
                  : 'Soil moisture is critically low — irrigate immediately'}
              </p>
            </div>

            <div className="farmer-detail-section">
              <p className="fd-section-title">Actions</p>
              <div className="fd-actions">
                <button className="fd-btn primary">Schedule Irrigation</button>
                <button className="fd-btn secondary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}