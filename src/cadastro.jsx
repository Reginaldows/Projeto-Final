import { useState, useEffect } from 'react';
import { formatarCPF, validarCPF } from './script';
import './style.css';

export default function Cadastro() {
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(null);
  const [valido, setValido] = useState(false);
  const [requisitos, setRequisitos] = useState({
    min: false,
    letras: false,
    numero: false,
    especial: false,
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    const tem8 = senha.length >= 8;
    const temMaiMin = /[a-z]/.test(senha) && /[A-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

    setRequisitos({
      min: tem8,
      letras: temMaiMin,
      numero: temNumero,
      especial: temEspecial,
    });

    setValido(tem8 && temMaiMin && temNumero && temEspecial && cpfValido === true);
  }, [senha, cpfValido]);

  const handleCPFChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarCPF(valor);
    setCpf(formatado);

    const cpfLimpo = formatado.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      setCpfValido(validarCPF(cpfLimpo));
    } else {
      setCpfValido(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Conta criada com sucesso!');
  };

  return (
    <>
      <div className="topo">
        <div className="logo-senai">
          <img src="/img/logoSenai.png" alt="Senai" width="200" height="100" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="tela-cadastro">
          <p><strong>Crie sua conta e dê o primeiro passo rumo ao seu desenvolvimento!</strong></p>
          <img src="/img/cadastro-senai.png" alt="Cadastro" className="cadastro" />
        </div>

        <fieldset>
          <label htmlFor="nome" className="campos-obrig">Nome completo</label>
          <input type="text" name="nome" id="nome" placeholder="Digite seu nome completo" required />

          <label htmlFor="cpf" className="campos-obrig">CPF</label>
          <input
            type="text"
            name="cpf"
            id="cpf"
            placeholder="Digite seu cpf"
            maxLength="14"
            value={cpf}
            onChange={handleCPFChange}
            required
            className={cpfValido === false ? 'invalido' : ''}
          />
          {cpfValido === false && (
            <div id="cpf-erro" style={{ color: 'red', fontWeight: 'bold' }}>
              CPF inválido.
            </div>
          )}

          <label htmlFor="email" className="campos-obrig">E-mail</label>
          <input type="email" name="email" id="email" placeholder="Digite seu e-mail" required />

          <label htmlFor="senha" className="campos-obrig">Senha</label>
          <div className="campo-senha primeira-senha">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              name="senha"
              id="senha"
              placeholder="Digite sua senha"
              minLength="8"
              maxLength="14"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <i
              className={`fas ${mostrarSenha ? 'fa-eye-slash' : 'fa-eye'} visibilidade`}
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>

          <div className="verificacao">
            <p>A <b>senha</b> deve conter:</p>
            <ul className="lista">
              <li id="min-caracteres" className={requisitos.min ? 'validado' : ''}>
                <i className="fa-solid fa-circle"></i>
                <span>No mínimo 8 caracteres</span>
              </li>
              <li id="letras" className={requisitos.letras ? 'validado' : ''}>
                <i className="fa-solid fa-circle"></i>
                <span>Pelo menos uma letra maiúscula e minúscula</span>
              </li>
              <li id="numero" className={requisitos.numero ? 'validado' : ''}>
                <i className="fa-solid fa-circle"></i>
                <span>Pelo menos um número</span>
              </li>
              <li id="especial" className={requisitos.especial ? 'validado' : ''}>
                <i className="fa-solid fa-circle"></i>
                <span>Pelo menos um caractere especial</span>
              </li>
            </ul>
          </div>

          <button type="submit" id="btn-criar" disabled={!valido}>
            Criar conta
          </button>
          <p>
            <b><a href="/">Cancelar</a></b>
          </p>
        </fieldset>
      </form>
    </>
  );
}
