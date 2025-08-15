import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './style.css';
import CadastrarAluno from './cadastrarAluno';
import ListarAlunos from './ListarAlunos';
import EditarAluno from './EditarAluno';
import CadastrarLivro from './CadastrarLivro';
import ListarLivros from './ListarLivros';
import EditarLivro from './EditarLivro';
import CadastrarEmprestimo from './CadastrarEmprestimo';
import ListarEmprestimos from './ListarEmprestimos';
import CadastrarReserva from './CadastrarReserva';
import ListarReservas from './ListarReservas';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BookProvider } from './bookcontext';

function App() {
  return (
    <BookProvider>
      <Router>
        <div>
          {/* Navegação */}
          <nav style={{ marginBottom: '20px' }}>
            <strong>Alunos:</strong>
            <Link to="/"> Listar</Link> |
            <Link to="/cadastrar"> Cadastrar</Link> &nbsp;&nbsp;

            <strong>Livros:</strong>
            <Link to="/livros"> Listar</Link> |
            <Link to="/livros/cadastrar"> Cadastrar</Link> &nbsp;&nbsp;

            <strong>Empréstimos:</strong>
            <Link to="/emprestimos"> Listar</Link> |
            <Link to="/emprestimos/cadastrar"> Cadastrar</Link> &nbsp;&nbsp;

            <strong>Reservas:</strong>
            <Link to="/reservas"> Listar</Link> |
            <Link to="/reservas/cadastrar"> Cadastrar</Link>
          </nav>

          {/* Rotas */}
          <Routes>
            {/* Aluno */}
            <Route path="/" element={<ListarAlunos />} />
            <Route path="/cadastrar" element={<CadastrarAluno />} />
            <Route path="/editar/:id" element={<EditarAluno />} />

            {/* Livro */}
            <Route path="/livros" element={<ListarLivros />} />
            <Route path="/livros/cadastrar" element={<CadastrarLivro />} />
            <Route path="/livros/editar/:id" element={<EditarLivro />} />

            {/* Empréstimo */}
            <Route path="/emprestimos" element={<ListarEmprestimos />} />
            <Route path="/emprestimos/cadastrar" element={<CadastrarEmprestimo />} />

            {/* Reserva */}
            <Route path="/reservas" element={<ListarReservas />} />
            <Route path="/reservas/cadastrar" element={<CadastrarReserva />} />
          </Routes>

          {/* Container */}
          <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar={false} />
        </div>
      </Router>
    </BookProvider>
  );
}

export default App;
