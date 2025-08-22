import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './cadastroestante.module.css';
import { formatarCPF, validarCPF, formatarCEP, buscarEnderecoPorCEP, formatarTelefone } from './scripts/validacaoCpfSenha';

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(null);
  const [cep, setCep] = useState('');
  const [celular, setCelular] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [atualizacaoSucesso, setAtualizacaoSucesso] = useState(false);

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost/php/editarusuario.php?id=${id}`);
        const data = await response.json();
        
        if (data.success) {
          const usuario = data.dados;
          setNome(usuario.nome || '');
          setCpf(usuario.cpf || '');
          setCpfValido(usuario.cpf ? validarCPF(usuario.cpf.replace(/\D/g, '')) : null);
          setCep(usuario.cep || '');
          setCelular(usuario.celular || '');
          setRua(usuario.rua || '');
          setNumero(usuario.numero || '');
          setComplemento(usuario.complemento || '');
          setBairro(usuario.bairro || '');
          setCidade(usuario.cidade || '');
          setEstado(usuario.estado || '');
          setDataNasc(usuario.data_nasc || '');
          setEmail(usuario.email || '');
          setTipoUsuario(usuario.tipo_usuario || '');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUsuario();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', id);
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
        setAtualizacaoSucesso(true);
        setMensagem('Usuário atualizado com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/usuarios');
        }, 2000);
      } else {
        setMensagem(data.message);
      }
    } catch (error) {
      setMensagem('Erro ao atualizar: ' + error.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div className={styles.cadastroEstanteWrapper}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 style={{ display: 'block', marginBottom: '20px', fontFamily: 'Arial, sans-serif', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Editar Usuário</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome completo*</label>
            <input type="text" id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="data_nasc">Data de nascimento</label>
            <input
              type="date"
              id="data_nasc"
              name="data_nasc"
              value={dataNasc}
              onChange={e => setDataNasc(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF*</label>
            <input 
              type="text" 
              id="cpf" 
              value={cpf}
              onChange={e => {
                const formatado = formatarCPF(e.target.value);
                setCpf(formatado);
                const cpfLimpo = formatado.replace(/\D/g, '');
                setCpfValido(cpfLimpo.length === 11 ? validarCPF(cpfLimpo) : null);
              }}
              maxLength="14"
              required
              className={cpfValido === false ? styles.invalido : ''}
            />
            {cpfValido === false && <small className={styles.erro}>CPF inválido.</small>}
          </div>

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
            <label htmlFor="cep">CEP*</label>
            <input 
              type="text" 
              id="cep" 
              value={cep} 
              onChange={e => {
                const formatado = formatarCEP(e.target.value);
                setCep(formatado);
                if (formatado.replace(/\D/g,'').length === 8) {
                  buscarEnderecoPorCEP(formatado, setRua, setBairro, setCidade, setEstado);
                }
              }}
              maxLength="9" 
              required 
            />
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

          <div className={styles.formGroup}>
            <label htmlFor="cidade">Cidade*</label>
            <input type="text" id="cidade" value={cidade} onChange={e => setCidade(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="estado">Estado*</label>
            <select id="estado" value={estado} onChange={e => setEstado(e.target.value)} required>
              <option value="">Selecione...</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(sigla => (
                <option key={sigla} value={sigla}>{sigla}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail*</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tipo_usuario">Tipo de Usuário*</label>
            <select id="tipo_usuario" value={tipoUsuario} onChange={e => setTipoUsuario(e.target.value)} required>
              <option value="">Selecione...</option>
              <option value="usuario">Usuário</option>
              <option value="bibliotecario">Bibliotecário</option>
              <option value="admin">Administrador</option>
            </select>
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
                width: '100%'
              }}
            >
              Atualizar
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/usuarios')} 
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
                width: '100%'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>

        {mensagem && (
          <div className={`${styles.mensagem} ${atualizacaoSucesso ? styles.sucesso : styles.erro}`}>
            <p>{mensagem}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarUsuario;