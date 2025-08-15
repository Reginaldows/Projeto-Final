import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './style.css'

function EditarAluno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aluno, setAluno] = useState(null);

  useEffect(() => {
    fetch(`/api/alunos/${id}`)
      .then(res => res.json())
      .then(data => setAluno(data))
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = e => setAluno({ ...aluno, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    await fetch(`/api/alunos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno)
    });
    navigate('/');
  };

  if (!aluno) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Editar Aluno #{id}</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(aluno).map(([key, value]) => (
          key !== 'id' && (
            <div key={key}>
              <label>{key.replace('_', ' ')}:</label>
              <input
                type={key.includes('data') ? 'date' : 'text'}
                name={key}
                value={value || ''}
                onChange={handleChange}
                required={!['telefone','complemento'].includes(key)}
              />
            </div>
          )
        ))}
        <button type="submit">Atualizar</button>
      </form>
    </div>
  );
}

export default EditarAluno;
