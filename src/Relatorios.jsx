import React, { useState, useEffect } from 'react';
import styles from './relatorios.module.css';
import Acessibilidade from './acessibilidade';

const Relatorios = () => {
  const [dados, setDados] = useState({
    livrosCadastrados: 0,
    livrosEmprestados: 0,
    livroMaisEmprestado: { titulo: 'Carregando...', total_emprestimos: 0 },
    livrosAtualmenteEmprestados: 0,
    multasPendentes: 0,
    valorMultasPagas: 0,
    numeroReservas: 0,
    usuariosCadastrados: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const buscarDadosRelatorios = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/php/relatorios.php', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setDados(data.dados);
        } else {
          setError(data.message || 'Erro ao carregar dados dos relatórios');
        }
      } catch (error) {
        console.error('Erro ao buscar dados dos relatórios:', error);
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    buscarDadosRelatorios();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Erro ao carregar relatórios</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Relatórios da Biblioteca</h1>
        <p>Estatísticas e informações sobre o acervo</p>
      </header>

      <div className={styles.relatoriosGrid}>
        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Livros Cadastrados</h3>
            <div className={styles.icone}>📚</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.livrosCadastrados}</span>
            <span className={styles.descricao}>Total de livros no acervo</span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Total de Empréstimos</h3>
            <div className={styles.icone}>📖</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.livrosEmprestados}</span>
            <span className={styles.descricao}>Empréstimos realizados</span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Livros Atualmente Emprestados</h3>
            <div className={styles.icone}>🔄</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.livrosAtualmenteEmprestados}</span>
            <span className={styles.descricao}>Em circulação no momento</span>
          </div>
        </div>

        <div className={`${styles.bloco} ${styles.blocoDestaque}`}>
          <div className={styles.blocoHeader}>
            <h3>Livro Mais Emprestado</h3>
            <div className={styles.icone}>🏆</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.tituloLivro}>{dados.livroMaisEmprestado.titulo}</span>
            <span className={styles.numeroEmprestimos}>
              {dados.livroMaisEmprestado.total_emprestimos} empréstimos
            </span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Multas Pendentes</h3>
            <div className={styles.icone}>⚠️</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.multasPendentes}</span>
            <span className={styles.descricao}>Empréstimos com multa não paga</span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Valor Multas Pagas</h3>
            <div className={styles.icone}>💰</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>R$ {(dados.valorMultasPagas || 0).toFixed(2)}</span>
            <span className={styles.descricao}>Total arrecadado com multas</span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Reservas Ativas</h3>
            <div className={styles.icone}>📋</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.numeroReservas}</span>
            <span className={styles.descricao}>Livros reservados pelos usuários</span>
          </div>
        </div>

        <div className={styles.bloco}>
          <div className={styles.blocoHeader}>
            <h3>Usuários Cadastrados</h3>
            <div className={styles.icone}>👥</div>
          </div>
          <div className={styles.blocoConteudo}>
            <span className={styles.numero}>{dados.usuariosCadastrados}</span>
            <span className={styles.descricao}>Total de usuários no sistema</span>
          </div>
        </div>
      </div>

      <div className={styles.rodape}>
        <p>Dados atualizados em tempo real</p>
        <button 
          className={styles.atualizarButton}
          onClick={() => window.location.reload()}
        >
          🔄 Atualizar Dados
        </button>
      </div>
      <Acessibilidade />
    </div>
  );
};

export default Relatorios;