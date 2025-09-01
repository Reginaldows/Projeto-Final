import React, { useState, useEffect } from 'react';
import { Table, Container, Button, Form } from 'react-bootstrap';
import styles from './listausuarios.module.css';
import { formatarCPF } from './scripts/validacaoCpfSenha';
import Mensagem from './mensagem';
import Acessibilidade from './acessibilidade';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cpfBusca, setCpfBusca] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [leituraAtiva, setLeituraAtiva] = useState(false);


  // Buscar usuários
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/php/listarusuarios.php');
      const data = await response.json();
      
      if (data.success) {
        setUsuarios(data.dados);
        setUsuariosFiltrados(data.dados);
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
  
  // Função para buscar usuários por CPF
  const buscarPorCPF = () => {
    if (!cpfBusca.trim()) {
      setUsuariosFiltrados(usuarios);
      return;
    }
    
    // Remove formatação para comparar apenas os números
    const cpfBuscaLimpo = cpfBusca.replace(/\D/g, '');
    
    const resultados = usuarios.filter(usuario => {
      if (!usuario.cpf) return false;
      const cpfUsuarioLimpo = usuario.cpf.replace(/\D/g, '');
      return cpfUsuarioLimpo.includes(cpfBuscaLimpo);
    });
    
    setUsuariosFiltrados(resultados);
  };

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
          setMensagem(data.message);
          setTipoMensagem('sucesso');
          fetchUsuarios(); // Recarregar a lista
          setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
          }, 3000);
        } else {
          setMensagem(data.message);
          setTipoMensagem('erro');
          setTimeout(() => {
            setMensagem('');
            setTipoMensagem('');
          }, 3000);
        }
      } catch (err) {
        setMensagem('Erro ao excluir usuário: ' + err.message);
        setTipoMensagem('erro');
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
      }
    }
  };



  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div className={styles.tableWrapper}>
      {mensagem && (
        <Mensagem 
          texto={mensagem} 
          tipo={tipoMensagem} 
          onClose={() => {
            setMensagem('');
            setTipoMensagem('');
          }}
        />
      )}
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logo} />
        </div>
        
        <h1 className={styles.title}>Lista de Usuários</h1>
        
        <div className={styles.searchContainer}>
          <Form.Control 
            type="text" 
            placeholder="Digite o CPF do usuário" 
            value={cpfBusca} 
            onChange={(e) => {
              const formatado = formatarCPF(e.target.value);
              setCpfBusca(formatado);
            }} 
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                buscarPorCPF();
              }
            }}
            className={styles.searchInput}
            maxLength="14"
            style={{ marginRight: 0 }}
          />
          <Button 
            onClick={buscarPorCPF} 
            className={styles.searchButton}
            style={{ marginLeft: 0 }}
          >
            Buscar
          </Button>
        </div>
      
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.filter(usuario => usuario.tipo_usuario === 'usuario').map((usuario) => (
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
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
    </div>
  );
};

export default ListaUsuarios;