import React, { useState, useEffect } from 'react';
import styles from './NotificacaoEmprestimo.module.css';

const NotificacaoEmprestimo = ({ notificacao, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notificacao) {
      setVisible(true);
      // Auto-close após 8 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [notificacao]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Aguarda a animação de saída
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!notificacao) return null;

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : ''}`}>
      <div className={`${styles.notificacao} ${visible ? styles.slideIn : styles.slideOut}`}>
        <div className={styles.header}>
          <div className={styles.icone}>
            📚
          </div>
          <h3 className={styles.titulo}>Empréstimo Realizado com Sucesso!</h3>
          <button className={styles.botaoFechar} onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className={styles.conteudo}>
          <div className={styles.livroInfo}>
            <img 
              src={notificacao.livro.capa} 
              alt={notificacao.livro.titulo}
              className={styles.capaLivro}
              onError={(e) => {
                e.target.src = '/public/img/Biblioteca.png';
              }}
            />
            <div className={styles.detalhes}>
              <h4 className={styles.tituloLivro}>{notificacao.livro.titulo}</h4>
              <p className={styles.autorLivro}>por {notificacao.livro.autor}</p>
              <div className={styles.dataInfo}>
                <span className={styles.labelData}>Data de Devolução:</span>
                <span className={styles.dataDevolucao}>
                  {formatarData(notificacao.datas.devolucao_prevista)}
                </span>
              </div>
              <div className={styles.diasInfo}>
                <span className={styles.diasEmprestimo}>
                  {notificacao.datas.dias_emprestimo} dias de empréstimo
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p className={styles.mensagemEmail}>
            📧 Um email de confirmação foi enviado para você!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificacaoEmprestimo;