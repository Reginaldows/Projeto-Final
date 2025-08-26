import React, { useState, useEffect } from 'react';
import styles from './NotificacaoReserva.module.css';

const NotificacaoReserva = ({ notificacao, onClose }) => {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImprimir = () => {
    const conteudoImpressao = `
      BIBLIOTECA SENAI - COMPROVANTE DE PRÉ-RESERVA
      
      ==========================================
      
      Livro: ${notificacao.livro.titulo}
      Autor: ${notificacao.livro.autor}
      
      Código da Reserva: ${notificacao.reserva.codigo_reserva}
      Posição na fila: ${notificacao.reserva.posicao_fila}º
      Válida até: ${formatarData(notificacao.reserva.data_expiracao)}
      
      ==========================================
      
      Data de impressão: ${new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
      
      Guarde este comprovante para consultas futuras.
    `;
    
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Comprovante de Pré-reserva</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${conteudoImpressao}</pre>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  if (!notificacao) return null;

  return (
    <div className={`${styles.overlay} ${visible ? styles.visible : ''}`}>
      <div className={`${styles.notificacao} ${visible ? styles.slideIn : styles.slideOut}`}>
        <div className={styles.header}>
          <div className={styles.icone}>
            ⏰
          </div>
          <h3 className={styles.titulo}>Pré-reserva Realizada com Sucesso!</h3>
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
              
              <div className={styles.codigoInfo}>
                <span className={styles.labelCodigo}>Código da Reserva:</span>
                <span className={styles.codigoReserva}>
                  {notificacao.reserva.codigo_reserva}
                </span>
              </div>
              
              <div className={styles.posicaoInfo}>
                <span className={styles.labelPosicao}>Posição na fila:</span>
                <span className={styles.posicaoFila}>
                  {notificacao.reserva.posicao_fila}º
                </span>
              </div>
              
              <div className={styles.dataInfo}>
                <span className={styles.labelData}>Válida até:</span>
                <span className={styles.dataExpiracao}>
                  {formatarData(notificacao.reserva.data_expiracao)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <p className={styles.mensagemEmail}>
            📧 Um email de confirmação foi enviado para você!
          </p>
          <button className={styles.botaoImprimir} onClick={handleImprimir}>
            🖨️ Imprimir Comprovante
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacaoReserva;