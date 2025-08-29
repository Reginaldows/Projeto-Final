import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PagamentoFalha.module.css';
import Acessibilidade from './Acessibilidade';

const PagamentoFalha = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [dadosPagamento, setDadosPagamento] = useState(null);

    useEffect(() => {
        // Capturar parâmetros da URL do Mercado Pago
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const externalReference = searchParams.get('external_reference');
        const preferenceId = searchParams.get('preference_id');

        setDadosPagamento({
            paymentId,
            status,
            externalReference,
            preferenceId
        });
    }, [searchParams]);

    const voltarParaMultas = () => {
        navigate('/meus-emprestimos');
    };

    const tentarNovamente = () => {
        // Redirecionar para a tela de multas para tentar o pagamento novamente
        navigate('/meus-emprestimos');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconeContainer}>
                    <div className={styles.iconeFalha}>✗</div>
                </div>
                
                <h1 className={styles.titulo}>Pagamento Não Aprovado</h1>
                
                <p className={styles.mensagem}>
                    Infelizmente, não foi possível processar seu pagamento. Isso pode ter acontecido por diversos motivos, como dados incorretos, saldo insuficiente ou problemas técnicos.
                </p>

                <div className={styles.sugestoes}>
                    <h3>O que você pode fazer:</h3>
                    <ul>
                        <li>Verificar os dados do cartão ou método de pagamento</li>
                        <li>Tentar com outro cartão ou método de pagamento</li>
                        <li>Entrar em contato com seu banco</li>
                        <li>Tentar novamente em alguns minutos</li>
                    </ul>
                </div>

                {dadosPagamento && dadosPagamento.paymentId && (
                    <div className={styles.detalhes}>
                        <h3>Detalhes da Tentativa:</h3>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>ID da Tentativa:</span>
                            <span className={styles.valor}>{dadosPagamento.paymentId}</span>
                        </div>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.valor}>Rejeitado</span>
                        </div>
                        {dadosPagamento.externalReference && (
                            <div className={styles.detalheItem}>
                                <span className={styles.label}>Referência:</span>
                                <span className={styles.valor}>{dadosPagamento.externalReference}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.acoes}>
                    <button 
                        className={styles.botaoTentarNovamente}
                        onClick={tentarNovamente}
                    >
                        Tentar Novamente
                    </button>
                    <button 
                        className={styles.botaoVoltar}
                        onClick={voltarParaMultas}
                    >
                        Voltar para Meus Empréstimos
                    </button>
                </div>
            </div>
            <Acessibilidade />
        </div>
    );
};

export default PagamentoFalha;