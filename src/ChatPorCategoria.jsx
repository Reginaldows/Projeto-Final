import React, { useState, useEffect } from 'react';
import ChatFlutuante from './ChatFlutuante';
import styles from './chatflutuante.module.css';
import Acessibilidade from './Acessibilidade';

const ChatPorCategoria = ({ categorias }) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  const coresCategorias = {
    'Ficção': '#000000',
    'Romance': '#006400',
    'Mistério': '#8B0000',
    'Fantasia': '#FF1493',
    'Ficção Científica': '#4B0082',
    'Biografia': '#FF8C00',
    'História': '#4682B4',
    'Ciência': '#8B4513',
    'Tecnologia': '#9ACD32',
    'Autoajuda': '#0066b3',
    'Outras': '#800080'
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const selecionarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria);
    setMenuAberto(false);
  };

  return (
    <div className={styles.chatCategoriaContainer}>
      <button 
        className={styles.chatCategoriaButton} 
        onClick={toggleMenu}
        style={{ backgroundColor: categoriaSelecionada ? coresCategorias[categoriaSelecionada] || '#0066b3' : '#0066b3' }}
        aria-label="Selecionar categoria para chat"
      >
        💬
        {categoriaSelecionada && <span className={styles.categoriaIndicator}></span>}
      </button>

      {menuAberto && (
        <div className={styles.categoriasMenu}>
          <div className={styles.categoriasHeader}>
            <h3>Escolha uma categoria</h3>
            <button 
              className={styles.closeButton} 
              onClick={toggleMenu}
              aria-label="Fechar menu de categorias"
            >
              ✖
            </button>
          </div>
          <div className={styles.categoriasList}>
            {categorias.map((categoria, index) => (
              <button 
                key={index} 
                className={styles.categoriaItem}
                style={{ borderLeft: `4px solid ${coresCategorias[categoria] || '#0066b3'}` }}
                onClick={() => selecionarCategoria(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      )}

      {categoriaSelecionada && <ChatFlutuante categoria={categoriaSelecionada} />}
      <Acessibilidade />
    </div>
  );
};

export default ChatPorCategoria;