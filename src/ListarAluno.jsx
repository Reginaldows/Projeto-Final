import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './style.css'

function ListarAlunos() {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    fetch('/api/alunos')
.then(res => res.json())
.then(data => setAlunos(data))
.catch(err => console.error('Erro ao buscar alunos:', err));
  }, []);

  const excluirAluno = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        const res = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setAlunos(alunos.filter(aluno => aluno.id !== id));
        } else {
          alert('Erro ao excluir aluno.');
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir aluno.');
      }
    }
  };

  return (
    <div>
      <h2>Lista de Alunos</h2>
<table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
<tr>
 <th>ID</th><th>Nome</th><th>Sobrenome</th><th>CPF</th><th>Data Nasc</th>
 <th>Celular</th><th>Email</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map(aluno => (
            <tr key={aluno.id}>
<td>{aluno.id}</td>
<td>{aluno.nome}</td>
<td>{aluno.sobrenome}</td>
<td>{aluno.cpf}</td>
<td>{aluno.data_nasc}</td>
<td>{aluno.celular}</td>
<td>{aluno.email}</td>
  <td>
        <Link to={`/editar/${aluno.id}`}>Editar</Link> |{' '}
        <button onClick={() => excluirAluno(aluno.id)}>Excluir</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
  );
}

export default ListarAlunos;
