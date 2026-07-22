import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

function Home() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ nom: '', telephone: '', service_demande: '', description: '' })
  const [envoye, setEnvoye] = useState(false)

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase.from('services').select('*').eq('actif', true)
      if (data) setServices(data)
    }
    loadServices()
    supabase.from('visites').insert([{ page: 'accueil' }])
  }, [])

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
    }
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
            <div key={s.id} className="service-card">
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
          <p>Merci ! Votre demande a été envoyée, nous vous contactons rapidement.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Votre nom" required
              value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            <input type="tel" placeholder="Votre téléphone" required
              value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            <input type="text" placeholder="Service souhaité" required
              value={form.service_demande} onChange={e => setForm({ ...form, service_demande: e.target.value })} />
            <textarea placeholder="Décrivez votre besoin"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <button type="submit">Envoyer la demande</button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>Le Doyen des Électriciens — Votre électricien de confiance</p>
      </footer>

      <a href="https://wa.me/22898958902" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
        Contacter sur WhatsApp
      </a>
    </div>
  )
}

export default Home
