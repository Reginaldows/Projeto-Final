import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'

function CadastrarAluno() {
  const [aluno, setAluno] = useState({
    nome: '', sobrenome: '', cpf: '', data_nasc: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '',
    cidade: '', telefone: '', celular: '', email: ''
  });
  const navigate = useNavigate();

  const handleChange = e => setAluno({ ...aluno, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno)
    });
    navigate('/');
  };

  return (
    <div>
      <h2>Cadastrar Aluno</h2>
      <form onSubmit={handleSubmit}>
        {Object.entries(aluno).map(([key, value]) => (
          <div key={key}>
            <label>{key.replace('_', ' ')}:</label>
            <input
              type={key.includes('data') ? 'date' : 'text'}
              name={key}
              value={value}
              onChange={handleChange}
              required={!['telefone','complemento'].includes(key)}
            />
          </div>
        ))}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default CadastrarAluno;
