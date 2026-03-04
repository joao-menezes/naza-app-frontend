import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

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
    <div className='page'>

      <div className='logoWrap'>
        <div className='logoCircle'>
          <img src="/icon-192.png" width={52} alt="logo" />
        </div>
        <p className='appName'>Nazareno União</p>
        <p className='appSub'>Acesse sua conta</p>
      </div>

      <div className='card'>
        <div style={{ marginBottom: 16 }}>
          <span className='label'>Email</span>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='input'
            onFocus={e => (e.target.style.borderColor = '#c9a84c')}
            onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <span className='label'>Senha</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className='input'
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
          className={`btn ${loading ? 'btnDisabled' : ''}`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>

      <p className='footer'>Igreja Do Nazareno © {new Date().getFullYear()}</p>
    </div>
  )
}