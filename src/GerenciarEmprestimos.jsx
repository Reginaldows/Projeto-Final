import React, { useState, useEffect } from 'react';
import styles from './gerenciaremprestimos.module.css';

const GerenciarEmprestimos = () => {
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('cpf'); // 'cpf' ou 'livro'
    const [showModal, setShowModal] = useState(false);
    const [selectedEmprestimo, setSelectedEmprestimo] = useState(null);
    const [processingDevolucao, setProcessingDevolucao] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Carregar todos os empréstimos em aberto ao inicializar
    useEffect(() => {
        carregarEmprestimos();
    }, []);

    const carregarEmprestimos = async (filtro = '') => {
        setLoading(true);
        try {
            const response = await fetch('/php/listar_emprestimos_bibliotecario.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filtro: filtro,
                    tipo_filtro: searchType
                })
            });

            const data = await response.json();
            if (data.success) {
                setEmprestimos(data.emprestimos || []);
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.message });
                setEmprestimos([]);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao carregar empréstimos' });
            setEmprestimos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        carregarEmprestimos(searchTerm);
    };

    const calcularMulta = (dataPrevista) => {
        const hoje = new Date();
        const dataVencimento = new Date(dataPrevista);
        const diffTime = hoje - dataVencimento;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            // R$ 2,00 por dia de atraso
            return diffDays * 2.00;
        }
        return 0;
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const getStatusEmprestimo = (dataPrevista) => {
        const hoje = new Date();
        const dataVencimento = new Date(dataPrevista);
        const diffTime = dataVencimento - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { status: 'atrasado', dias: Math.abs(diffDays) };
        } else if (diffDays <= 3) {
            return { status: 'vencendo', dias: diffDays };
        }
        return { status: 'normal', dias: diffDays };
    };

    const abrirModalDevolucao = (emprestimo) => {
        const multa = calcularMulta(emprestimo.data_prevista_devolucao);
        setSelectedEmprestimo({ ...emprestimo, multa });
        setShowModal(true);
    };

    const confirmarDevolucao = async () => {
        if (!selectedEmprestimo) return;
        
        setProcessingDevolucao(true);
        try {
            const response = await fetch('/php/processar_devolucao.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emprestimo_id: selectedEmprestimo.id
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Devolução registrada com sucesso!' });
                setShowModal(false);
                setSelectedEmprestimo(null);
                // Recarregar a lista de empréstimos
                carregarEmprestimos(searchTerm);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao processar devolução' });
        } finally {
            setProcessingDevolucao(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Gerenciar Empréstimos</h1>
                <p>Controle de empréstimos e devoluções da biblioteca</p>
            </div>

            {/* Barra de Pesquisa */}
            <div className={styles.searchSection}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchControls}>
                        <select 
                            value={searchType} 
                            onChange={(e) => setSearchType(e.target.value)}
                            className={styles.searchType}
                        >
                            <option value="cpf">Buscar por CPF</option>
                            <option value="usuario">Buscar por Nome</option>
                            <option value="livro">Buscar por Livro</option>
                        </select>
                        
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Digite o ${searchType === 'cpf' ? 'CPF' : searchType === 'usuario' ? 'nome do usuário' : 'título do livro'}...`}
                            className={styles.searchInput}
                        />
                        
                        <button type="submit" className={styles.searchButton} disabled={loading}>
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => {
                                setSearchTerm('');
                                carregarEmprestimos();
                            }}
                            className={styles.clearButton}
                        >
                            Limpar
                        </button>
                    </div>
                </form>
            </div>

            {/* Mensagens */}
            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Tabela de Empréstimos */}
            <div className={styles.tableSection}>
                {loading ? (
                    <div className={styles.loading}>Carregando empréstimos...</div>
                ) : emprestimos.length === 0 ? (
                    <div className={styles.noData}>Nenhum empréstimo encontrado</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>CPF</th>
                                    <th>Livro</th>
                                    <th>Data Empréstimo</th>
                                    <th>Data Prevista</th>
                                    <th>Status</th>
                                    <th>Multa</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emprestimos.map((emprestimo) => {
                                    const statusInfo = getStatusEmprestimo(emprestimo.data_prevista_devolucao);
                                    const multa = calcularMulta(emprestimo.data_prevista_devolucao);
                                    
                                    return (
                                        <tr key={emprestimo.id} className={styles[statusInfo.status]}>
                                            <td>{emprestimo.usuario_nome}</td>
                                            <td>{emprestimo.usuario_cpf}</td>
                                            <td>
                                                <div className={styles.bookInfo}>
                                                    <strong>{emprestimo.titulo}</strong>
                                                    <small>por {emprestimo.autor}</small>
                                                </div>
                                            </td>
                                            <td>{formatarData(emprestimo.data_emprestimo)}</td>
                                            <td>{formatarData(emprestimo.data_prevista_devolucao)}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[statusInfo.status]}`}>
                                                    {statusInfo.status === 'atrasado' ? `Atrasado ${statusInfo.dias}d` :
                                                     statusInfo.status === 'vencendo' ? `Vence em ${statusInfo.dias}d` :
                                                     'No prazo'}
                                                </span>
                                            </td>
                                            <td>
                                                {multa > 0 ? (
                                                    <span className={styles.multa}>R$ {multa.toFixed(2)}</span>
                                                ) : (
                                                    <span className={styles.semMulta}>-</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => abrirModalDevolucao(emprestimo)}
                                                    className={styles.devolucaoButton}
                                                >
                                                    Registrar Devolução
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Devolução */}
            {showModal && selectedEmprestimo && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Confirmar Devolução</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.infoGroup}>
                                <label>Nome do Usuário:</label>
                                <span>{selectedEmprestimo.usuario_nome}</span>
                            </div>
                            
                            <div className={styles.infoGroup}>
                                <label>CPF:</label>
                                <span>{selectedEmprestimo.usuario_cpf}</span>
                            </div>
                            
                            <div className={styles.infoGroup}>
                                <label>Livro Emprestado:</label>
                                <span>
                                    <strong>{selectedEmprestimo.titulo}</strong>
                                    <br />
                                    <small>por {selectedEmprestimo.autor}</small>
                                </span>
                            </div>
                            
                            <div className={styles.infoGroup}>
                                <label>Data Prevista de Devolução:</label>
                                <span>{formatarData(selectedEmprestimo.data_prevista_devolucao)}</span>
                            </div>
                            
                            {selectedEmprestimo.multa > 0 && (
                                <div className={styles.infoGroup}>
                                    <label>Multa por Atraso:</label>
                                    <span className={styles.multaValor}>
                                        R$ {selectedEmprestimo.multa.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.modalActions}>
                            <button
                                onClick={() => setShowModal(false)}
                                className={styles.cancelButton}
                                disabled={processingDevolucao}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarDevolucao}
                                className={styles.confirmButton}
                                disabled={processingDevolucao}
                            >
                                {processingDevolucao ? 'Processando...' : 'Confirmar Devolução'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarEmprestimos;