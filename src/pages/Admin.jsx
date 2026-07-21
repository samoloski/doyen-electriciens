import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Admin() {
  const [demandes, setDemandes] = useState([])
  const [stats, setStats] = useState({ visites: 0, demandes: 0, nouvelles: 0 })

  useEffect(() => {
    async function loadData() {
      const { data: demandesData } = await supabase
        .from('demandes')
        .select('*, clients(nom, telephone)')
        .order('created_at', { ascending: false })
      if (demandesData) setDemandes(demandesData)

      const { count: visitesCount } = await supabase
        .from('visites')
        .select('*', { count: 'exact', head: true })

      const { count: demandesCount } = await supabase
        .from('demandes')
        .select('*', { count: 'exact', head: true })

      const { count: nouvellesCount } = await supabase
        .from('demandes')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'nouvelle')

      setStats({
        visites: visitesCount || 0,
        demandes: demandesCount || 0,
        nouvelles: nouvellesCount || 0
      })
    }
    loadData()
  }, [])

  async function updateStatut(id, nouveauStatut) {
    await supabase.from('demandes').update({ statut: nouveauStatut }).eq('id', id)
    setDemandes(demandes.map(d => d.id === id ? { ...d, statut: nouveauStatut } : d))
  }

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

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.visites}</span>
          <span className="stat-label">Visites du site</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.demandes}</span>
          <span className="stat-label">Demandes totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.nouvelles}</span>
          <span className="stat-label">Nouvelles demandes</span>
        </div>
      </div>

      <section>
        <h2>Demandes clients ({demandes.length})</h2>
        <div className="demandes-list">
          {demandes.map(d => (
            <div key={d.id} className="demande-card">
              <p><strong>{d.clients?.nom}</strong> — {d.clients?.telephone}</p>
              <p>{d.service_demande}</p>
              <p>{d.description}</p>
              <span className={`statut ${d.statut}`}>{d.statut}</span>
              <div className="statut-actions">
                <button onClick={() => updateStatut(d.id, 'vue')}>Marquer vue</button>
                <button onClick={() => updateStatut(d.id, 'devis_envoye')}>Devis envoyé</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Admin
