import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha inválidos')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 16px',
          boxShadow: '0 0 40px rgba(201,168,76,0.25)',
        }}>✝</div>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0 }}>Nazareno União</p>
        <p style={{ color: '#c9a84c', fontSize: 12, margin: '4px 0 0', letterSpacing: 2, textTransform: 'uppercase' }}>
          Acesse sua conta
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: '#141414',
        border: '1px solid #1e1e1e',
        borderRadius: 20,
        padding: '28px 24px',
      }}>
        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Email
          </p>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0a0a0a', border: '1px solid #2a2a2a',
              borderRadius: 12, padding: '14px 16px',
              color: '#fff', fontSize: 15, outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#c9a84c')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
        </div>

        {/* Senha */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#c9a84c', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Senha
          </p>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0a0a0a', border: '1px solid #2a2a2a',
              borderRadius: 12, padding: '14px 16px',
              color: '#fff', fontSize: 15, outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = '#c9a84c')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
        </div>

        {error && (
          <p style={{ color: '#e05555', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#5a4a1a' : 'linear-gradient(135deg, #c9a84c, #f0d080)',
            color: '#000', fontWeight: 700,
            fontSize: 15, border: 'none',
            borderRadius: 14, padding: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            letterSpacing: 0.5,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <p style={{ color: '#333', fontSize: 12, marginTop: 32 }}>
        Igreja © {new Date().getFullYear()}
      </p>
    </div>
  )
}