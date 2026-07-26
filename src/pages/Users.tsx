import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PageLoader from '../components/PageLoader/PageLoader'
import {
  MdPersonAdd, MdPeople, MdAdminPanelSettings,
  MdShoppingCart, MdStorefront, MdOpenInNew,
  MdEmail, MdCalendarToday, MdClose,
} from 'react-icons/md'
import { TbTractor } from 'react-icons/tb'
import SearchBar from '../components/shared/SearchBar'
import FilterBar from '../components/shared/FilterBar'
import StatusBadge from '../components/ui/StatusBadge'
import { usersAPI } from '../services/api'
import './Users.css'

type User = {
  id:        string
  name:      string
  email:     string
  phone?:    string
  role:      string
  status:    string
  location?: string
  createdAt: string
}

function RoleIcon({ role }: { role: string }) {
  if (role === 'admin')  return <MdAdminPanelSettings size={14} className="role-icon admin"  />
  if (role === 'farmer') return <TbTractor            size={14} className="role-icon farmer" />
  if (role === 'buyer')  return <MdShoppingCart       size={14} className="role-icon buyer"  />
  if (role === 'seller') return <MdStorefront         size={14} className="role-icon seller" />
  return null
}

const emptyForm = {
  name:   '',
  email:  '',
  role:   'farmer',
  status: 'active',
}

