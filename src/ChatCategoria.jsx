import React, { useState, useEffect } from 'react';
import styles from './chatflutuante.module.css';

const ChatCategoria = ({ categoria }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Lista de cores por categoria para manter consistência visual
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

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }

    // Carregar mensagens específicas da categoria do localStorage, se existirem
    const savedMessages = localStorage.getItem(`chatMessages_${categoria}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: 1,
          sender: 'Sistema',
          text: `Bem-vindo ao chat da categoria ${categoria}! Converse com outros usuários sobre livros desta categoria.`,
          timestamp: new Date().toISOString()
        }
      ]);
    }

    const handleStorageChange = () => {
      const currentLoginStatus = localStorage.getItem('isLoggedIn');
      const currentUserName = localStorage.getItem('userName');
      
      setIsLoggedIn(currentLoginStatus === 'true');
      setUserName(currentUserName || '');
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [categoria]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !isLoggedIn) return;

    const message = {
      id: Date.now(),
      sender: userName || 'Anônimo',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');
    
    // Salvar mensagens no localStorage para persistência
    localStorage.setItem(`chatMessages_${categoria}`, JSON.stringify(updatedMessages));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.chatContainer}>
      <button 
        className={styles.chatButton} 
        onClick={toggleChat}
        style={{ backgroundColor: coresCategorias[categoria] || '#0066b3' }}
        aria-label={`Abrir chat de ${categoria}`}
      >
        💬
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader} style={{ backgroundColor: coresCategorias[categoria] || '#0066b3' }}>
            <h3>Chat: {categoria}</h3>
            <button 
              className={styles.closeButton} 
              onClick={toggleChat}
              aria-label="Fechar chat"
            >
              ✖
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`${styles.message} ${message.sender === userName ? styles.myMessage : ''}`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>{message.sender}</span>
                  <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
                </div>
                <div className={styles.messageContent}>{message.text}</div>
              </div>
            ))}
          </div>
          
          <form className={styles.chatForm} onSubmit={handleSendMessage}>
            <input
              type="text"
              className={styles.chatInput}
              placeholder={isLoggedIn ? "Digite sua mensagem..." : "Faça login para enviar mensagens"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isLoggedIn}
            />
            <button 
              type="submit" 
              className={`${styles.sendButton} ${!isLoggedIn ? styles.disabledButton : ''}`}
              aria-label="Enviar mensagem"
              disabled={!isLoggedIn}
            >
              📤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatCategoria;