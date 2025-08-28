import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './meusemprestimos.module.css';
import Acessibilidade from './acessibilidade';

const MeusEmprestimos = () => {
  const navigate = useNavigate();
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  const carregarEmprestimos = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await fetch('/php/listar_emprestimos_usuario.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario_id: parseInt(userId) })
      });

      const result = await response.json();
      
      if (result.success) {
        setEmprestimos(result.data || []);
      } else {
        setError(result.message || 'Erro ao carregar empréstimos');
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      setError('Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  };



  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularDiasRestantes = (dataDevolucao) => {
    const hoje = new Date();
    const devolucao = new Date(dataDevolucao);
    const diffTime = devolucao - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusEmprestimo = (dataDevolucao) => {
    const diasRestantes = calcularDiasRestantes(dataDevolucao);
    if (diasRestantes < 0) return 'atrasado';
    if (diasRestantes <= 3) return 'vencendo';
    return 'normal';
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
      
      <div className={styles.container}>
        {mensagem && (
          <div className={`${styles.mensagem} ${styles[tipoMensagem]}`}>
            {mensagem}
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoVertical}>
              <span className={styles.logoBiblioteca}>Biblioteca</span>
              <img src="/img/logoSenai.png" alt="SENAI" className={styles.logoSenai} />
            </div>
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.tituloPrincipal}>
              Meus Empréstimos
            </h1>
            <p className={styles.subtitulo}>Gerencie seus livros emprestados</p>
          </div>
        </div>

        <div className={styles.acoes}>
          <button 
            className={styles.botaoVoltar}
            onClick={() => navigate('/biblioteca')}
          >
            ← Voltar à Biblioteca
          </button>
        </div>

        {emprestimos.length === 0 ? (
          <div className={styles.semEmprestimos}>
            <h3>Nenhum empréstimo ativo</h3>
            <p>Você não possui livros emprestados no momento.</p>
            <button 
              className={styles.botaoBiblioteca}
              onClick={() => navigate('/biblioteca')}
            >
              Explorar Biblioteca
            </button>
          </div>
        ) : (
          <div className={styles.listaEmprestimos}>
            {emprestimos.map((emprestimo) => {
              const status = getStatusEmprestimo(emprestimo.data_prevista_devolucao);
              const diasRestantes = calcularDiasRestantes(emprestimo.data_prevista_devolucao);
              
              return (
                <div key={emprestimo.id} className={`${styles.cardEmprestimo} ${styles[status]}`}>
                  <div className={styles.capaContainer}>
                    <img 
                      src={emprestimo.capa || '/img/Biblioteca.png'} 
                      alt={emprestimo.titulo}
                      className={styles.capaLivro}
                      onError={(e) => {
                        e.target.src = '/img/Biblioteca.png';
                      }}
                    />
                  </div>
                  <div className={styles.infoEmprestimo}>
                    <h3 className={styles.tituloLivro}>{emprestimo.titulo}</h3>
                    <p className={styles.autorLivro}>por {emprestimo.autor}</p>
                    
                    <div className={styles.detalhesEmprestimo}>
                      <div className={styles.datas}>
                        <div className={styles.dataItem}>
                          <span className={styles.label}>Emprestado em:</span>
                          <span className={styles.valor}>{formatarData(emprestimo.data_emprestimo)}</span>
                        </div>
                        <div className={styles.dataItem}>
                          <span className={styles.label}>Devolução prevista:</span>
                          <span className={styles.valor}>{formatarData(emprestimo.data_prevista_devolucao)}</span>
                        </div>
                      </div>
                      
                      <div className={styles.statusContainer}>
                        {status === 'atrasado' && (
                          <div className={styles.statusAtrasado}>
                            ⚠️ Atrasado ({Math.abs(diasRestantes)} dias)
                          </div>
                        )}
                        {status === 'vencendo' && (
                          <div className={styles.statusVencendo}>
                            ⏰ Vence em {diasRestantes} dias
                          </div>
                        )}
                        {status === 'normal' && (
                          <div className={styles.statusNormal}>
                            ✅ {diasRestantes} dias restantes
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.codigoCopia}>
                        <span className={styles.label}>Código da cópia:</span>
                        <span className={styles.codigo}>{emprestimo.codigo_copia}</span>
                      </div>
                    </div>
                  </div>
                  

                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MeusEmprestimos;