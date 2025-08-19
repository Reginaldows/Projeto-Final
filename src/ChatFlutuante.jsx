import React, { useState, useEffect } from 'react';
import styles from './ChatFlutuante.module.css';

const ChatFlutuante = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    const storedUserName = localStorage.getItem('userName');
    const loginStatus = localStorage.getItem('isLoggedIn');
    
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }


    setMessages([
      {
        id: 1,
        sender: 'Sistema',
        text: 'Bem-vindo ao chat da Biblioteca SENAI! Converse com outros usuários.',
        timestamp: new Date().toISOString()
      }
    ]);


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
  }, []);

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

    setMessages([...messages, message]);
    setNewMessage('');


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
        <i className="fas fa-comments"></i>
      </button>


      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>Chat da Biblioteca</h3>
            <button 
              className={styles.closeButton} 
              onClick={toggleChat}
              aria-label="Fechar chat"
            >
              <i className="fas fa-times"></i>
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
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatFlutuante;