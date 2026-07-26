import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiLeafFill } from 'react-icons/pi'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { authAPI } from '../services/api'
import './Login.css'

export default function Login() {
  const navigate                = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    try {
      const data = await authAPI.login(email, password)
      if (data.user.role !== 'admin') {
        authAPI.logout()
        setError('Access denied — admin accounts only')
        return
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <PiLeafFill size={20} color="white" />
          </div>
          <span className="login-logo-text">
            AgroFlow<span>+</span>
          </span>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-sub">Sign in to your admin account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={e => { e.preventDefault(); handleLogin() }}
          noValidate
        >
          <div className="login-form">

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrap">
                <MdEmail size={16} className="login-input-icon" />
                <input
                  className="login-input"
                  type="email"
                  placeholder="admin@agroflow.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="login-label-row">
                <label className="form-label">Password</label>
                <span className="login-forgot">Forgot password?</span>
              </div>
              <div className="login-input-wrap">
                <MdLock size={16} className="login-input-icon" />
                <input
                  className="login-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  className="login-input-toggle"
                  onClick={() => setShowPass(p => !p)}
                  type="button"
                >
                  {showPass
                    ? <MdVisibilityOff size={17} />
                    : <MdVisibility size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">{error}</div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>Sign In <span className="login-btn-arrow">→</span></>
              )}
            </button>

          </div>
        </form>

        <p className="login-terms">
          By signing in you agree to our{' '}
          <span className="login-terms-link">Terms of Service</span>{' '}
          and{' '}
          <span className="login-terms-link">Privacy Policy</span>
        </p>

      </div>
    </div>
  )
}