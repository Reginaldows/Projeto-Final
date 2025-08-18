import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './style.css';
import Login from './Login';
import Cadastro from './cadastro';
import RecuperarSenha from './esquecisenha';
import AlterarSenha from './alterarsenha';
import CadastroLivro from './CadastroLivro';
import Biblioteca from './Biblioteca';
import viteLogo from '/vite.svg';
import { iniciarScript } from './script';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Biblioteca />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esquecisenha" element={<RecuperarSenha />} />
        <Route path="/alterarsenha" element={<AlterarSenha/>} />
        <Route path="/cadastro-livro" element={<CadastroLivro />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

  