import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Acessibilidade from './acessibilidade';
import './style.css';

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [leituraAtiva, setLeituraAtiva] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const formData = new URLSearchParams();
    formData.append('login', login);
    formData.append('senha', senha);

    try {
      const response = await fetch('http://localhost/php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch {
        console.error('Resposta do servidor não é JSON válido:', text);
        setErro('Erro interno do servidor.');
        return;
      }

      if (response.ok && responseData.success) {
        const userName = responseData.nome || 'Usuário';
        const tipoUsuario = responseData.tipo_usuario || 'aluno';
        const userId = responseData.id || '';

        localStorage.clear();
        
        localStorage.setItem('userName', userName);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('tipoUsuario', tipoUsuario);
        localStorage.setItem('userId', userId);

        console.log('Login bem-sucedido:', { userName, tipoUsuario });
        
        if (tipoUsuario === 'bibliotecario') {
          navigate('/bibliotecario');
        } else {
          navigate('/');
        }
      } else {
        setErro(responseData.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro na conexão:', error);
      setErro('Erro na conexão com o servidor.');
    }
  };

  return (
    <>
      <Acessibilidade
        leituraAtiva={leituraAtiva}
        setLeituraAtiva={setLeituraAtiva}
      />
      <div className="conteudo-principal">
        <div className="topo">
          <div
            className="logo-senai"
            tabIndex={0}
            role="img"
            aria-label="Logotipo Senai"
            data-leitura="Logotipo Senai"
          >
            <img src="/img/logoSenai.png" alt="Senai" width="200" height="100" />
          </div>
        </div>

        <div
          className="visual"
          tabIndex={0}
          role="banner"
          aria-label="Seção principal da biblioteca"
          data-leitura="Biblioteca Senai. Conhecimento que transforma: explore, aprenda e evolua com a Biblioteca do SENAI."
        >
          <b>Biblioteca Senai</b>
          <p>
            Conhecimento que transforma: explore, aprenda e evolua com a Biblioteca do SENAI.
          </p>
          <img src="/img/biblioteca-senai.png" alt="Livros" width="320" height="200" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formulario">
            <strong
              data-leitura="Acesse sua conta e continue explorando o caminho do conhecimento."
              tabIndex={0}
              role="heading"
              aria-level="2"
            >
              Acesse sua conta e continue explorando o caminho do
              <br />
              conhecimento.
            </strong>

            <div className="campo">
              <div className="base">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <label htmlFor="login" tabIndex={0} data-leitura="E-mail ou CPF, apenas números">
                  E-mail ou CPF (Apenas números)
                  <span aria-label="Campo obrigatório">*</span>
                </label>
              </div>
              <input
                type="text"
                name="login"
                id="login"
                placeholder="Digite seu e-mail ou CPF"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                aria-describedby="login-help"
                data-leitura="Digite seu e-mail ou CPF"
                autoComplete="username"
              />
            </div>

            <div className="campo">
              <div className="base">
                <i className="fas fa-lock" aria-hidden="true"></i>
                <label htmlFor="senha" tabIndex={0} data-leitura="Senha">
                  Senha
                  <span aria-label="Campo obrigatório">*</span>
                </label>
              </div>
              <input
                name="senha"
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                aria-describedby="senha-help"
                data-leitura="Digite sua senha"
                autoComplete="current-password"
              />
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} visibilidade`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }
                }}
                data-leitura={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              ></i>

              <div className="esqueceu">
                <Link to="/esquecisenha" className="esqueceu-senha" data-leitura="Esqueci minha senha">
                  <b>Esqueci minha senha</b>
                </Link>
              </div>
            </div>

            {erro && (
              <div className="mensagem-erro" role="alert" aria-live="polite" data-leitura={`Erro: ${erro}`}>
                {erro}
              </div>
            )}

            <button type="submit" aria-describedby="btn-entrar-help" data-leitura="Botão Entrar">
              Entrar
            </button>

            <div className="conta">
              <p>
                Não tem uma conta? <Link to="/cadastroUsuario" data-leitura="Crie aqui">Crie aqui.</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}