import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './style.css'

function ListarLivros() {
  const [livros, setLivros] = useState([])

  useEffect(() => {
    fetch('/api/livros')
      .then(r => r.json())
      .then(data => setLivros(data))
      .catch(err => console.error(err))
  }, [])

  const excluir = async id => {
    if (window.confirm('Deseja excluir este livro?')) {
      const res = await fetch(`/api/livros/${id}`, { method: 'DELETE' })
      if (res.ok) setLivros(livros.filter(l => l.id !== id))
      else alert('Erro ao excluir livro')
    }
  }

  return (
    <div>
      <h2>Lista de Livros</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Livro</th><th>Categoria</th><th>Escritor</th><th>Lançamento</th>
            <th>Editora</th><th>Edição</th><th>Autor</th><th>Idioma</th><th>Gênero</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {livros.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td><td>{l.nome_livro}</td><td>{l.categoria}</td><td>{l.escritor}</td>
              <td>{l.data_lanc}</td><td>{l.editora}</td><td>{l.edicao}</td><td>{l.autor}</td>
              <td>{l.idioma}</td><td>{l.genero}</td>
              <td>
                <Link to={`/livros/editar/${l.id}`}>Editar</Link> |{' '}
                <button onClick={() => excluir(l.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ListarLivros
