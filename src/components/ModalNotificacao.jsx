import React from 'react';
import styles from './ModalNotificacao.module.css';

const ModalNotificacao = ({ isOpen, onClose, dadosEmprestimo }) => {
  if (!isOpen || !dadosEmprestimo) return null;

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.icone}>
            📚
          </div>
          <h3 className={styles.titulo}>Detalhes do Empréstimo</h3>
          <button className={styles.botaoFechar} onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.conteudo}>
          <div className={styles.livroInfo}>
            <img 
              src={dadosEmprestimo.livro.capa} 
              alt={dadosEmprestimo.livro.titulo}
              className={styles.capaLivro}
              onError={(e) => {
                e.target.src = '/img/Biblioteca.png';
              }}
            />
            <div className={styles.detalhes}>
              <h4 className={styles.tituloLivro}>{dadosEmprestimo.livro.titulo}</h4>
              <p className={styles.autorLivro}>por {dadosEmprestimo.livro.autor}</p>
              <div className={styles.dataInfo}>
                <span className={styles.labelData}>Data de Empréstimo:</span>
                <span className={styles.dataEmprestimo}>
                  {formatarData(dadosEmprestimo.datas.emprestimo)}
                </span>
              </div>
              <div className={styles.dataInfo}>
                <span className={styles.labelData}>Data de Devolução:</span>
                <span className={styles.dataDevolucao}>
                  {formatarData(dadosEmprestimo.datas.devolucao_prevista)}
                </span>
              </div>
              <div className={styles.diasInfo}>
                <span className={styles.diasEmprestimo}>
                  {dadosEmprestimo.datas.dias_emprestimo} dias de empréstimo
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p className={styles.mensagemEmail}>
            📧 Email de confirmação enviado!
          </p>
          <button className={styles.botaoOk} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNotificacao;