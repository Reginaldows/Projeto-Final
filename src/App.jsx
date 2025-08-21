import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './style.css';
import Login from './Login';
import Cadastro from './cadastro';
import CadastroUsuario from './cadastroUsuario';
import RecuperarSenha from './esquecisenha';
import AlterarSenha from './alterarsenha';
import CadastroLivro from './CadastroLivro';
import EditarLivro from './EditarLivro';
import Biblioteca from './Biblioteca';
import BibliotecaBibliotecario from './BibliotecaBibliotecario';
import viteLogo from '/vite.svg';
import { iniciarScript } from './script';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Biblioteca />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/bibliotecario" element={<BibliotecaBibliotecario />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastrousuario" element={<CadastroUsuario />} />
        <Route path="/esquecisenha" element={<RecuperarSenha />} />
        <Route path="/alterarsenha" element={<AlterarSenha/>} />
        <Route path="/cadastro-livro" element={<CadastroLivro />} />
        <Route path="/cadastrolivro" element={<CadastroLivro />} />
        <Route path="/editar-livro/:id" element={<EditarLivro />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

  