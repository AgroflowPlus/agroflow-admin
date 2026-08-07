import { useEffect, useState } from 'react'
import PageLoader from '../components/PageLoader/PageLoader'
import {
  MdPeople, MdShoppingBag, MdWarning, MdStorefront,
} from 'react-icons/md'
import { MdLocationOn } from 'react-icons/md'
import StatCard from '../components/shared/StatCard'
import { usersAPI, alertsAPI, adminAPI } from '../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const [users, setUsers]       = useState<any[]>([])
  const [alerts, setAlerts]     = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, a, l] = await Promise.all([
          usersAPI.getAll(),
          alertsAPI.getAll(),
          adminAPI.getListings(),
        ])
        setUsers(u.users || [])
        setAlerts(a.alerts || [])
        setListings(l.listings || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const farmers = users.filter(u => u.role === 'farmer')
  const buyers  = users.filter(u => u.role === 'buyer')
  const criticalAlerts   = alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length
  const activeListings   = listings.filter(l => l.status === 'available' || l.status === 'partial')

  if (loading) return <PageLoader />

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="dashboard-stats">
        <StatCard
          icon={<MdPeople size={20} color="#A8D832" />}
          label="Total Farmers"
          value={farmers.length.toLocaleString()}
          sub="registered"
          subType="neutral"
        />
        <StatCard
          icon={<MdShoppingBag size={20} color="#A8D832" />}
          label="Total Buyers"
          value={buyers.length.toLocaleString()}
          sub="registered"
          subType="neutral"
        />
        <StatCard
          icon={<MdStorefront size={20} color="#A8D832" />}
          label="Active Listings"
          value={activeListings.length.toLocaleString()}
          sub={`${listings.length} total`}
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
        {/* Recent Listings */}
        <div className="dash-card">
          <p className="dash-card-title">Recent listings</p>
          {listings.length === 0 ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 14, padding: '20px 0' }}>
              No listings yet
            </p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Crop</th>
                  <th>Location</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.slice(0, 6).map((l: any) => (
                  <tr key={l.id}>
                    <td>{l.sellerName || l.seller?.user?.name || '—'}</td>
                    <td>{l.cropType}</td>
                    <td>
                      <div className="cell-with-icon">
                        <MdLocationOn size={13} className="cell-icon" />
                        {l.location}
                      </div>
                    </td>
                    <td>{l.remainingQty ?? l.quantity}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alerts Feed */}
        <div className="dashboard-right">
          <div className="dash-card">
            <p className="dash-card-title">Recent alerts</p>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 14 }}>No alerts yet</p>
            ) : (
              <div className="alerts-feed">
                {alerts.slice(0, 6).map((a: any) => (
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {['farmer', 'buyer'].map(role => (
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