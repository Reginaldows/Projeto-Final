import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validarRequisitosSenha } from './scripts/validacaoCpfSenha';
import './style.css';

export default function AlterarSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate(); 

  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [requisitos, setRequisitos] = useState({
    min: false,
    letras: false,
    numero: false,
    especial: false,
    valido: false,
  });

  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const resultado = validarRequisitosSenha(senha);
    setRequisitos(resultado);
  }, [senha]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!senha || !confirmSenha) {
      setMensagem('Preencha todos os campos');
      setTipoMensagem('erro');
      return;
    }

    if (senha !== confirmSenha) {
      setMensagem('As senhas não coincidem');
      setTipoMensagem('erro');
      return;
    }

    if (!requisitos.valido) {
      setMensagem('A senha não atende aos critérios de segurança');
      setTipoMensagem('erro');
      return;
    }

    setCarregando(true);
    setMensagem('');

    try {
      const formData = new FormData();
      formData.append('senha', senha);
      formData.append('confirm-senha', confirmSenha);
      formData.append('token', token);

      const response = await fetch('http://localhost/php/alterarsenha.php', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.sucesso);
        setTipoMensagem('sucesso');
        setSenha('');
        setConfirmSenha('');

        setTimeout(() => {
          navigate('/');
        }, 2500);
      } else {
        setMensagem(data.erro || 'Erro ao atualizar senha');
        setTipoMensagem('erro');
      }
    } catch {
      setMensagem('Erro de conexão. Tente novamente.');
      setTipoMensagem('erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="alterar-senha">
      {mensagem && (
        <div className={`mensagem-email ${tipoMensagem}`}>
          {mensagem}
        </div>
      )}

      <div className="topo">
        <div className="logo-senai">
          <img src="/img/logoSenai.png" alt="Senai" width="200" height="100" />
        </div>
      </div>

      <p className="area-senha">
        <strong>Crie aqui sua nova senha e volte a aproveitar todos os recursos</strong>
      </p>

      <img src="/img/redefinirsenha.png" alt="Recuperar senha" className="redefinir-senha" />

      <form className="redefinir" id="form-redefinir" onSubmit={handleSubmit}>
        <input type="hidden" name="token" value={token || ''} />

        <div className="input-senha">
          <label htmlFor="senha" className="campos-obrig">Nova Senha</label>
          <input
            type={mostrarSenha ? 'text' : 'password'}
            name="senha"
            id="senha"
            placeholder="Digite sua nova senha"
            maxLength={50}
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

        <div className="input-senha">
          <label htmlFor="confirm-senha" className="campos-obrig">Confirme sua senha</label>
          <input
            type={mostrarConfirmar ? 'text' : 'password'}
            name="confirm-senha"
            id="confirm-senha"
            placeholder="Confirme sua senha"
            maxLength={50}
            required
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
          />
          <i
            className={`fas ${mostrarConfirmar ? 'fa-eye-slash' : 'fa-eye'} visibilidade`}
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
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

        <button type="submit" id="btn-criar" disabled={!requisitos.valido || carregando}>
          {carregando ? 'Enviando...' : 'Criar nova senha'}
        </button>
         <p>
            <b><a href="/">Cancelar</a></b>
          </p>
      </form>
    </div>
  );
}
