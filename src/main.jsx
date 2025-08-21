import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const inicializarLocalStorage = () => {
  if (!localStorage.getItem('livros')) {
    localStorage.setItem('livros', JSON.stringify([]));
  }
};

inicializarLocalStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
