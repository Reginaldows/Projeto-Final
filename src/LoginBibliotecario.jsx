import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginBibliotecario.module.css';
import Acessibilidade from './Acessibilidade';

export default function LoginBibliotecario() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const formData = new URLSearchParams();
    formData.append('login', login);
    formData.append('senha', senha);

    try {
      const response = await fetch('http://localhost/php/login.php', {
        method: 'POST',
        credentials: 'include',
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

        // Verificar se o usuário é bibliotecário
        if (tipoUsuario === 'bibliotecario') {
          sessionStorage.setItem('userName', userName);
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('tipoUsuario', tipoUsuario);
          sessionStorage.setItem('userId', userId);
          
          console.log('Login bibliotecário bem-sucedido:', { userName, tipoUsuario });
          navigate('/bibliotecario');
        } else {
          setErro('Acesso restrito apenas para bibliotecários.');
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
    <div className={styles['login-bibliotecario-container']}>
      <div className={styles['login-bibliotecario-content']}>
        <div className={styles['logo-section']}>
          <img src="/img/logoSenai.png" alt="Senai" width="350" height="175" />
          <h1>Acesso Bibliotecário</h1>
          <p>Sistema de Gerenciamento da Biblioteca SENAI</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['login-form']}>
          <div className={styles.formulario}>
            <strong>
              Acesse sua conta de bibliotecário
            </strong>

            <div className={styles.campo}>
              <div className={styles.base}>
                <i className="fas fa-envelope" aria-hidden="true"></i>
                <label htmlFor="login">
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
                autoComplete="username"
              />
            </div>

            <div className={styles.campo}>
              <div className={styles.base}>
                <i className="fas fa-lock" aria-hidden="true"></i>
                <label htmlFor="senha">
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
                autoComplete="current-password"
              />
              <i
                className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.visibilidade}`}
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
              ></i>

              <div className={styles.esqueceu}>
                <Link to="/esquecisenha" className={styles['esqueceu-senha']}>
                  <b>Esqueci minha senha</b>
                </Link>
              </div>
            </div>

            {erro && (
              <div className={styles['mensagem-erro']} role="alert" aria-live="polite">
                {erro}
              </div>
            )}

            <button type="submit">
              Entrar
            </button>


          </div>
        </form>
      </div>
      <Acessibilidade />
    </div>
  );
}