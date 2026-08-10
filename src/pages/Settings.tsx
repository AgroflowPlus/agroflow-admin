import { useState, useRef, useEffect } from 'react'
import {
  MdPerson, MdLock, MdNotifications,
  MdEdit, MdSave, MdVisibility, MdVisibilityOff,
  MdCheckCircle, MdCamera, MdPushPin,
} from 'react-icons/md'
import { pushService } from '../services/pushService'
import { useToast } from '../context/ToastContext'
import './Settings.css'

type Tab = 'profile' | 'password' | 'notifications'

interface NotifPref {
  id: string
  label: string
  description: string
  enabled: boolean
}

const defaultNotifs: NotifPref[] = [
  { id: 'critical_alerts',   label: 'Critical Alerts',       description: 'Get notified immediately when a critical farm alert is raised',      enabled: true  },
  { id: 'warning_alerts',    label: 'Warning Alerts',        description: 'Receive warnings about NDVI drops, irrigation overdue and pest risk', enabled: true  },
  { id: 'new_farmers',       label: 'New Farmer Signups',    description: 'Be notified when a new farmer registers on the platform',            enabled: true  },
  { id: 'new_users',         label: 'New User Registrations',description: 'Get notified when any new buyer or seller joins AgroFlow+',          enabled: true  },
  { id: 'resolved_alerts',   label: 'Resolved Alerts',       description: 'Receive a summary when alerts are marked as resolved',               enabled: true  },
  { id: 'weekly_report',     label: 'Weekly Summary Report', description: 'Receive a weekly overview of all platform activity every Monday',    enabled: true  },
]

