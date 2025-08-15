import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './style.css'

function EditarLivro() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`/api/livros/${id}`)
      .then(r => r.json())
      .then(data => setForm(data))
      .catch(err => console.error(err))
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    await fetch(`/api/livros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    navigate('/livros')
  }

  if (!form) return <div>Carregando...</div>

  return (
    <div>
      <h2>Editar Livro #{id}</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(form).map(([name, val]) => (
          name !== 'id' && (
            <div key={name}>
              <label>{name.replace('_', ' ')}:</label><br />
              <input
                type={name === 'data_lanc' ? 'date' : 'text'}
                name={name}
                value={val || ''}
                onChange={handleChange}
                required
              /><br /><br />
            </div>
          )
        ))}
        <button type="submit">Atualizar</button>
      </form>
    </div>
  )
}

export default EditarLivro
