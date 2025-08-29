import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PagamentoMultas.module.css';
import Acessibilidade from './Acessibilidade';

const PagamentoMultas = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarMultas();
  }, []);

  const carregarMultas = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('Usuário não encontrado. Faça login novamente.');
        return;
      }

      const response = await fetch('http://localhost/php/listar_multas_usuario.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: parseInt(userId)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMultas(data.data.multas_pendentes || []);
      } else {
        setError(data.message || 'Erro ao carregar multas');
      }
    } catch (error) {
      console.error('Erro ao carregar multas:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const criarPagamento = async (multa) => {
    try {
      setProcessandoPagamento(true);
      setMensagem('');
      
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName') || 'Usuário';
      const userEmail = localStorage.getItem('userEmail') || 'test_user_123456@testuser.com';
      
      const dadosPagamento = {
        items: [{
          id: `MULTA_${multa.emprestimo_id}`,
          title: `Pagamento de Multa - ${multa.livro_titulo}`,
          description: `Multa por atraso na devolução do livro "${multa.livro_titulo}" - ${multa.dias_atraso} dia(s) de atraso`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(multa.valor_multa)
        }],
        payer: {
          name: userName.split(' ')[0] || 'João',
          surname: userName.split(' ').slice(1).join(' ') || 'Silva',
          email: userEmail,
          phone: {
            area_code: '11',
            number: '99999-9999'
          },
          identification: {
            type: 'CPF',
            number: '12345678901'
          },
          address: {
            zip_code: '01310-100',
            street_name: 'Av. Paulista',
            street_number: '1000'
          }
        },
        external_reference: `MULTA_${multa.emprestimo_id}`,
        back_urls: {
          success: 'http://localhost:5173/pagamento-sucesso',
          failure: 'http://localhost:5173/pagamento-falha',
          pending: 'http://localhost:5173/pagamento-pendente'
        }
      };

      const response = await fetch('http://localhost/php/criar_pagamento_multa.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPagamento)
      });

      const data = await response.json();
      
      if (data.success && data.sandbox_init_point) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.sandbox_init_point;
      } else {
        setMensagem(data.error || 'Erro ao criar pagamento');
        setTipoMensagem('erro');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setMensagem('Erro ao conectar com o servidor de pagamentos');
      setTipoMensagem('erro');
    } finally {
      setProcessandoPagamento(false);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };



  const valorTotal = multas.reduce((total, multa) => total + multa.valor_multa, 0);

  if (loading) return <div className={styles.loading}>Carregando multas...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoVertical}>
              <span className={styles.logoBiblioteca}>Biblioteca</span>
              <img src="/img/logoSenai.png" alt="SENAI" className={styles.logoSenai} />
            </div>
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.tituloPrincipal}>
              💳 Pagamento de Multas
            </h1>
            <p className={styles.subtitulo}>Quite suas multas por atraso na devolução</p>
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

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[tipoMensagem]}`}>
            {mensagem}
          </div>
        )}

        {multas.length === 0 ? (
          <div className={styles.semMultas}>
            <div className={styles.iconeCheck}>✅</div>
            <h3>Parabéns! Você não possui multas pendentes</h3>
            <p>Todos os seus empréstimos estão em dia.</p>
          </div>
        ) : (
          <>
            <div className={styles.resumo}>
              <div className={styles.resumoCard}>
                <h3>📊 Resumo das Multas</h3>
                <div className={styles.resumoInfo}>
                  <div className={styles.resumoItem}>
                    <span className={styles.resumoLabel}>Total de multas:</span>
                    <span className={styles.resumoValor}>{multas.length}</span>
                  </div>
                  <div className={styles.resumoItem}>
                    <span className={styles.resumoLabel}>Valor total:</span>
                    <span className={`${styles.resumoValor} ${styles.valorTotal}`}>
                      {formatarValor(valorTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.multasGrid}>
              {multas.map((multa) => {
                
                return (
                  <div key={multa.emprestimo_id} className={styles.multaCard}>
                    <div className={styles.multaHeader}>
                      <div className={styles.livroInfo}>
                        {multa.livro_capa && (
                          <img 
                            src={multa.livro_capa} 
                            alt={multa.livro_titulo}
                            className={styles.capaLivro}
                          />
                        )}
                        <div className={styles.livroDetalhes}>
                          <h4 className={styles.livroTitulo}>{multa.livro_titulo}</h4>
                          <p className={styles.livroAutor}>por {multa.livro_autor}</p>
                        </div>
                      </div>
                      <div className={`${styles.statusPagamento} ${styles[multa.status_multa === 'pago' ? 'aprovado' : 'pendente']}`}>
                        {multa.status_multa === 'pago' ? 'Pago' : 'Pendente'}
                      </div>
                    </div>

                    <div className={styles.multaDetalhes}>
                      <div className={styles.detalheItem}>
                        <span className={styles.detalheLabel}>Data do empréstimo:</span>
                        <span className={styles.detalheValor}>{formatarData(multa.data_emprestimo)}</span>
                      </div>
                      <div className={styles.detalheItem}>
                        <span className={styles.detalheLabel}>Deveria ter devolvido:</span>
                        <span className={styles.detalheValor}>{formatarData(multa.data_devolucao_prevista)}</span>
                      </div>
                      <div className={styles.detalheItem}>
                        <span className={styles.detalheLabel}>Dias em atraso:</span>
                        <span className={`${styles.detalheValor} ${styles.diasAtraso}`}>
                          {multa.dias_atraso} dia{multa.dias_atraso !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className={styles.detalheItem}>
                        <span className={styles.detalheLabel}>Valor da multa:</span>
                        <span className={`${styles.detalheValor} ${styles.valorMulta}`}>
                          {formatarValor(multa.valor_multa)}
                        </span>
                      </div>
                      {multa.status_multa === 'pago' && multa.data_pagamento && (
                        <div className={styles.detalheItem}>
                          <span className={styles.detalheLabel}>Data do pagamento:</span>
                          <span className={styles.detalheValor}>{formatarData(multa.data_pagamento)}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.multaAcoes}>
                      {multa.status_multa === 'pendente' ? (
                        <div className={styles.acoesPagamento}>
                          <button 
                            className={`${styles.botaoPagar} ${processandoPagamento ? styles.processando : ''}`}
                            onClick={() => criarPagamento(multa)}
                            disabled={processandoPagamento}
                          >
                            {processandoPagamento ? (
                              <>
                                <span className={styles.spinner}></span>
                                Processando...
                              </>
                            ) : (
                              <>
                                💳 Pagar {formatarValor(multa.valor_multa)}
                              </>
                            )}
                          </button>
                          <div className={styles.formasPagamento}>
                            <span className={styles.formasLabel}>Formas de pagamento:</span>
                            <div className={styles.formasIcones}>
                              <span className={styles.formaPix}>PIX</span>
                              <span className={styles.formaCartao}>Cartão</span>
                              <span className={styles.formaBoleto}>Boleto</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.infoPagamento}>
                          <span className={styles.pagamentoAprovado}>✅ Multa paga com sucesso!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.infoMultas}>
              <h3>ℹ️ Informações sobre Multas</h3>
              <ul>
                <li>💰 Valor da multa: <strong>R$ 2,00 por dia de atraso</strong></li>
                <li>💳 Pagamento online disponível via Mercado Pago</li>
                <li>🔒 Transações seguras e criptografadas</li>
                <li>📧 Confirmação de pagamento por e-mail</li>
                <li>✅ Após o pagamento, você poderá fazer novos empréstimos</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PagamentoMultas;