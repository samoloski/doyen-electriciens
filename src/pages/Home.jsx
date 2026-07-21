import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
      setEnvoye(true)
    }
  }

  return (
    <div className="App">
      <header className="header">
        <h1>Le Doyen des Électriciens</h1>
        <p>Votre électricien de confiance</p>
      </header>

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

      <section className="demande">
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

      <a href="https://wa.me/22898958902" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
        Contacter sur WhatsApp
      </a>
    </div>
  )
}

export default Home
