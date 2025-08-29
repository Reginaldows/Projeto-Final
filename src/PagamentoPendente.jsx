import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './PagamentoPendente.module.css';
import Acessibilidade from './Acessibilidade';

const PagamentoPendente = () => {
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

    const verificarStatus = () => {
        // Redirecionar para a tela de multas para verificar o status
        navigate('/meus-emprestimos');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconeContainer}>
                    <div className={styles.iconePendente}>
                        <div className={styles.spinner}></div>
                    </div>
                </div>
                
                <h1 className={styles.titulo}>Pagamento Pendente</h1>
                
                <p className={styles.mensagem}>
                    Seu pagamento está sendo processado. Isso pode levar alguns minutos, dependendo do método de pagamento escolhido.
                </p>

                <div className={styles.informacoes}>
                    <h3>Próximos passos:</h3>
                    <div className={styles.passo}>
                        <div className={styles.numeroPasso}>1</div>
                        <div className={styles.textoPasso}>
                            <strong>PIX:</strong> Se você escolheu PIX, complete o pagamento no seu banco ou app de pagamentos.
                        </div>
                    </div>
                    <div className={styles.passo}>
                        <div className={styles.numeroPasso}>2</div>
                        <div className={styles.textoPasso}>
                            <strong>Boleto:</strong> Se você escolheu boleto, pague-o até a data de vencimento.
                        </div>
                    </div>
                    <div className={styles.passo}>
                        <div className={styles.numeroPasso}>3</div>
                        <div className={styles.textoPasso}>
                            <strong>Cartão:</strong> Se você escolheu cartão, aguarde a confirmação do banco.
                        </div>
                    </div>
                </div>

                <div className={styles.aviso}>
                    <p>
                        <strong>Importante:</strong> Você receberá um email de confirmação assim que o pagamento for aprovado. 
                        Também pode verificar o status na seção "Meus Empréstimos".
                    </p>
                </div>

                {dadosPagamento && dadosPagamento.paymentId && (
                    <div className={styles.detalhes}>
                        <h3>Detalhes do Pagamento:</h3>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>ID do Pagamento:</span>
                            <span className={styles.valor}>{dadosPagamento.paymentId}</span>
                        </div>
                        <div className={styles.detalheItem}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.valor}>Pendente</span>
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
                        className={styles.botaoVerificar}
                        onClick={verificarStatus}
                    >
                        Verificar Status
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

export default PagamentoPendente;