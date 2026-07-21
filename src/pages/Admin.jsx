import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Admin() {
  const [demandes, setDemandes] = useState([])

  useEffect(() => {
    async function loadDemandes() {
      const { data } = await supabase
        .from('demandes')
        .select('*, clients(nom, telephone)')
        .order('created_at', { ascending: false })
      if (data) setDemandes(data)
    }
    loadDemandes()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="admin-page">
      <header>
        <h1>Tableau de bord Admin</h1>
        <button onClick={handleLogout}>Déconnexion</button>
      </header>

      <section>
        <h2>Demandes clients ({demandes.length})</h2>
        <div className="demandes-list">
          {demandes.map(d => (
            <div key={d.id} className="demande-card">
              <p><strong>{d.clients?.nom}</strong> — {d.clients?.telephone}</p>
              <p>{d.service_demande}</p>
              <p>{d.description}</p>
              <span className={`statut ${d.statut}`}>{d.statut}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Admin
