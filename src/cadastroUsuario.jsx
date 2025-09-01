import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './cadastroestante.module.css';
import { formatarCPF, validarCPF, formatarCEP, buscarEnderecoPorCEP, formatarTelefone, validarRequisitosSenha } from './scripts/validacaoCpfSenha';
import Acessibilidade from './acessibilidade';

const CadastroUsuario = () => {
  const navigate = useNavigate();
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
  const [dataNasc, setDataNasc] = useState(''); // CORREÇÃO: mudou de datanasc para dataNasc
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [valido, setValido] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [leituraAtiva, setLeituraAtiva] = useState(false);

  const [requisitos, setRequisitos] = useState({
    min: false,
    letras: false,
    numero: false,
    especial: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('data_nasc', dataNasc); // CORREÇÃO: mudou de 'datanasc' para 'data_nasc'
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
    formData.append('senha', senha);
    formData.append('tipo_usuario', 'usuario');

    try {
      const response = await fetch('http://localhost/php/cadastrousuario.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.text();
      console.log('Resposta do servidor:', data); // Para debug
      
      if (data.includes('sucesso') || data.includes('Cadastrado')) {
        setCadastroSucesso(true);
        setMensagem('Usuário cadastrado com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/bibliotecario');
        }, 2000);
      } else {
        setMensagem(data);
      }
    } catch (error) {
      setMensagem('Erro ao cadastrar: ' + error.message);
    }
  };

  return (
    <>
    <div className={styles.cadastroEstanteWrapper}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
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
              value={dataNasc} // CORREÇÃO: mudou de datanasc para dataNasc
              onChange={e => setDataNasc(e.target.value)} // CORREÇÃO: mudou de setDataNasc para setDataNasc
              max={new Date().toISOString().split('T')[0]} // Limita a data até o dia atual
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
            <label htmlFor="senha">Senha*</label>
            <input 
              type={mostrarSenha ? 'text' : 'password'} 
              id="senha" 
              value={senha} 
              onChange={e => {
                setSenha(e.target.value);
                const resultado = validarRequisitosSenha(e.target.value);
                setRequisitos(resultado);
                setValido(resultado.valido && cpfValido === true);
              }} 
              required 
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={!valido}>Cadastrar</button>
        </form>

        {mensagem && (
          <div className={`${styles.mensagem} ${cadastroSucesso ? styles.sucesso : styles.erro}`}>
            <p>{mensagem}</p>
          </div>
        )}
      </div>
    </div>
    <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
    </>
  );
};

export default CadastroUsuario;