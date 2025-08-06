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

  // Novos estados para os campos adicionais
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');

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

  const formatarCEP = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 5) {
      return apenasNumeros;
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
  };

  const handleCEPChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarCEP(valor);
    setCep(formatado);
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    const formatado = formatarTelefone(valor);
    setTelefone(formatado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const rua = document.getElementById('rua').value;
    const bairro = document.getElementById('bairro').value;
    const estado = document.getElementById('estado').value;
    
    const formData = new URLSearchParams();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('dataNascimento', dataNascimento);
    formData.append('cep', cep);
    formData.append('rua', rua);
    formData.append('bairro', bairro);
    formData.append('estado', estado);
    formData.append('telefone', telefone);

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
        </div>

        <fieldset>
          {/* Primeira linha: Nome e CPF */}
          <div className="linha-campos">
            <div className="campo-metade">
              <label htmlFor="nome" className="campos-obrig">Nome completo</label>
              <input type="text" name="nome" id="nome" placeholder="Digite seu nome completo" required />
            </div>
            <div className="campo-metade">
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
              />
              {cpfValido === false && (
                <div id="cpf-erro" style={{ color: 'red', fontWeight: 'bold' }}>
                  CPF inválido.
                </div>
              )}
            </div>
          </div>

          {/* Segunda linha: Data de Nascimento e CEP */}
          <div className="linha-campos">
            <div className="campo-metade">
              <label htmlFor="dataNascimento" className="campos-obrig">Data de Nascimento</label>
              <input type="date" name="dataNascimento" id="dataNascimento" required />
            </div>
            <div className="campo-metade">
              <label htmlFor="cep" className="campos-obrig">CEP</label>
              <input
                type="text"
                name="cep"
                id="cep"
                placeholder="Digite seu CEP"
                maxLength="9"
                value={cep}
                onChange={handleCEPChange}
                required
              />
            </div>
          </div>

          {/* Terceira linha: Rua e Bairro */}
          <div className="linha-campos">
            <div className="campo-metade">
              <label htmlFor="rua" className="campos-obrig">Rua</label>
              <input type="text" name="rua" id="rua" placeholder="Digite sua rua" required />
            </div>
            <div className="campo-metade">
              <label htmlFor="bairro" className="campos-obrig">Bairro</label>
              <input type="text" name="bairro" id="bairro" placeholder="Digite seu bairro" required />
            </div>
          </div>

          {/* Quarta linha: Estado e Telefone */}
          <div className="linha-campos">
            <div className="campo-metade">
              <label htmlFor="estado" className="campos-obrig">Estado</label>
              <select name="estado" id="estado" required>
                <option value="">Selecione seu estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            <div className="campo-metade">
              <label htmlFor="telefone" className="campos-obrig">Telefone</label>
              <input
                type="text"
                name="telefone"
                id="telefone"
                placeholder="Digite seu telefone"
                maxLength="15"
                value={telefone}
                onChange={handleTelefoneChange}
                required
              />
            </div>
          </div>

          {/* Quinta linha: E-mail (campo único) */}
          <div className="linha-campos">
            <div className="campo-completo">
              <label htmlFor="email" className="campos-obrig">E-mail</label>
              <input type="email" name="email" id="email" placeholder="Digite seu e-mail" required />
            </div>
          </div>

          {/* Sexta linha: Senha (campo único) */}
          <div className="linha-campos">
            <div className="campo-completo">
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
            </div>
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
