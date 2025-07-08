import React from 'react';

export default function Mensagem({ texto, tipo, onClose }) {
  if (!texto) return null; 

  const estilosBase = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    maxWidth: '90%',
    width: 'auto',
    textAlign: 'center',
    padding: '15px 25px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tipos = {
    sucesso: {
      color: '#155724',
      backgroundColor: '#d4edda',
      border: '2px solid #c3e6cb',
    },
    erro: {
      color: '#721c24',
      backgroundColor: '#f8d7da',
      border: '2px solid #f5c6cb',
    },
    carregando: {
      color: '#004085',
      backgroundColor: '#cce7ff',
      border: '2px solid #7bb3ff',
    },
  };

  const estiloAtual = tipos[tipo] || {};

  return (
    <div style={{ ...estilosBase, ...estiloAtual }} onClick={onClose}>
      {texto}
    </div>
  );
}
