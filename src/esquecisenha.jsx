import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatarCPF, validarCPF } from './scripts/validacaoCpfSenha';
import './style.css';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(null);
  const [valido, setValido] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setValido(cpfValido === true);
  }, [cpfValido]);

  const handleCPFChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarCPF(valor);
    setCpf(formatado);

    if (mensagem) {
      setMensagem('');
      setTipoMensagem('');
    }

    const cpfLimpo = formatado.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      setCpfValido(validarCPF(cpfLimpo));
    } else {
      setCpfValido(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!valido) return;

    setCarregando(true);
    setMensagem('');
    setTipoMensagem('');

    try {
      const response = await fetch('http://localhost/ProjetoFinal/enviar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpf
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Link de redefinição enviado para o e-mail cadastrado!');
        setTipoMensagem('sucesso');
        
        setTimeout(() => {
          setCpf('');
          setCpfValido(null);
          setMensagem('');
          setTipoMensagem('');
        }, 5000);
      } else {
        setMensagem(data.erro || 'Erro ao enviar email');
        setTipoMensagem('erro');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro de conexão. Tente novamente.');
      setTipoMensagem('erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <div className="topo-senha">
        <div className="topo">
          <div className="logo-senai">
            <img src="img/logoSenai.png" alt="Senai" />
          </div>
        </div>
      </div>

      <p className="help">
        <strong>Esqueceu a senha?</strong> Tudo bem! Vamos te ajudar a acessar sua conta novamente.
      </p>

      <img src="img/recuperarsenha.png" alt="Recuperar senha" className="img-senha" />

      <form id="formRecuperar" className="alterarsenha" onSubmit={handleSubmit}>
        <p>Digite seu CPF para enviarmos um link de redefinição de senha para seu e-mail cadastrado.</p>

        <div className="campos">
          <label htmlFor="cpf" className="campos-obrig">CPF</label>
          <input
            type="text"
            name="cpf"
            id="cpf"
            placeholder="Digite seu CPF"
            maxLength="14"
            value={cpf}
            onChange={handleCPFChange}
            required
            className={cpfValido === false ? 'invalido' : ''}
            disabled={carregando}
          />
          {cpfValido === false && (
            <div id="cpf-erro" style={{ color: 'red', fontWeight: 'bold' }}>
              CPF inválido.
            </div>
          )}
        </div>

        <button type="submit" disabled={!valido || carregando}>
          {carregando ? 'Enviando...' : 'Receber link de redefinição'}
        </button>
      </form>

      {mensagem && (
        <p style={{ 
          color: tipoMensagem === 'sucesso' ? 'green' : 'red', 
          marginTop: '1rem', 
          fontWeight: 'bold' 
        }}>
          {mensagem}
        </p>
      )}
    </>
  );
}