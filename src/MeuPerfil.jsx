import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './cadastroestante.module.css';
import { formatarCEP, buscarEnderecoPorCEP, formatarTelefone } from './scripts/validacaoCpfSenha';
import Mensagem from './mensagem';

const MeuPerfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Campos editáveis
  const [celular, setCelular] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [email, setEmail] = useState('');
  
  // Campos não editáveis
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  
  // Mensagem de feedback
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');

  // Buscar dados do usuário logado
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        
        // Verificar se o usuário está logado
        const userId = localStorage.getItem('userId');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!userId || isLoggedIn !== 'true') {
          navigate('/login');
          return;
        }
        
        const response = await fetch(`http://localhost/php/editarusuario.php?id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          const usuario = data.dados;
          // Preencher campos não editáveis
          setNome(usuario.nome || '');
          setCpf(usuario.cpf || '');
          setCep(usuario.cep || '');
          setCidade(usuario.cidade || '');
          setEstado(usuario.estado || '');
          setDataNasc(usuario.data_nasc || '');
          setTipoUsuario(usuario.tipo_usuario || '');
          
          // Preencher campos editáveis
          setCelular(usuario.celular || '');
          setRua(usuario.rua || '');
          setNumero(usuario.numero || '');
          setComplemento(usuario.complemento || '');
          setBairro(usuario.bairro || '');
          setEmail(usuario.email || '');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('id', userId);
    formData.append('nome', nome);
    formData.append('data_nasc', dataNasc);
    formData.append('cpf', cpf);
    formData.append('celular', celular);
    formData.append('cep', cep);
    formData.append('rua', rua);
    formData.append('numero', numero);
    formData.append('complemento', complemento);
    formData.append('bairro', bairro);
    formData.append('cidade', cidade);
    formData.append('estado', estado);
    formData.append('email', email);
    formData.append('tipo_usuario', tipoUsuario);

    try {
      const response = await fetch('http://localhost/php/editarusuario.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setMensagem('Perfil atualizado com sucesso!');
        setTipoMensagem('sucesso');
        
        // Atualizar o nome do usuário no localStorage se foi alterado
        if (nome !== localStorage.getItem('userName')) {
          localStorage.setItem('userName', nome);
        }
        
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
      } else {
        setMensagem(data.message);
        setTipoMensagem('erro');
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
      }
    } catch (error) {
      setMensagem('Erro ao atualizar: ' + error.message);
      setTipoMensagem('erro');
      setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 3000);
    }
  };

  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div className={styles.cadastroEstanteWrapper}>
      {mensagem && (
        <Mensagem 
          texto={mensagem} 
          tipo={tipoMensagem} 
          onClose={() => {
            setMensagem('');
            setTipoMensagem('');
          }}
        />
      )}
      
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 style={{ display: 'block', marginBottom: '20px', fontFamily: 'Arial, sans-serif', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Meu Perfil</h2>
          
          {/* Campos não editáveis */}
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome completo</label>
            <input type="text" id="nome" value={nome} readOnly className={styles.readOnly} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="data_nasc">Data de nascimento</label>
            <input
              type="date"
              id="data_nasc"
              name="data_nasc"
              value={dataNasc}
              readOnly
              className={styles.readOnly}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input 
              type="text" 
              id="cpf" 
              value={cpf}
              readOnly
              className={styles.readOnly}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cep">CEP</label>
            <input 
              type="text" 
              id="cep" 
              value={cep} 
              readOnly
              className={styles.readOnly}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cidade">Cidade</label>
            <input type="text" id="cidade" value={cidade} readOnly className={styles.readOnly} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estado">Estado</label>
            <input type="text" id="estado" value={estado} readOnly className={styles.readOnly} />
          </div>

          {/* Campos editáveis */}
          <div className={styles.formGroup}>
            <label htmlFor="celular">DDD e número de celular*</label>
            <input 
              type="tel" 
              id="celular" 
              value={celular} 
              onChange={e => setCelular(formatarTelefone(e.target.value))} 
              maxLength="15" 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail*</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rua">Rua*</label>
            <input type="text" id="rua" value={rua} onChange={e => setRua(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numero">Número*</label>
            <input type="text" id="numero" value={numero} onChange={e => setNumero(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="complemento">Complemento (opcional)</label>
            <input type="text" id="complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bairro">Bairro*</label>
            <input type="text" id="bairro" value={bairro} onChange={e => setBairro(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              className={styles.submitButton} 
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                display: 'block',
                width: '100%',
                textAlign: 'center'
              }}
            >
              Atualizar Perfil
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/biblioteca')} 
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                display: 'block',
                width: '100%',
                textAlign: 'center'
              }}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeuPerfil;