import React, { useState, useEffect } from 'react';
import styles from './chatflutuante.module.css';
import Acessibilidade from './acessibilidade';

const ChatFlutuante = ({ categoria }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [leituraAtiva, setLeituraAtiva] = useState(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }

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
        aria-label="Abrir chat"
      >
        💬
      </button>


      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
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
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
    </div>
  );
};

export default ChatFlutuante;