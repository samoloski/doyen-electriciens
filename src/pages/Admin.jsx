import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Admin() {
  const [demandes, setDemandes] = useState([])
  const [stats, setStats] = useState({ visites: 0, demandes: 0, nouvelles: 0 })
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [repartition, setRepartition] = useState([])
  const [activite7j, setActivite7j] = useState([])

  useEffect(() => {
    async function loadData() {
      const { data: demandesData } = await supabase
        .from('demandes')
        .select('*, clients(nom, telephone)')
        .order('created_at', { ascending: false })
      if (demandesData) setDemandes(demandesData)

      const { count: visitesCount } = await supabase
        .from('visites').select('*', { count: 'exact', head: true })
      const { count: demandesCount } = await supabase
        .from('demandes').select('*', { count: 'exact', head: true })
      const { count: nouvellesCount } = await supabase
        .from('demandes').select('*', { count: 'exact', head: true }).eq('statut', 'nouvelle')

      setStats({
        visites: visitesCount || 0,
        demandes: demandesCount || 0,
        nouvelles: nouvellesCount || 0
      })

      if (demandesData) {
        const compteParService = {}
        demandesData.forEach(d => {
          const nom = d.service_demande || 'Non précisé'
          compteParService[nom] = (compteParService[nom] || 0) + 1
        })
        const total = demandesData.length || 1
        const repartitionArr = Object.entries(compteParService)
          .map(([nom, count]) => ({ nom, count, pourcentage: Math.round((count / total) * 100) }))
          .sort((a, b) => b.count - a.count)
        setRepartition(repartitionArr)
      }

      const { data: visitesData } = await supabase
        .from('visites').select('created_at')

      const jours = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        jours.push(d.toISOString().split('T')[0])
      }

      const activite = jours.map(jour => {
        const nbVisites = (visitesData || []).filter(v => v.created_at.startsWith(jour)).length
        const nbDemandes = (demandesData || []).filter(d => d.created_at.startsWith(jour)).length
        return { jour, nbVisites, nbDemandes }
      })
      setActivite7j(activite)
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

  const demandesFiltrees = demandes.filter(d => {
    const matchRecherche = recherche === '' ||
      d.clients?.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.service_demande?.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'tous' || d.statut === filtreStatut
    return matchRecherche && matchStatut
  })

  const maxActivite = Math.max(...activite7j.map(a => Math.max(a.nbVisites, a.nbDemandes)), 1)

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

      <section className="chart-section">
        <h2>Activité des 7 derniers jours</h2>
        <div className="bar-chart">
          {activite7j.map(a => (
            <div key={a.jour} className="bar-chart-col">
              <div className="bar-chart-bars">
                <div className="bar-chart-bar visites" style={{ height: `${(a.nbVisites / maxActivite) * 100}%` }} title={`${a.nbVisites} visites`} />
                <div className="bar-chart-bar demandes" style={{ height: `${(a.nbDemandes / maxActivite) * 100}%` }} title={`${a.nbDemandes} demandes`} />
              </div>
              <span className="bar-chart-label">{a.jour.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span><span className="legend-dot visites"></span> Visites</span>
          <span><span className="legend-dot demandes"></span> Demandes</span>
        </div>
      </section>

      <section className="chart-section">
        <h2>Répartition par service</h2>
        <div className="repartition-list">
          {repartition.map(r => (
            <div key={r.nom} className="repartition-item">
              <div className="repartition-header">
                <span>{r.nom}</span>
                <span>{r.count} ({r.pourcentage}%)</span>
              </div>
              <div className="repartition-bar-bg">
                <div className="repartition-bar-fill" style={{ width: `${r.pourcentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Demandes clients ({demandesFiltrees.length})</h2>

        <div className="filtres">
          <input
            type="text"
            placeholder="Rechercher par nom ou service..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
          />
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option value="tous">Tous les statuts</option>
            <option value="nouvelle">Nouvelle</option>
            <option value="vue">Vue</option>
            <option value="devis_envoye">Devis envoyé</option>
            <option value="refusee">Refusée</option>
          </select>
        </div>

        <div className="demandes-list">
          {demandesFiltrees.map(d => (
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
