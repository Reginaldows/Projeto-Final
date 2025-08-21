import React, { useState } from 'react';
import styles from './cadastroestante.module.css';
import { formatarCPF, validarCPF, formatarCEP, buscarEnderecoPorCEP, formatarTelefone, validarRequisitosSenha } from './scripts/validacaoCpfSenha';

const CadastroEstante = () => {
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(null);
  const [cep, setCep] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [senha, setSenha] = useState('');
  const [valido, setValido] = useState(false);
  const [requisitos, setRequisitos] = useState({
    min: false,
    letras: false,
    numero: false,
    especial: false,
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className={styles.cadastroEstanteWrapper}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logo} />
        </div>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome*</label>
            <input type="text" id="nome" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sobrenome">Sobrenome*</label>
            <input type="text" id="sobrenome" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dataNascimento">Data de nascimento</label>
            <input type="date" id="dataNascimento" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF*</label>
            <input 
              type="text" 
              id="cpf" 
              value={cpf}
              onChange={(e) => {
                const valor = e.target.value;
                const formatado = formatarCPF(valor);
                setCpf(formatado);
                
                const cpfLimpo = formatado.replace(/\D/g, '');
                if (cpfLimpo.length === 11) {
                  setCpfValido(validarCPF(cpfLimpo));
                } else {
                  setCpfValido(null);
                }
              }}
              maxLength="14"
              required 
              className={cpfValido === false ? styles.invalido : ''}
            />
            {cpfValido === false && (
              <small className={styles.erro}>CPF inválido.</small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="celular">DDD e número de celular*</label>
            <input 
              type="tel" 
              id="celular" 
              value={celular}
              onChange={(e) => {
                const valor = e.target.value;
                const formatado = formatarTelefone(valor);
                setCelular(formatado);
              }}
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
              onChange={(e) => {
                const valor = e.target.value;
                const formatado = formatarCEP(valor);
                setCep(formatado);
                
                if (formatado.replace(/\D/g, '').length === 8) {
                  buscarEnderecoPorCEP(formatado, setEndereco, setBairro, setCidade, setEstado);
                }
              }}
              maxLength="9"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endereco">Endereço*</label>
            <input 
              type="text" 
              id="endereco" 
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numero">Número*</label>
            <input type="text" id="numero" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="complemento">Complemento (opcional)</label>
            <input type="text" id="complemento" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bairro">Bairro*</label>
            <input 
              type="text" 
              id="bairro" 
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cidade">Cidade*</label>
            <input 
              type="text" 
              id="cidade" 
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="estado">Estado*</label>
            <input 
              type="text" 
              id="estado" 
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail*</label>
            <input type="email" id="email" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senha">Senha*</label>
            <div className={styles.campoSenha}>
              <input 
                type={mostrarSenha ? 'text' : 'password'} 
                id="senha" 
                value={senha}
                onChange={(e) => {
                  const valor = e.target.value;
                  setSenha(valor);
                  const resultado = validarRequisitosSenha(valor);
                  setRequisitos({
                    min: resultado.min,
                    letras: resultado.letras,
                    numero: resultado.numero,
                    especial: resultado.especial,
                  });
                  setValido(resultado.valido && cpfValido === true);
                }}
                required 
              />
              <i
                className={`fas ${mostrarSenha ? 'fa-eye-slash' : 'fa-eye'} ${styles.visibilidade}`}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              ></i>
            </div>
            
            <div className={styles.verificacao}>
              <p>A <em>senha</em> deve conter:</p>
              <ul className={styles.lista}>
                <li className={requisitos.min ? styles.validado : ''}>
                  <i className={requisitos.min ? "fa-solid fa-check" : "fa-solid fa-times"}></i>
                  <span>No mínimo 8 caracteres</span>
                </li>
                <li className={requisitos.letras ? styles.validado : ''}>
                  <i className={requisitos.letras ? "fa-solid fa-check" : "fa-solid fa-times"}></i>
                  <span>Pelo menos uma letra maiúscula e minúscula</span>
                </li>
                <li className={requisitos.numero ? styles.validado : ''}>
                  <i className={requisitos.numero ? "fa-solid fa-check" : "fa-solid fa-times"}></i>
                  <span>Pelo menos um número</span>
                </li>
                <li className={requisitos.especial ? styles.validado : ''}>
                  <i className={requisitos.especial ? "fa-solid fa-check" : "fa-solid fa-times"}></i>
                  <span>Pelo menos um caractere especial</span>
                </li>
              </ul>
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={!valido}>Cadastrar</button>
        </form>
      </div>
    </div>
  );
};

export default CadastroEstante;