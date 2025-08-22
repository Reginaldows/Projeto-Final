import React, { useState, useEffect } from 'react';
import { Table, Container, Button } from 'react-bootstrap';
import styles from './listausuarios.module.css';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Buscar usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/php/listarusuarios.php');
      const data = await response.json();
      
      if (data.success) {
        setUsuarios(data.dados);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erro ao carregar usuários: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Redirecionar para a tela de edição
  const handleEdit = (id) => {
    window.location.href = `/editarusuario/${id}`;
  };

  // Excluir usuário
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('http://localhost/php/excluirusuario.php', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert(data.message);
          fetchUsuarios(); // Recarregar a lista
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert('Erro ao excluir usuário: ' + err.message);
      }
    }
  };



  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Lista de Usuários</h1>
      
      <div className={styles.tableContainer}>
        <Table responsive striped bordered hover>
          <thead className={styles.tableHeader}>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Celular</th>
              <th>Data Nasc.</th>
              <th>CEP</th>
              <th>Rua</th>
              <th>Número</th>
              <th>Complemento</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.filter(usuario => usuario.tipo_usuario !== 'bibliotecario').map((usuario) => (
                <tr key={usuario.id} className={styles.tableRow}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.cpf}</td>
                  <td>{usuario.celular}</td>
                  <td>{usuario.data_nasc}</td>
                  <td>{usuario.cep}</td>
                  <td>{usuario.rua}</td>
                  <td>{usuario.numero}</td>
                  <td>{usuario.complemento}</td>
                  <td>{usuario.bairro}</td>
                  <td>{usuario.cidade}</td>
                  <td>{usuario.estado}</td>
                  <td>{usuario.tipo_usuario}</td>
                  <td className={styles.actionButtons}>
                    <Button 
                      className={styles.editButton}
                      onClick={() => handleEdit(usuario.id)}
                    >
                      Editar
                    </Button>
                    <Button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(usuario.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center">Nenhum usuário encontrado</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>


      </div>
    </div>
  );
};

export default ListaUsuarios;