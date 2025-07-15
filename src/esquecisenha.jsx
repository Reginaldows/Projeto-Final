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
    setMensagem('Enviando...');
    setTipoMensagem('info');

    try {
      console.log('Enviando CPF:', cpf);

      const response = await fetch('http://localhost/php/enviar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
        }),
      });

      const contentType = response.headers.get('Content-Type');

      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('Resposta não-JSON:', textResponse);
        throw new Error('Servidor retornou formato inválido');
      }

      if (response.ok) {
        setMensagem(data.sucesso || 'Link de redefinição enviado para o e-mail cadastrado!');
        setTipoMensagem('sucesso');

        setTimeout(() => {
          setCpf('');
          setCpfValido(null);
          setMensagem('');
          setTipoMensagem('');
        }, 2500);
      } else {
        setMensagem(data.erro || 'Erro ao enviar email');
        setTipoMensagem('erro');
      }
    } catch (error) {
      console.error('Erro completo:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMensagem('Erro de conexão. Verifique se o servidor está rodando.');
      } else if (error.message.includes('JSON')) {
        setMensagem('Erro na comunicação com o servidor. Tente novamente.');
      } else {
        setMensagem('Erro de conexão. Tente novamente.');
      }

      setTipoMensagem('erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      {mensagem && (
        <div className={`mensagem-email ${tipoMensagem}`}>
          {mensagem}
        </div>
      )}

      <div className="topo-senha" style={{ paddingTop: mensagem ? '50px' : 0 }}>
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
          <label htmlFor="cpf" className="campos-obrig">
            CPF
          </label>
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
          Receber link de redefinição
        </button>
      </form>
    </>
  );
}
