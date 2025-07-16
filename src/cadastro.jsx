import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatarCPF, validarCPF, validarRequisitosSenha } from './scripts/validacaoCpfSenha';
import Mensagem from './mensagem';
import Acessibilidade from './acessibilidade';
import './style.css';

export default function Cadastro() {
  const navigate = useNavigate();
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
  const [leituraAtiva, setLeituraAtiva] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');

  useEffect(() => {
    const resultado = validarRequisitosSenha(senha);

    setRequisitos({
      min: resultado.min,
      letras: resultado.letras,
      numero: resultado.numero,
      especial: resultado.especial,
    });

    setValido(resultado.valido && cpfValido === true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const formData = new URLSearchParams();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('email', email);
    formData.append('senha', senha);

    try {
      const response = await fetch('http://localhost/php/cadastro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.ok) {
        setMensagem('Conta criada com sucesso!');
        setTipoMensagem('sucesso');
        setTimeout(() => {
          setMensagem('');
          navigate('/');
        }, 3000);
      } else {
        const erro = await response.text();
        setMensagem('Erro ao criar conta: ' + erro);
        setTipoMensagem('erro');
        setTimeout(() => setMensagem(''), 5000);
      }
    } catch (err) {
      setMensagem('Erro na conexão com o servidor: ' + err.message);
      setTipoMensagem('erro');
      setTimeout(() => setMensagem(''), 5000);
    }
  };

  return (
    <>

    <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
    <div className="logo-cadastro">      
      <div className="topo">
        <div className="logo-senai">
          <img src="/img/logoSenai.png" alt="Senai" width="200" height="100" />
        </div>
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
            <p>A <em>senha</em> deve conter:</p>
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

      <Mensagem texto={mensagem} tipo={tipoMensagem} onClose={() => setMensagem('')} />
    </>
  );
}
