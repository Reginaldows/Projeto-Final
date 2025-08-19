import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Garantir que os dados do localStorage sejam carregados corretamente
const inicializarLocalStorage = () => {
  // Verificar se já existe uma chave 'livros' no localStorage
  if (!localStorage.getItem('livros')) {
    // Se não existir, inicializar com um array vazio
    localStorage.setItem('livros', JSON.stringify([]));
  }
};

// Inicializar localStorage
inicializarLocalStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
