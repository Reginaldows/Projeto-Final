import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './style.css';
import Login from './Login';
import LoginBibliotecario from './LoginBibliotecario';
import Cadastro from './cadastro';
import CadastroUsuario from './cadastroUsuario';
import RecuperarSenha from './esquecisenha';
import AlterarSenha from './alterarsenha';
import CadastroLivro from './CadastroLivro';
import EditarLivro from './EditarLivro';
import EditarUsuario from './EditarUsuario';
import MeuPerfil from './MeuPerfil';
import MeusEmprestimos from './MeusEmprestimos';
import GerenciarEmprestimos from './GerenciarEmprestimos';
import Biblioteca from './Biblioteca';
import BibliotecaBibliotecario from './BibliotecaBibliotecario';
import ListaUsuarios from './ListaUsuarios';
import Relatorios from './Relatorios';
import PagamentoMultas from './PagamentoMultas';
import PagamentoSucesso from './PagamentoSucesso';
import PagamentoFalha from './PagamentoFalha';
import PagamentoPendente from './PagamentoPendente';
import ListagemEstoque from './estoque';
import InventarioEstoquePDF from './InventarioEstoquePDF';
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
        <Route path="/login-bibliotecario" element={<LoginBibliotecario />} />

        <Route path="/usuarios" element={<ListaUsuarios />} />
        <Route path="/editarusuario/:id" element={<EditarUsuario />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/meus-emprestimos" element={<MeusEmprestimos />} />
        <Route path="/gerenciar-emprestimos" element={<GerenciarEmprestimos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/pagamento-multas" element={<PagamentoMultas />} />
        <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
        <Route path="/pagamento-falha" element={<PagamentoFalha />} />
        <Route path="/pagamento-pendente" element={<PagamentoPendente />} />
        <Route path="/estoque" element={<ListagemEstoque />} />
        <Route path="/estoquePDF" element={<InventarioEstoquePDF />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

  