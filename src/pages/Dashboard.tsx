import { useEffect, useState } from 'react'
import PageLoader from '../components/PageLoader/PageLoader'
import {
  MdPeople, MdLandscape, MdBarChart, MdWarning,
} from 'react-icons/md'
import { TbPlant2 } from 'react-icons/tb'
import { MdLocationOn } from 'react-icons/md'
import StatCard from '../components/shared/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { farmersAPI, fieldsAPI, alertsAPI, usersAPI } from '../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const [farmers, setFarmers]   = useState<any[]>([])
  const [alerts, setAlerts]     = useState<any[]>([])
  const [fields, setFields]     = useState<any[]>([])
  const [users, setUsers]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [f, a, fi, u] = await Promise.all([
          farmersAPI.getAll(),
          alertsAPI.getAll(),
          fieldsAPI.getAll(),
          usersAPI.getAll(),
        ])
        setFarmers(f.farmers  || [])
        setAlerts(a.alerts    || [])
        setFields(fi.fields   || [])
        setUsers(u.users      || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const criticalAlerts  = alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  const totalArea       = farmers.reduce((sum, f) => sum + (f.area || 0), 0)

  const cropDistribution = ['Maize', 'Cassava', 'Tomato', 'Pepper'].map(crop => ({
    crop,
    count:   farmers.filter(f => f.crop === crop).length,
    percent: farmers.length > 0
      ? Math.round((farmers.filter(f => f.crop === crop).length / farmers.length) * 100)
      : 0,
    color: crop === 'Maize' ? '#A8D832' : crop === 'Cassava' ? '#2D6A35' : crop === 'Tomato' ? '#E05A2B' : '#E9A323',
  }))

  if (loading) return <PageLoader />

  return (
    <div className="dashboard">

      {/* Stat Cards */}
      <div className="dashboard-stats">
        <StatCard
          icon={<MdPeople size={20} color="#A8D832" />}
          label="Total Farmers"
          value={farmers.length.toLocaleString()}
          sub={`${users.filter(u => u.role === 'farmer').length} registered`}
          subType="up"
        />
        <StatCard
          icon={<MdLandscape size={20} color="#A8D832" />}
          label="Active Fields"
          value={fields.length.toLocaleString()}
          sub={`${fields.filter(f => f.status === 'active').length} operational`}
          subType="up"
        />
        <StatCard
          icon={<MdBarChart size={20} color="#A8D832" />}
          label="Total Area (ha)"
          value={totalArea > 1000 ? (totalArea / 1000).toFixed(1) + 'K' : totalArea.toString()}
          sub="across Akure"
          subType="neutral"
        />
        <StatCard
          icon={<MdWarning size={20} color={criticalAlerts > 0 ? '#C0392B' : '#A8D832'} />}
          label="Alerts Today"
          value={unresolvedAlerts}
          sub={`${criticalAlerts} critical`}
          subType={criticalAlerts > 0 ? 'down' : 'neutral'}
        />
      </div>

      {/* Middle Row */}
      <div className="dashboard-mid">

        {/* Farmer Activity Table */}
        <div className="dash-card">
          <p className="dash-card-title">Farmer activity</p>
          {farmers.length === 0 ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 14, padding: '20px 0' }}>
              No farmers registered yet
            </p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Location</th>
                  <th>Crop</th>
                  <th>NDVI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {farmers.slice(0, 6).map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>
                      <div className="cell-with-icon">
                        <MdLocationOn size={13} className="cell-icon" />
                        {f.location}
                      </div>
                    </td>
                    <td>
                      <div className="cell-with-icon">
                        <TbPlant2 size={13} className="cell-icon" />
                        {f.crop || '—'}
                      </div>
                    </td>
                    <td>{f.ndvi > 0 ? f.ndvi.toFixed(2) : '—'}</td>
                    <td><StatusBadge status={f.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="dashboard-right">

          {/* Crop Distribution */}
          <div className="dash-card">
            <p className="dash-card-title">Crop distribution</p>
            {farmers.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>No data yet</p>
            ) : (
              <div className="crop-bars">
                {cropDistribution.map(c => (
                  <div key={c.crop} className="crop-bar-row">
                    <span className="crop-bar-label">{c.crop}</span>
                    <div className="crop-bar-bg">
                      <div
                        className="crop-bar-fill"
                        style={{ width: `${c.percent}%`, background: c.color }}
                      />
                    </div>
                    <span className="crop-bar-val">{c.percent}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Feed */}
          <div className="dash-card">
            <p className="dash-card-title">Recent alerts</p>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>No alerts yet</p>
            ) : (
              <div className="alerts-feed">
                {alerts.slice(0, 4).map(a => (
                  <div key={a.id} className="alert-item">
                    <span className={`alert-dot ${a.severity}`} />
                    <div className="alert-body">
                      <p className="alert-text">{a.farmerName} — {a.type}</p>
                      <p className="alert-time">
                        {new Date(a.time).toLocaleTimeString('en-NG', {
                          hour: '2-digit', minute: '2-digit'
                        })} · {a.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Users summary */}
      <div className="dash-card">
        <p className="dash-card-title">Platform users</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['farmer', 'buyer', 'seller', 'admin'].map(role => (
            <div key={role} style={{
              background: 'var(--clr-lime-bg)',
              border: '1px solid var(--clr-lime-border)',
              borderRadius: 'var(--r-md)',
              padding: '14px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--clr-text)' }}>
                {users.filter(u => u.role === role).length}
              </p>
              <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4, textTransform: 'capitalize', fontWeight: 500 }}>
                {role}s
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}