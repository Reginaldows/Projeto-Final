import { useState } from "react";
import { Link } from 'react-router-dom';
import './style.css';  

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Formulário enviado!");
  };

  return (
    <>
      <div className="topo">
        <div className="logo-senai">
          <img src="/img/logoSenai.png" alt="Senai" width="200" height="100" />
        </div>
      </div>

      <div className="visual">
        <b>Biblioteca Senai</b>
        <p>Conhecimento que transforma: explore, aprenda e evolua com a Biblioteca do SENAI.</p>
        <img src="/img/biblioteca-senai.png" alt="Livros" width="320" height="200" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="formulario">
          <strong>
            Acesse sua conta e continue explorando o caminho do<br />
            conhecimento.
          </strong>

          <div className="campo">
            <div className="base">
              <i className="fas fa-envelope"></i>
              <label htmlFor="login">
                E-mail ou CPF (Apenas números)<span style={{ color: "red" }}>*</span>
              </label>
            </div>
            <input
              type="text"
              name="login"
              id="login"
              placeholder="Digite seu e-mail ou CPF"
              required
            />
          </div>

          <div className="campo">
            <div className="base">
              <i className="fas fa-lock"></i>
              <label htmlFor="senha">
                Senha<span style={{ color: "red" }}>*</span>
              </label>
            </div>
            <input
              name="senha"
              id="senha"   
              type={showPassword ? "text" : "password"} 
              placeholder="Digite sua senha"
              required
            />
            <i
              className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} visibilidade`}
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)} 
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowPassword(!showPassword);
              }}
            ></i>
            <div className="esqueceu">
              <a href="esquecisenha.html" className="esqueceu-senha">
                <b>Esqueci minha senha</b>
              </a>
            </div>
          </div>

          <button type="submit">Entrar</button>

          <div className="conta">
            <p>
              Não tem uma conta? <Link to="/cadastro">Crie aqui.</Link>
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