export default function Settings() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab]   = useState<Tab>('profile')
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // ── Push notification state ──────────────────────────────────────────
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  // ── Load saved notification preferences ─────────────────────────────
  const [notifs, setNotifs] = useState<NotifPref[]>(() => {
    const saved = localStorage.getItem('agf_admin_notif_prefs')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved preferences:', e)
        return defaultNotifs
      }
    }
    return defaultNotifs
  })

  // ── Check push subscription status on mount ─────────────────────────
  useEffect(() => {
    checkPushStatus()
  }, [])

  const checkPushStatus = async () => {
    try {
      const subscribed = await pushService.isSubscribed()
      setPushSubscribed(subscribed)
    } catch (error) {
      console.error('Error checking push status:', error)
    }
  }

  // ── Toggle push subscription ────────────────────────────────────────
  const togglePushSubscription = async () => {
    setPushLoading(true)
    setPushError(null)
    try {
      if (pushSubscribed) {
        const success = await pushService.unsubscribe()
        if (success) {
          setPushSubscribed(false)
          addToast('Push notifications disabled', 'info')
        } else {
          setPushError('Failed to unsubscribe from push notifications')
        }
      } else {
        const success = await pushService.subscribe()
        if (success) {
          setPushSubscribed(true)
          addToast('Push notifications enabled successfully!', 'success')
        } else {
          setPushError('Failed to subscribe to push notifications. Please check your browser settings.')
        }
      }
    } catch (error) {
      console.error('Push toggle error:', error)
      setPushError('Something went wrong. Please try again.')
    } finally {
      setPushLoading(false)
    }
  }

  // ── Profile state ────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name:     'Super Admin',
    email:    'admin@agroflow.io',
    phone:    '+234 800 000 0000',
    location: 'Akure, Ondo State',
    avatarUrl: '',
  })
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileDraft, setProfileDraft]     = useState(profile)
  const avatarRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null)

  // ── Password state ───────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false, newPass: false, confirm: false,
  })
  const [passwordError, setPasswordError] = useState('')

  function showSuccess(key: string) {
    setSaveSuccess(key)
    setTimeout(() => setSaveSuccess(null), 3000)
  }

  // ── Profile handlers ────────────────────────────────────────────────
  function handleAvatarChange(file: File | null) {
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleProfileSave() {
    setProfile({ ...profileDraft, avatarUrl: avatarPreview ?? profile.avatarUrl })
    setProfileEditing(false)
    showSuccess('profile')
    addToast('Profile updated successfully!', 'success')
  }

  function handleProfileCancel() {
    setProfileDraft(profile)
    setAvatarPreview(null)
    setProfileEditing(false)
  }

  // ── Password handlers ───────────────────────────────────────────────
  function handlePasswordSave() {
    setPasswordError('')
    if (!passwords.current)          return setPasswordError('Enter your current password')
    if (passwords.newPass.length < 6) return setPasswordError('New password must be at least 6 characters')
    if (passwords.newPass !== passwords.confirm) return setPasswordError('Passwords do not match')
    setPasswords({ current: '', newPass: '', confirm: '' })
    showSuccess('password')
    addToast('Password changed successfully!', 'success')
  }

  // ── Notification handlers ───────────────────────────────────────────
  function toggleNotif(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n))
  }

  function handleNotifSave() {
    localStorage.setItem('agf_admin_notif_prefs', JSON.stringify(notifs))
    showSuccess('notifications')
    addToast('Notification preferences saved successfully!', 'success')
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Profile',        icon: <MdPerson size={18} />        },
    { key: 'password',      label: 'Password',       icon: <MdLock size={18} />          },
    { key: 'notifications', label: 'Notifications',  icon: <MdNotifications size={18} /> },
  ]

  return (
    <div className="settings-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your admin account preferences</p>
        </div>
      </div>

      <div className="settings-layout">

        {/* Tabs Sidebar */}
        <div className="settings-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`settings-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span className="settings-tab-icon">{t.icon}</span>
              <span className="settings-tab-label">{t.label}</span>
              {activeTab === t.key && <span className="settings-tab-indicator" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">

          {/* ── Profile Tab ───────────────────── */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h4 className="settings-section-title">Profile Information</h4>
                  <p className="settings-section-sub">Update your admin name, contact and location</p>
                </div>
                {!profileEditing && (
                  <button
                    className="settings-edit-btn"
                    onClick={() => { setProfileEditing(true); setProfileDraft(profile) }}
                  >
                    <MdEdit size={15} /> Edit
                  </button>
                )}
              </div>

              {/* Avatar */}
              <div className="settings-avatar-row">
                <div className="settings-avatar-wrap">
                  {avatarPreview || profile.avatarUrl ? (
                    <img
                      src={avatarPreview ?? profile.avatarUrl}
                      alt="Avatar"
                      className="settings-avatar-img"
                    />
                  ) : (
                    <div className="settings-avatar-placeholder">
                      {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  {profileEditing && (
                    <button
                      className="settings-avatar-camera"
                      onClick={() => avatarRef.current?.click()}
                    >
                      <MdCamera size={14} />
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarRef}
                    style={{ display: 'none' }}
                    onChange={e => handleAvatarChange(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div>
                  <p className="settings-avatar-name">{profile.name}</p>
                  <p className="settings-avatar-role">Super Admin · AgroFlow+</p>
                  {profileEditing && (
                    <p className="settings-avatar-hint">Click the camera icon to change photo</p>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="settings-form">
                <div className="settings-form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    {profileEditing ? (
                      <input
                        className="form-input"
                        value={profileDraft.name}
                        onChange={e => setProfileDraft(p => ({ ...p, name: e.target.value }))}
                      />
                    ) : (
                      <div className="settings-field-display">{profile.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    {profileEditing ? (
                      <input
                        className="form-input"
                        type="email"
                        value={profileDraft.email}
                        onChange={e => setProfileDraft(p => ({ ...p, email: e.target.value }))}
                      />
                    ) : (
                      <div className="settings-field-display">{profile.email}</div>
                    )}
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    {profileEditing ? (
                      <input
                        className="form-input"
                        value={profileDraft.phone}
                        onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))}
                      />
                    ) : (
                      <div className="settings-field-display">{profile.phone}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    {profileEditing ? (
                      <input
                        className="form-input"
                        value={profileDraft.location}
                        onChange={e => setProfileDraft(p => ({ ...p, location: e.target.value }))}
                      />
                    ) : (
                      <div className="settings-field-display">{profile.location}</div>
                    )}
                  </div>
                </div>

                {profileEditing && (
                  <div className="settings-form-actions">
                    <button className="fd-btn primary" onClick={handleProfileSave}>
                      <MdSave size={15} /> Save Changes
                    </button>
                    <button className="fd-btn secondary" onClick={handleProfileCancel}>
                      Cancel
                    </button>
                  </div>
                )}

                {saveSuccess === 'profile' && (
                  <div className="settings-success">
                    <MdCheckCircle size={16} /> Profile updated successfully
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Password Tab ──────────────────── */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h4 className="settings-section-title">Change Password</h4>
                  <p className="settings-section-sub">Keep your account secure with a strong password</p>
                </div>
              </div>

              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-wrap">
                    <input
                      className="form-input"
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    />
                    <button
                      className="password-toggle"
                      onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                    >
                      {showPasswords.current
                        ? <MdVisibilityOff size={17} />
                        : <MdVisibility size={17} />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="password-input-wrap">
                      <input
                        className="form-input"
                        type={showPasswords.newPass ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        value={passwords.newPass}
                        onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                      />
                      <button
                        className="password-toggle"
                        onClick={() => setShowPasswords(p => ({ ...p, newPass: !p.newPass }))}
                      >
                        {showPasswords.newPass
                          ? <MdVisibilityOff size={17} />
                          : <MdVisibility size={17} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="password-input-wrap">
                      <input
                        className="form-input"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        placeholder="Repeat new password"
                        value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      />
                      <button
                        className="password-toggle"
                        onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      >
                        {showPasswords.confirm
                          ? <MdVisibilityOff size={17} />
                          : <MdVisibility size={17} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password strength indicator */}
                {passwords.newPass && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`strength-bar ${
                            passwords.newPass.length >= i * 3 ? (
                              passwords.newPass.length >= 10 ? 'strong' :
                              passwords.newPass.length >= 6  ? 'medium' : 'weak'
                            ) : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="strength-label">
                      {passwords.newPass.length >= 10 ? 'Strong' :
                       passwords.newPass.length >= 6  ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                )}

                {passwordError && (
                  <p className="form-error">{passwordError}</p>
                )}

                {saveSuccess === 'password' && (
                  <div className="settings-success">
                    <MdCheckCircle size={16} /> Password changed successfully
                  </div>
                )}

                <div className="settings-form-actions">
                  <button className="fd-btn primary" onClick={handlePasswordSave}>
                    <MdSave size={15} /> Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <div>
                  <h4 className="settings-section-title">Notification Preferences</h4>
                  <p className="settings-section-sub">Choose what you want to be notified about</p>
                </div>
              </div>

              {/* ── Push Notification Toggle ────────────────────────────── */}
              <div className="notif-item push-toggle">
                <div className="notif-item-text">
                  <p className="notif-item-label">
                    <MdPushPin size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Push Notifications
                  </p>
                  <p className="notif-item-desc">
                    {pushSubscribed 
                      ? 'You will receive real-time push notifications on your device' 
                      : 'Enable push notifications to get instant alerts on your phone'}
                  </p>
                  {pushError && (
                    <p className="push-error">{pushError}</p>
                  )}
                </div>
                <button
                  className={`toggle-switch${pushSubscribed ? ' on' : ''}`}
                  onClick={togglePushSubscription}
                  disabled={pushLoading}
                  aria-label="Toggle push notifications"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="notif-divider" />

              {/* ── Notification Preferences ────────────────────────────── */}
              <div className="notif-list">
                {notifs.map(n => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-item-text">
                      <p className="notif-item-label">{n.label}</p>
                      <p className="notif-item-desc">{n.description}</p>
                    </div>
                    <button
                      className={`toggle-switch${n.enabled ? ' on' : ''}`}
                      onClick={() => toggleNotif(n.id)}
                      aria-label={`Toggle ${n.label}`}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>
                ))}
              </div>

              {saveSuccess === 'notifications' && (
                <div className="settings-success" style={{ marginTop: '8px' }}>
                  <MdCheckCircle size={16} /> Notification preferences saved
                </div>
              )}

              <div className="settings-form-actions" style={{ marginTop: '8px' }}>
                <button className="fd-btn primary" onClick={handleNotifSave}>
                  <MdSave size={15} /> Save Preferences
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}