export default function Users() {
  const [userList, setUserList]           = useState<User[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [roleFilter, setRoleFilter]       = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [selected, setSelected]           = useState<User | null>(null)
  const [showAddModal, setShowAddModal]   = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [form, setForm]                   = useState(emptyForm)
  const [formError, setFormError]         = useState('')

  useEffect(() => {
    usersAPI.getAll()
      .then(data => setUserList(data.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const anyOpen = showAddModal || showDetailModal
    document.body.style.overflow = anyOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showAddModal, showDetailModal])

  const roleOptions = [
    { label: 'Admin',  value: 'admin'  },
    { label: 'Farmer', value: 'farmer' },
    { label: 'Buyer',  value: 'buyer'  },
    { label: 'Seller', value: 'seller' },
  ]
  const statusOptions = [
    { label: 'Active',    value: 'active'    },
    { label: 'Suspended', value: 'suspended' },
  ]

  const filtered = useMemo(() => {
    return userList.filter(u => {
      const q = search.toLowerCase()
      return (
        (u.name.toLowerCase().includes(q)  ||
         u.email.toLowerCase().includes(q) ||
         u.role.toLowerCase().includes(q)) &&
        (roleFilter   ? u.role   === roleFilter   : true) &&
        (statusFilter ? u.status === statusFilter : true)
      )
    })
  }, [search, roleFilter, statusFilter, userList])

  const totalAdmins  = userList.filter(u => u.role === 'admin').length
  const totalFarmers = userList.filter(u => u.role === 'farmer').length
  const totalBuyers  = userList.filter(u => u.role === 'buyer').length
  const totalSellers = userList.filter(u => u.role === 'seller').length

  function openDetail(e: React.MouseEvent, user: User) {
    e.stopPropagation()
    setSelected(user)
    setShowDetailModal(true)
  }

  function closeDetail() {
    setSelected(null)
    setShowDetailModal(false)
  }

  async function toggleSuspend(id: string) {
    const user = userList.find(u => u.id === id)
    if (!user) return
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    try {
      await usersAPI.updateStatus(id, newStatus as 'active' | 'suspended')
      setUserList(prev => prev.map(u =>
        u.id === id ? { ...u, status: newStatus } : u
      ))
      setSelected(prev =>
        prev?.id === id ? { ...prev, status: newStatus } : prev
      )
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleAddUser() {
    if (!form.name.trim())  return setFormError('Name is required')
    if (!form.email.trim()) return setFormError('Email is required')
    if (!form.email.includes('@')) return setFormError('Enter a valid email')

    try {
      const data = await usersAPI.add({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: 'AgroFlow@2026',
        role:     form.role,
      })
      setUserList(prev => [data.user, ...prev])
      setForm(emptyForm)
      setFormError('')
      setShowAddModal(false)
    } catch (err: any) {
      setFormError(err.message)
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

 if (loading) return <PageLoader />

  return (
    <div className="users-page">

      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">{userList.length} total users across all roles</p>
        </div>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          <MdPersonAdd size={18} /> Add User
        </button>
      </div>

      <div className="users-summary">
        <div className="user-summary-card">
          <div className="usc-icon admin"><MdAdminPanelSettings size={20} /></div>
          <div><p className="usc-val">{totalAdmins}</p><p className="usc-label">Admins</p></div>
        </div>
        <div className="user-summary-card">
          <div className="usc-icon farmer"><TbTractor size={20} /></div>
          <div><p className="usc-val">{totalFarmers}</p><p className="usc-label">Farmers</p></div>
        </div>
        <div className="user-summary-card">
          <div className="usc-icon buyer"><MdShoppingCart size={20} /></div>
          <div><p className="usc-val">{totalBuyers}</p><p className="usc-label">Buyers</p></div>
        </div>
        <div className="user-summary-card">
          <div className="usc-icon seller"><MdStorefront size={20} /></div>
          <div><p className="usc-val">{totalSellers}</p><p className="usc-label">Sellers</p></div>
        </div>
      </div>

      <div className="users-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, role..." />
        <FilterBar
          filters={[
            { key: 'role',   label: 'Role',   options: roleOptions,   value: roleFilter,   onChange: setRoleFilter   },
            { key: 'status', label: 'Status', options: statusOptions, value: statusFilter, onChange: setStatusFilter },
          ]}
        />
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="users-empty">
                  <MdPeople size={36} />
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="users-row" onClick={e => openDetail(e, u)}>
                  <td>
                    <div className="farmer-name-cell">
                      <div className={`user-avatar ${u.role}`}>{getInitials(u.name)}</div>
                      <div>
                        <p className="farmer-name">{u.name}</p>
                        <p className="farmer-id">{u.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MdEmail size={14} className="cell-icon" />
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <div className="role-cell">
                      <RoleIcon role={u.role} />
                      <span className={`role-label ${u.role}`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MdCalendarToday size={13} className="cell-icon" />
                      {new Date(u.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td><StatusBadge status={u.status as any} /></td>
                  <td>
                    <div className="users-actions">
                      <button className="view-btn" onClick={e => openDetail(e, u)}>
                        <MdOpenInNew size={14} /> View
                      </button>
                      <button
                        className={`resolve-btn ${u.status === 'active' ? 'unresolve' : 'resolve'}`}
                        onClick={e => { e.stopPropagation(); toggleSuspend(u.id) }}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selected && createPortal(
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="user-modal" onClick={e => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3 className="user-modal-title">User Details</h3>
              <button className="alert-modal-close" onClick={closeDetail}>
                <MdClose size={18} />
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-detail-profile">
                <div className={`user-detail-avatar ${selected.role}`}>
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h3 className="farmer-detail-name">{selected.name}</h3>
                  <p className="farmer-detail-id">{selected.id.slice(0, 8)}</p>
                  <div className="user-detail-badges">
                    <span className={`role-label ${selected.role}`}>
                      <RoleIcon role={selected.role} />
                      {selected.role.charAt(0).toUpperCase() + selected.role.slice(1)}
                    </span>
                    <StatusBadge status={selected.status as any} />
                  </div>
                </div>
              </div>

              <div className="fd-info-list">
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdEmail size={15} /> Email</span>
                  <span className="fd-info-val">{selected.email}</span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><MdCalendarToday size={15} /> Joined</span>
                  <span className="fd-info-val">
                    {new Date(selected.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="fd-info-row">
                  <span className="fd-info-label"><RoleIcon role={selected.role} /> Role</span>
                  <span className="fd-info-val">
                    {selected.role.charAt(0).toUpperCase() + selected.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="fd-actions">
                <button
                  className={`fd-btn ${selected.status === 'active' ? 'danger' : 'primary'}`}
                  onClick={() => toggleSuspend(selected.id)}
                >
                  {selected.status === 'active' ? 'Suspend Account' : 'Reinstate Account'}
                </button>
                <button className="fd-btn secondary" onClick={closeDetail}>Close</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add User Modal */}
      {showAddModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="user-modal" onClick={e => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3 className="user-modal-title">Add New User</h3>
              <button className="alert-modal-close" onClick={() => setShowAddModal(false)}>
                <MdClose size={18} />
              </button>
            </div>
            <div className="user-modal-body">
              <div className="add-user-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. James Okafor"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="e.g. james@gmail.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="farmer">Farmer</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
                  Default password: <strong>AgroFlow@2026</strong> — user can change after login
                </p>
                {formError && <p className="form-error">{formError}</p>}
                <div className="fd-actions" style={{ marginTop: '8px' }}>
                  <button className="fd-btn primary" onClick={handleAddUser}>Add User</button>
                  <button
                    className="fd-btn secondary"
                    onClick={() => { setShowAddModal(false); setForm(emptyForm); setFormError('') }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}