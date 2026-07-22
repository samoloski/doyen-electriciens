import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

function Home() {
  const [services, setServices] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nom: '', telephone: '', service_demande: '', description: '' })
  const [envoye, setEnvoye] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installe, setInstalle] = useState(false)

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase.from('services').select('*').eq('actif', true)
      if (data) setServices(data)
    }
    loadServices()
    supabase.from('visites').insert([{ page: 'accueil' }])

    function handleBeforeInstall(e) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    function handleInstalled() {
      setInstalle(true)
      setInstallPrompt(null)
    }
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalle(true)
    setInstallPrompt(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    let { data: client } = await supabase
      .from('clients')
      .insert([{ nom: form.nom, telephone: form.telephone }])
      .select()
      .single()

    if (client) {
      await supabase.from('demandes').insert([{
        client_id: client.id,
        service_demande: form.service_demande,
        description: form.description
      }])

      emailjs.send('service_skbjrjt', 'template_dgevok9', {
        nom: form.nom,
        telephone: form.telephone,
        service: form.service_demande,
        description: form.description
      }, '00y-w1SlxV9N0AEvh')

      setEnvoye(true)

      const message = `Nouvelle demande:%0ANom: ${form.nom}%0ATelephone: ${form.telephone}%0AService: ${form.service_demande}%0ADescription: ${form.description}`
      window.open(`https://wa.me/22898958902?text=${message}`, '_blank')
    }
  }

  function demanderCeService(nomService) {
    setForm({ ...form, service_demande: nomService })
    setSelected(null)
    document.getElementById('demande').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="App">
      <nav className="navbar">
        <span className="navbar-logo">Le Doyen des Électriciens</span>
        <Link to="/login" className="navbar-login">Connexion</Link>
      </nav>

      <header className="hero">
        <div className="hero-overlay">
          <h1>Le Doyen des Électriciens</h1>
          <p>Votre électricien de confiance, disponible pour tous vos besoins</p>
          <a href="#demande" className="hero-cta">Demander un devis gratuit</a>
          {installPrompt && !installe && (
            <button className="install-cta" onClick={handleInstall}>
              📲 Télécharger l'application
            </button>
          )}
          {installe && (
            <p className="install-success">✓ Application installée</p>
          )}
        </div>
      </header>

      <section className="pourquoi">
        <h2>Pourquoi nous choisir</h2>
        <div className="pourquoi-list">
          <div className="pourquoi-card">
            <h3>Expérience</h3>
            <p>Des années d'expertise en installation et dépannage électrique.</p>
          </div>
          <div className="pourquoi-card">
            <h3>Réactivité</h3>
            <p>Intervention rapide, y compris en urgence.</p>
          </div>
          <div className="pourquoi-card">
            <h3>Sécurité</h3>
            <p>Travaux conformes aux normes électriques en vigueur.</p>
          </div>
          <div className="pourquoi-card">
            <h3>Transparence</h3>
            <p>Devis clair avant toute intervention, sans mauvaise surprise.</p>
          </div>
        </div>
      </section>

      <section className="services">
        <h2>Nos services</h2>
        <div className="services-list">
          {services.map(s => (
            <div key={s.id} className="service-card" onClick={() => setSelected(s)}>
              {s.image_url && <img src={s.image_url} alt={s.nom} className="service-image" />}
              <h3>{s.nom}</h3>
              <p>{s.description}</p>
              <span>Sur devis</span>
            </div>
          ))}
        </div>
      </section>

      <section className="temoignages">
        <h2>Ce que disent nos clients</h2>
        <div className="temoignages-list">
          <div className="temoignage-card">
            <p>"Intervention rapide et travail soigné. Je recommande vivement."</p>
            <span>— Client satisfait</span>
          </div>
          <div className="temoignage-card">
            <p>"Très professionnel, explications claires et prix honnête."</p>
            <span>— Client satisfait</span>
          </div>
          <div className="temoignage-card">
            <p>"Toujours disponible, même pour les urgences le soir."</p>
            <span>— Client satisfait</span>
          </div>
        </div>
      </section>

      <section className="demande" id="demande">
        <h2>Demander un service</h2>
        {envoye ? (
          <p>Merci ! Votre demande a été envoyée. Confirmez l'envoi sur WhatsApp pour nous prévenir immédiatement.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Votre nom" required
              value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            <input type="tel" placeholder="Votre téléphone" required
              value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            <select required
              value={form.service_demande}
              onChange={e => setForm({ ...form, service_demande: e.target.value })}>
              <option value="">Choisissez un service</option>
              {services.map(s => (
                <option key={s.id} value={s.nom}>{s.nom}</option>
              ))}
            </select>
            <textarea placeholder="Décrivez votre besoin"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <button type="submit">Envoyer la demande</button>
          </form>
        )}
      </section>

      <section className="contact" id="contact">
        <h2>Nous contacter</h2>
        <p className="contact-intro">Disponible 24h/24, 7j/7 pour vos urgences électriques</p>
        <div className="contact-grid">
          <a href="https://wa.me/22898958902" target="_blank" rel="noopener noreferrer" className="contact-card">
            <span className="contact-icon">📱</span>
            <span className="contact-label">WhatsApp</span>
            <span className="contact-value">+228 98 95 89 02</span>
          </a>
          <a href="mailto:awessoupascal@gmail.com" className="contact-card">
            <span className="contact-icon">✉️</span>
            <span className="contact-label">Email</span>
            <span className="contact-value">awessoupascal@gmail.com</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <p>Le Doyen des Électriciens — Votre électricien de confiance</p>
      </footer>

      <a href="https://wa.me/22898958902" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
        Contacter sur WhatsApp
      </a>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            {selected.image_url && <img src={selected.image_url} alt={selected.nom} className="modal-image" />}
            <h2>{selected.nom}</h2>
            <p>{selected.description}</p>
            <span className="modal-prix">Sur devis</span>
            <button className="modal-cta" onClick={() => demanderCeService(selected.nom)}>
              Demander ce service
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
