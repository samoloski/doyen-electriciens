import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErreur('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErreur('Email ou mot de passe incorrect')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      navigate('/admin')
    } else if (profile?.role === 'technicien') {
      navigate('/technicien')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="login-page">
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" required
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Mot de passe" required
          value={password} onChange={e => setPassword(e.target.value)} />
        {erreur && <p className="erreur">{erreur}</p>}
        <button type="submit">Se connecter</button>
      </form>
    </div>
  )
}

export default Login
