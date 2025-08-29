import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PagamentoSucesso.module.css';
import Acessibilidade from './Acessibilidade';

const PagamentoSucesso = () => {
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

        // Opcional: Fazer uma verificação adicional do status do pagamento
        // verificarStatusPagamento(paymentId);
    }, [searchParams]);

    const voltarParaMultas = () => {
        navigate('/meus-emprestimos');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconeContainer}>
                    <div className={styles.iconeSuccesso}>✓</div>
                </div>
                
                <h1 className={styles.titulo}>Pagamento Aprovado!</h1>
                
                <p className={styles.mensagem}>
                    Sua multa foi paga com sucesso. O pagamento foi processado e você receberá um email de confirmação em breve.
                </p>

                {dadosPagamento && (
                    <div className={styles.detalhes}>
                        <h3>Detalhes do Pagamento:</h3>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>ID do Pagamento:</span>
                            <span className={styles.valor}>{dadosPagamento.paymentId}</span>
                        </div>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.valor}>Aprovado</span>
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

export default PagamentoSucesso;