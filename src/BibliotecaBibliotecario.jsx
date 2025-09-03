import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './bibliotecario.module.css';
import Acessibilidade from './acessibilidade';
import ModalNotificacao from './components/ModalNotificacao';
import { X } from 'lucide-react';

const BibliotecaBibliotecario = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [userName, setUserName] = useState('');
  const [showLoginStatus, setShowLoginStatus] = useState(false);
  const [livros, setLivros] = useState([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState([]);
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(() => {
    return localStorage.getItem('notificacaoEmprestimo') === 'true';
  });
  const [modalNotificacaoAberto, setModalNotificacaoAberto] = useState(false);
  const [dadosUltimoEmprestimo, setDadosUltimoEmprestimo] = useState(() => {
    const dados = localStorage.getItem('dadosUltimoEmprestimo');
    return dados ? JSON.parse(dados) : null;
  });
  const [mostrarTextoTemporario, setMostrarTextoTemporario] = useState(() => {
    return localStorage.getItem('mostrarTextoTemporario') === 'true';
  });
  const [modalReservaCodigo, setModalReservaCodigo] = useState(false);
  const [codigoReserva, setCodigoReserva] = useState('');
  const [processandoReserva, setProcessandoReserva] = useState(false);
  const [erroCodigoReserva, setErroCodigoReserva] = useState('');
  const [modalConfirmarPreReserva, setModalConfirmarPreReserva] = useState(false);
  const [codigoPreReserva, setCodigoPreReserva] = useState('');
  const [processandoPreReserva, setProcessandoPreReserva] = useState(false);
  const [erroCodigoPreReserva, setErroCodigoPreReserva] = useState('');
  const [modalEmprestimoAberto, setModalEmprestimoAberto] = useState(false);
  const [livroParaEmprestimo, setLivroParaEmprestimo] = useState(null);
  const [cpfUsuario, setCpfUsuario] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(false);

  // Timer para ocultar texto temporário
  useEffect(() => {
    if (mostrarTextoTemporario) {
      const timer = setTimeout(() => {
        setMostrarTextoTemporario(false);
        localStorage.removeItem('mostrarTextoTemporario');
      }, 5000); // 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [mostrarTextoTemporario]);

  const carregarLivros = async () => {
    try {
      console.log('Tentando carregar livros...');
      const response = await fetch('http://localhost/php/listarlivro.php');
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        throw new Error('Resposta do servidor não é JSON válido');
      }
      
      const livrosSalvos = await response.json();
      console.log('Livros carregados do banco de dados:', livrosSalvos);
      setLivros(livrosSalvos);
      setLivrosFiltrados(livrosSalvos);
    } catch (error) {
      console.error('Erro detalhado ao carregar livros:', error);
      setLivros([]);
      setLivrosFiltrados([]);
    }
  };

  const carregarAutores = async () => {
    try {
      console.log('Carregando autores...');
      const response = await fetch('http://localhost/php/listarautores.php');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const autoresData = await response.json();
      console.log('Autores carregados:', autoresData);
      setAutores(autoresData);
    } catch (error) {
      console.error('Erro ao carregar autores:', error);
      setAutores([]);
    }
  };

  const carregarCategorias = async () => {
    try {
      console.log('Carregando categorias...');
      const response = await fetch('http://localhost/php/listarcategorias.php');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const categoriasData = await response.json();
      console.log('Categorias carregadas:', categoriasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([]);
    }
  };

  useEffect(() => {
    // Verificar se o usuário está logado como bibliotecário a cada acesso
    // Agora verificamos no sessionStorage, já que o login de bibliotecário usa sessionStorage
    const storedUserName = sessionStorage.getItem('userName');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    // Sempre redirecionar para a página de login, forçando autenticação
    if (!storedUserName || !isLoggedIn || tipoUsuario !== 'bibliotecario') {
      // Limpar dados do sessionStorage
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('tipoUsuario');
      sessionStorage.removeItem('userId');
      // Limpar também localStorage por segurança
      localStorage.removeItem('userName');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('tipoUsuario');
      localStorage.removeItem('userId');
      setUserName('');
      navigate('/login-bibliotecario');
      return; // Interrompe a execução do useEffect
    }

    // Se chegou aqui, o usuário está logado como bibliotecário
    setUserName(storedUserName);
    
    carregarLivros();
    carregarAutores();
    carregarCategorias();
    window.addEventListener('storage', carregarLivros);
    window.addEventListener('livrosAtualizados', carregarLivros);

    return () => {
      window.removeEventListener('storage', carregarLivros);
      window.removeEventListener('livrosAtualizados', carregarLivros);
    };
  }, [navigate]);

  const handleSearch = async () => {
    try {
      let url = new URL('http://localhost/php/filtrarlivros.php');
      
      if (searchTerm) url.searchParams.append('searchTerm', searchTerm);
      if (category) url.searchParams.append('category', category);
      if (author) url.searchParams.append('author', author);
      if (keywords.length > 0) url.searchParams.append('keywords', JSON.stringify(keywords));
      
      console.log('Buscando com filtros:', url.toString());
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        throw new Error('Resposta do servidor não é JSON válido');
      }
      
      const resultados = await response.json();
      console.log('Resultados filtrados:', resultados);
      setLivrosFiltrados(resultados);
    } catch (error) {
      console.error('Erro ao filtrar livros:', error);
      setLivrosFiltrados([]);
    }
  };

  const addKeyword = () => {
    if (keyword.trim() !== '' && !keywords.includes(keyword.trim())) {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addKeyword();
  };

  const handleExcluirLivro = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este livro?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/php/excluir-livro.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setLivros(livros.filter(livro => livro.id !== id));
        setLivrosFiltrados(livrosFiltrados.filter(livro => livro.id !== id));
        setMostrarDetalhes(false);
        setMensagem('Livro excluído com sucesso!');
        setTipoMensagem('sucesso');
        
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
      } else {
        throw new Error(result.message || 'Erro ao excluir o livro');
      }
    } catch (error) {
      console.error('Erro ao excluir livro:', error);
      setMensagem(`Erro ao excluir livro: ${error.message}`);
      setTipoMensagem('erro');
      
      setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 3000);
    }
  };

  const validarCodigoReserva = (codigo) => {
    if (!codigo) {
      return '';
    }
    
    if (codigo.length < 8) {
      return 'Código deve ter 8 caracteres';
    }
    
    if (!/^[A-Z0-9]+$/.test(codigo)) {
      return 'Código deve conter apenas letras e números';
    }
    
    return '';
  };

  const handleCodigoChange = (valor) => {
    const codigoLimpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setCodigoReserva(codigoLimpo);
    setErroCodigoReserva(validarCodigoReserva(codigoLimpo));
  };

  const handleProcessarReservaCodigo = async () => {
    const erro = validarCodigoReserva(codigoReserva);
    if (erro) {
      setErroCodigoReserva(erro);
      return;
    }

    if (!codigoReserva.trim()) {
      setErroCodigoReserva('Por favor, insira um código de reserva válido.');
      return;
    }

    setProcessandoReserva(true);
    setErroCodigoReserva('');
    
    try {
      const response = await fetch('/php/processar_reserva_codigo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_reserva: codigoReserva.trim().toUpperCase()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMensagem(`Reserva confirmada com sucesso! Livro: ${result.data.livro.titulo}`);
        setTipoMensagem('sucesso');
        setModalReservaCodigo(false);
        setCodigoReserva('');
        setErroCodigoReserva('');
        carregarLivros(); // Atualizar lista de livros
      } else {
        setErroCodigoReserva(result.message || 'Erro ao processar reserva');
      }
    } catch (error) {
      console.error('Erro ao processar reserva por código:', error);
      setErroCodigoReserva('Erro ao processar reserva. Tente novamente.');
    } finally {
      setProcessandoReserva(false);
    }
  };

  const confirmarPreReserva = async () => {
    if (!codigoPreReserva.trim()) {
      setErroCodigoPreReserva('Por favor, digite o código da pré-reserva');
      return;
    }

    setProcessandoPreReserva(true);
    setErroCodigoPreReserva('');

    try {
      const response = await fetch('http://localhost/php/processar_reserva_codigo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: codigoPreReserva.trim()
        })
      });

      const resultado = await response.json();
      
      if (resultado.success) {
        setMensagem(`Pré-reserva confirmada com sucesso! ${resultado.message}`);
        setTipoMensagem('sucesso');
        setModalConfirmarPreReserva(false);
        setCodigoPreReserva('');
        carregarLivros(); // Recarregar a lista de livros
      } else {
        setErroCodigoPreReserva(resultado.message || 'Erro ao confirmar pré-reserva');
      }
    } catch (error) {
      console.error('Erro ao confirmar pré-reserva:', error);
      setErroCodigoPreReserva('Erro de conexão. Tente novamente.');
    } finally {
      setProcessandoPreReserva(false);
    }
  };

  const buscarUsuarioPorCpf = async () => {
  if (!cpfUsuario.trim()) {
    setMensagem('Por favor, digite um CPF válido');
    setTipoMensagem('erro');
    return;
  }

  setCarregandoUsuario(true);
  try {
    const response = await fetch('http://localhost/php/listarusuarios.php');
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }
    
    const resultado = await response.json();
    console.log('Resposta da API de usuários:', resultado);
    
    if (!resultado.success || !resultado.dados) {
      throw new Error('Erro ao carregar lista de usuários');
    }
    
    const usuarios = resultado.dados;
    console.log('Lista de usuários:', usuarios);
    
    // Limpar o CPF digitado para comparação
    const cpfLimpo = cpfUsuario.trim().replace(/[.-]/g, '');
    console.log('CPF limpo para busca:', cpfLimpo);
    
    const usuario = usuarios.find(u => {
      const cpfUsuarioLimpo = u.cpf ? u.cpf.replace(/[.-]/g, '') : '';
      console.log('Comparando:', cpfLimpo, 'com', cpfUsuarioLimpo);
      return cpfUsuarioLimpo === cpfLimpo;
    });
    
    if (usuario) {
      console.log('Usuário encontrado:', usuario);
      setUsuarioEncontrado(usuario);
      setMensagem('Usuário encontrado com sucesso!');
      setTipoMensagem('sucesso');
    } else {
      setUsuarioEncontrado(null);
      setMensagem('Usuário não encontrado. Verifique o CPF digitado.');
      setTipoMensagem('erro');
      console.log('Usuário não encontrado para CPF:', cpfLimpo);
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    setMensagem('Erro ao buscar usuário. Tente novamente.');
    setTipoMensagem('erro');
    setUsuarioEncontrado(null);
  } finally {
    setCarregandoUsuario(false);
  }
};

  const confirmarEmprestimo = async () => {
  if (!usuarioEncontrado || !livroParaEmprestimo) {
    console.error('Usuário ou livro não selecionado.');
    setMensagem('Selecione um usuário e um livro antes de confirmar.');
    setTipoMensagem('erro');
    return;
  }

  console.log('=== DEBUG ESTRUTURA COMPLETA ===');
  console.log('usuarioEncontrado completo:', JSON.stringify(usuarioEncontrado, null, 2));
  console.log('Todas as propriedades do usuário:');
  Object.keys(usuarioEncontrado).forEach(key => {
    console.log(`  ${key}:`, usuarioEncontrado[key], typeof usuarioEncontrado[key]);
  });
  
  console.log('livroParaEmprestimo completo:', JSON.stringify(livroParaEmprestimo, null, 2));
  console.log('Todas as propriedades do livro:');
  Object.keys(livroParaEmprestimo).forEach(key => {
    console.log(`  ${key}:`, livroParaEmprestimo[key], typeof livroParaEmprestimo[key]);
  });

  // Procurar qualquer propriedade que possa ser o ID do usuário
  const possiveisIdsUsuario = ['id', 'usuario_id', 'user_id', 'userId', 'ID', 'pk', 'primary_key'];
  let usuario_id = null;
  
  for (const prop of possiveisIdsUsuario) {
    if (usuarioEncontrado[prop] !== undefined && usuarioEncontrado[prop] !== null) {
      usuario_id = usuarioEncontrado[prop];
      console.log(`ID do usuário encontrado na propriedade '${prop}':`, usuario_id);
      break;
    }
  }
  
  // Se ainda não encontrou, procurar por qualquer propriedade que contenha um número
  if (!usuario_id) {
    console.log('Procurando por qualquer propriedade numérica...');
    Object.keys(usuarioEncontrado).forEach(key => {
      const value = usuarioEncontrado[key];
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value) && value.trim() !== '')) {
        console.log(`Propriedade numérica encontrada: ${key} = ${value}`);
      }
    });
  }

  const livro_id = livroParaEmprestimo.id || livroParaEmprestimo.livro_id || null;

  console.log('usuario_id final:', usuario_id, typeof usuario_id);
  console.log('livro_id final:', livro_id, typeof livro_id);

  // Se não conseguir encontrar o ID do usuário, mostrar erro mais específico
  if (!usuario_id) {
    console.error('Não foi possível encontrar ID do usuário');
    console.error('Propriedades disponíveis:', Object.keys(usuarioEncontrado));
    setMensagem('Erro: Não foi possível identificar o ID do usuário. Verifique a estrutura dos dados.');
    setTipoMensagem('erro');
    return;
  }

  if (!livro_id) {
    console.error('Não foi possível encontrar ID do livro');
    setMensagem('Erro: ID do livro não encontrado');
    setTipoMensagem('erro');
    return;
  }

  // Continuar com o resto da função apenas se tiver os IDs corretos
  const payload = { 
    usuario_id: Number(usuario_id), 
    livro_id: Number(livro_id) 
  };

  if (isNaN(payload.usuario_id) || isNaN(payload.livro_id)) {
    console.error('IDs não são números válidos:', payload);
    setMensagem('Erro: IDs devem ser números válidos');
    setTipoMensagem('erro');
    return;
  }

  console.log('Payload final:', payload);
  
  let jsonString;
  try {
    jsonString = JSON.stringify(payload);
    console.log('JSON string:', jsonString);
  } catch (jsonError) {
    console.error('Erro ao criar JSON:', jsonError);
    setMensagem('Erro ao preparar dados para envio');
    setTipoMensagem('erro');
    return;
  }

  try {
    const response = await fetch(
      'http://localhost/php/processar_emprestimo_bibliotecario.php',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: jsonString
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);

    let resultado;
    try {
      resultado = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON da resposta:', parseError);
      setMensagem('Erro na resposta do servidor');
      setTipoMensagem('erro');
      return;
    }

    console.log('Resultado:', resultado);

    if (resultado.success) {
      // Criar dados para o modal de notificação personalizada
      const dadosEmprestimo = {
        livro: {
          titulo: resultado.data.livro.titulo,
          autor: resultado.data.livro.autor,
          capa: resultado.data.livro.capa || '/img/Biblioteca.png'
        },
        datas: {
          emprestimo: resultado.data.data_emprestimo,
          devolucao_prevista: resultado.data.data_devolucao,
          dias_emprestimo: 14
        }
      };
      
      // Salvar dados no localStorage e abrir modal
      setDadosUltimoEmprestimo(dadosEmprestimo);
      localStorage.setItem('dadosUltimoEmprestimo', JSON.stringify(dadosEmprestimo));
      localStorage.setItem('notificacaoEmprestimo', 'true');
      localStorage.setItem('mostrarTextoTemporario', 'true');
      
      // Abrir modal de notificação
      setModalNotificacaoAberto(true);
      setMostrarTextoTemporario(true);
      setTemNotificacaoNaoLida(true);
      
      // Fechar modal de empréstimo e limpar dados
      setModalEmprestimoAberto(false);
      setCpfUsuario('');
      setUsuarioEncontrado(null);
      setLivroParaEmprestimo(null);
      carregarLivros();
    } else {
      setMensagem(resultado.message || 'Erro ao processar empréstimo');
      setTipoMensagem('erro');
    }
  } catch (error) {
    console.error('Erro completo:', error);
    setMensagem(`Erro ao processar empréstimo: ${error.message}`);
    setTipoMensagem('erro');
  }
};



  return (
    <div className={styles.pageWrapper}>
      {mensagem && (
        <div className={`${styles.mensagem} ${styles[tipoMensagem]}`}>
          {mensagem}
        </div>
      )}
      
      <div className={styles.travessa}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <h1 className={styles.logoTitle}>
              <div className={styles.logoContainer}>
                <span>Biblioteca</span>
                <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logoImage} />
              </div>
            </h1>
            <div className={styles.headerIcons}>
              <div className={styles.cartIcon}><i className="fas fa-shopping-cart"></i></div>
              {mostrarTextoTemporario ? (
                <div className={styles.notificationText} onClick={() => {
                  if (dadosUltimoEmprestimo) {
                    setModalNotificacaoAberto(true); // Abrir modal
                  }
                }}>
                  <span>Empréstimo confirmado</span>
                </div>
              ) : (
                <div className={styles.notificationIcon} onClick={() => {
                  if (dadosUltimoEmprestimo) {
                    setModalNotificacaoAberto(true); // Abrir modal com dados salvos
                  }
                }}>
                  🔔
                  {dadosUltimoEmprestimo && <div className={styles.notificationDot}></div>}
                </div>
              )}
              <div className={styles.userGreeting} onClick={() => setShowLoginStatus(!showLoginStatus)}>
                <i className="fas fa-user"></i>
                {userName ? <span>Olá, {userName}!</span> : <span className={styles.loginPrompt}>Fazer login</span>}
                {showLoginStatus && (
                  <div className={styles.loginStatus}>
                    {userName ? (
                      <div>
                        <p>Logado como: {userName}</p>
                        <p>Tipo: Bibliotecário</p>
                        <button 
                          className={styles.logoutButton}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            // Limpar sessionStorage para bibliotecários
                            sessionStorage.removeItem('userName'); 
                            sessionStorage.removeItem('isLoggedIn'); 
                            sessionStorage.removeItem('tipoUsuario');
                            sessionStorage.removeItem('userId');
                            // Limpar também localStorage por segurança
                            localStorage.removeItem('userName'); 
                            localStorage.removeItem('isLoggedIn'); 
                            localStorage.removeItem('tipoUsuario');
                            localStorage.removeItem('userId');
                            setUserName(''); 
                            setShowLoginStatus(false); 
                            navigate('/login-bibliotecario');
                          }}
                        >
                          Sair
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p>Você não está logado</p>
                        <button 
                          className={styles.loginButton}
                          onClick={(e) => { e.stopPropagation(); navigate('/login-bibliotecario'); }}
                        >
                          Entrar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}><a className={styles.navLink} href="#">Início</a></li>
              <li className={styles.navItem}>
                <div className={styles.dropdownContainer}>
                  <a className={styles.navLink} href="#">Gerenciar Usuários</a>
                  <div className={styles.dropdownContent}>
                    <a href="/cadastrousuario" className={styles.dropdownItem}>Cadastro de Usuários</a>
                    <a href="/usuarios" className={styles.dropdownItem}>Lista de Usuários</a>
                  </div>
                </div>
              </li>
              <li className={styles.navItem}>
                <button className={styles.navLink} onClick={() => navigate('/relatorios')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Relatórios</button>
              </li>
              <li className={styles.navItem}>
                <button className={styles.navLink} onClick={() => navigate('/gerenciar-emprestimos')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Gerenciar Empréstimos</button>
              </li>
              <li className={styles.navItem}>
                <button className={styles.navLink} onClick={() => navigate('/cadastro-livro')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Cadastrar Livro</button>
              </li>
            </ul>
          </nav>

          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <input type="text" className={styles.searchInput} placeholder="Buscar livros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className={styles.searchButton} onClick={handleSearch}>Buscar</button>
            </div>

            <div className={styles.searchFilters}>
              <select className={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Filtrar por categoria</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>{categoria}</option>
                ))}
              </select>

              <select className={styles.filterSelect} value={author} onChange={(e) => setAuthor(e.target.value)}>
                <option value="">Filtrar por autor</option>
                {autores.map((autor, index) => (
                  <option key={index} value={autor}>{autor}</option>
                ))}
              </select>

              <div className={styles.keywordFilter}>
                <input type="text" className={styles.keywordInput} placeholder="Palavras-chave" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyPress={handleKeyPress} />
                <button className={styles.keywordButton} onClick={addKeyword}>+</button>
              </div>
            </div>

            {keywords.length > 0 && (
              <div className={styles.keywordTags}>
                {keywords.map((kw, index) => (
                  <span key={index} className={styles.keywordTag}>
                    {kw}
                    <button className={styles.removeKeyword} onClick={() => removeKeyword(kw)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className={styles.bookSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Gerenciamento de Livros</h2>
            <button onClick={() => navigate('/cadastro-livro')} className={styles.sectionLink}>Cadastrar Novo Livro</button>
          </div>
          
          <div className={styles.categoryLegend}>
            <h3 className={styles.legendTitle}>Categorias:</h3>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#000000' }}></span>
                <span>Ficção</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#006400' }}></span>
                <span>Romance</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#8B0000' }}></span>
                <span>Mistério</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#FF1493' }}></span>
                <span>Fantasia</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#4B0082' }}></span>
                <span>Ficção Científica</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#FF8C00' }}></span>
                <span>Biografia</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#4682B4' }}></span>
                <span>História</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#8B4513' }}></span>
                <span>Ciência</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#9ACD32' }}></span>
                <span>Tecnologia</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#0066b3' }}></span>
                <span>Autoajuda</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.colorBox} style={{ backgroundColor: '#800080' }}></span>
                <span>Outras</span>
              </div>
            </div>
          </div>

          <div className={styles.booksGrid}>
            {livrosFiltrados.length > 0 ? (
              livrosFiltrados.map(livro => (
                <div 
                  key={livro.id} 
                  className={`${styles.bookCard} ${
                    livro.categoria === 'Ficção' ? styles.categorieFiccao : 
                    livro.categoria === 'Romance' ? styles.categorieRomance : 
                    livro.categoria === 'Mistério' ? styles.categorieMisterio : 
                    livro.categoria === 'Fantasia' ? styles.categorieFantasia :
                    livro.categoria === 'Ficção Científica' ? styles.categorieFiccaoCientifica :
                    livro.categoria === 'Biografia' ? styles.categorieBiografia :
                    livro.categoria === 'História' ? styles.categorieHistoria :
                    livro.categoria === 'Ciência' ? styles.categorieCiencia :
                    livro.categoria === 'Tecnologia' ? styles.categorieTecnologia :
                    livro.categoria === 'Autoajuda' ? styles.categorieAutoajuda :
                    styles.categorieOutras
                  }`}
                  style={{ borderColor: 
                    livro.categoria === 'Ficção' ? '#000000' : 
                    livro.categoria === 'Romance' ? '#006400' : 
                    livro.categoria === 'Mistério' ? '#8B0000' : 
                    livro.categoria === 'Fantasia' ? '#FF1493' :
                    livro.categoria === 'Ficção Científica' ? '#4B0082' :
                    livro.categoria === 'Biografia' ? '#FF8C00' :
                    livro.categoria === 'História' ? '#4682B4' :
                    livro.categoria === 'Ciência' ? '#8B4513' :
                    livro.categoria === 'Tecnologia' ? '#9ACD32' :
                    livro.categoria === 'Autoajuda' ? '#0066b3' :
                    '#800080'
                  }}
                >
                  <div
                    className={styles.bookCover}
                    style={{
                      backgroundImage: `url(${livro.capa || '/public/img/Biblioteca.png'})`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLivroSelecionado(livro);
                      setMostrarDetalhes(true);
                    }}
                  />
                  <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{livro.titulo}</h3>
                    <p className={styles.bookAuthor}>{livro.autor}</p>
                    
                    <button 
                      className={styles.detailsButton}
                      onClick={() => {
                        setLivroSelecionado(livro);
                        setMostrarDetalhes(true);
                      }}
                    >
                      Ver Detalhes
                    </button>
                    
                    <button 
                      className={styles.loanButton}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLivroParaEmprestimo(livro);
                        setModalEmprestimoAberto(true);
                        setCpfUsuario('');
                        setUsuarioEncontrado(null);
                      }}
                    >
                      Fazer Empréstimo
                    </button>
                    
                    <button 
                      className={styles.preReservaButton}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setModalConfirmarPreReserva(true);
                        setCodigoPreReserva('');
                        setErroCodigoPreReserva('');
                      }}
                    >
                      Confirmar Pré-reserva
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyMessage}>
                <p>Nenhum livro encontrado. Cadastre um novo livro ou ajuste os filtros de busca.</p>
              </div>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerInfo}>
              <p>Sistema de Gerenciamento de Biblioteca - Acesso Bibliotecário</p>
              <p>Biblioteca SENAI - www.bibliotecasenai.com.br |  Rua Residêncial 6 - Loteamento Nova Fronteira - Paraíso do Tocantins/TO</p>
            </div>
            <div className={styles.footerCopyright}>
              <p>© 2025 Biblioteca SENAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {modalEmprestimoAberto && livroParaEmprestimo && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button className={styles.closeButton} onClick={() => {
                setModalEmprestimoAberto(false);
                setCpfUsuario('');
                setUsuarioEncontrado(null);
                setLivroParaEmprestimo(null);
              }}>
                <X size={16} />
              </button>
              <div className={styles.emprestimoModal}>
                <h2 className={styles.modalTitle}>📚 Fazer Empréstimo</h2>
                
                <div className={styles.livroInfoSection}>
                  <h3 className={styles.livroTitulo}>📖 {livroParaEmprestimo.titulo}</h3>
                  <p className={styles.livroAutor}>✍️ Autor: {livroParaEmprestimo.autor}</p>
                </div>
                
                <div className={styles.usuarioSection}>
                  <h4 className={styles.sectionTitle}>👤 Buscar Usuário por CPF</h4>
                  <div className={styles.inputGroup}>
                    <label htmlFor="cpfUsuario" className={styles.inputLabel}>CPF do Usuário:</label>
                    <div className={styles.inputWithButton}>
                      <input
                        type="text"
                        id="cpfUsuario"
                        value={cpfUsuario}
                        onChange={(e) => setCpfUsuario(e.target.value)}
                        placeholder="000.000.000-00"
                        className={styles.cpfInput}
                        maxLength="14"
                      />
                      <button 
                        className={styles.buscarButton}
                        onClick={() => buscarUsuarioPorCpf()}
                        disabled={carregandoUsuario || !cpfUsuario.trim()}
                      >
                        {carregandoUsuario ? '🔍 Buscando...' : '🔍 Buscar'}
                      </button>
                    </div>
                  </div>
                  
                  {usuarioEncontrado && (
                    <div className={styles.usuarioEncontrado}>
                      <h5 className={styles.usuarioTitulo}>✅ Usuário Encontrado</h5>
                      <div className={styles.usuarioDetalhes}>
                        <p><strong>👤 Nome:</strong> {usuarioEncontrado.nome}</p>
                        <p><strong>📧 Email:</strong> {usuarioEncontrado.email}</p>
                        <p><strong>🆔 CPF:</strong> {usuarioEncontrado.cpf}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setModalEmprestimoAberto(false);
                      setCpfUsuario('');
                      setUsuarioEncontrado(null);
                      setLivroParaEmprestimo(null);
                    }}
                  >
                    ❌ Cancelar
                  </button>
                  <button 
                    className={styles.confirmButton}
                    onClick={() => confirmarEmprestimo()}
                    disabled={!usuarioEncontrado}
                  >
                    ✅ Confirmar Empréstimo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mostrarDetalhes && livroSelecionado && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button className={styles.closeButton} onClick={() => setMostrarDetalhes(false)}>
                <X size={16} />
              </button>
              <div className={styles.livroDetalhes}>
                <div className={styles.livroImagemContainer}>
                  <img 
                    src={livroSelecionado.capa || '/public/img/Biblioteca.png'} 
                    alt={livroSelecionado.titulo} 
                    className={styles.livroImagem} 
                  />
                </div>
                <div className={styles.livroInfo}>
                  <h2 className={styles.livroTitulo}>{livroSelecionado.titulo}</h2>
                  <p className={styles.livroAutor}><strong>Autor:</strong> {livroSelecionado.autor}</p>
                  <p className={styles.livroEditora}><strong>Editora:</strong> {livroSelecionado.editora}</p>
                  <p className={styles.livroCategoria}><strong>Categoria:</strong> {livroSelecionado.categoria}</p>
                  {livroSelecionado.cdd && (
                    <p className={styles.livroCdd}><strong>CDD:</strong> {livroSelecionado.cdd}</p>
                  )}
                  {livroSelecionado.localizacao && (
                    <p className={styles.livroLocalizacao}><strong>Localização na Estante:</strong> {livroSelecionado.localizacao}</p>
                  )}
                  {livroSelecionado.quantidade_copias && (
                    <p className={styles.livroQuantidadeCopias}><strong>Quantidade de Cópias:</strong> {livroSelecionado.quantidade_copias}</p>
                  )}
                  
                  {/* Informações de Disponibilidade */}
                  {livroSelecionado.disponibilidade && (
                    <div className={styles.disponibilidadeInfo}>
                      <p className={styles.livroQuantidadeCopias}><strong>Total de Cópias:</strong> {livroSelecionado.disponibilidade.total_copias}</p>
                      <p className={styles.copiasDisponiveis}><strong>Cópias Disponíveis:</strong> {livroSelecionado.disponibilidade.copias_disponiveis}</p>
                      {livroSelecionado.disponibilidade.pre_reservas_ativas > 0 && (
                        <p className={styles.preReservasAtivas}><strong>Pré-reservas Ativas:</strong> {livroSelecionado.disponibilidade.pre_reservas_ativas}</p>
                      )}
                      {livroSelecionado.disponibilidade.reservas_ativas > 0 && (
                        <p className={styles.reservasAtivas}><strong>Reservas Ativas:</strong> {livroSelecionado.disponibilidade.reservas_ativas}</p>
                      )}
                    </div>
                  )}
                  <div className={styles.livroDescricao}>
                    <h3>Descrição:</h3>
                    <p>{livroSelecionado.descricao || 'Nenhuma descrição disponível para este livro.'}</p>
                  </div>
                  <div className={styles.botoesAcao}>
                    <button 
                      className={styles.editarButton}
                      onClick={() => navigate(`/editar-livro/${livroSelecionado.id}`)}
                    >
                      Editar
                    </button>
                    <button 
                      className={styles.excluirButton}
                      onClick={() => handleExcluirLivro(livroSelecionado.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
      
      {/* Modal de Notificação */}
      <ModalNotificacao 
        isOpen={modalNotificacaoAberto}
        onClose={() => setModalNotificacaoAberto(false)}
        dadosEmprestimo={dadosUltimoEmprestimo}
      />
      
      {/* Modal de Reserva por Código */}
      {modalReservaCodigo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton} 
              onClick={() => {
                setModalReservaCodigo(false);
                setCodigoReserva('');
              }}
            >
              <X size={16} />
            </button>
            <div className={styles.modalHeader}>
              <h2>Confirmar Reserva por Código</h2>
              <p>Insira o código de pré-reserva fornecido pelo usuário para confirmar a reserva do livro.</p>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label htmlFor="codigoReserva">Código de Reserva:</label>
                <input
                  type="text"
                  id="codigoReserva"
                  value={codigoReserva}
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  placeholder="Ex: ABC12345"
                  maxLength={8}
                  className={`${styles.codigoInput} ${erroCodigoReserva ? styles.codigoInputError : ''}`}
                  disabled={processandoReserva}
                />
                {erroCodigoReserva && (
                  <span className={styles.erroMensagem}>{erroCodigoReserva}</span>
                )}
                <div className={styles.codigoInfo}>
                  <small>Código deve ter 8 caracteres (letras e números)</small>
                  <small className={styles.contadorCaracteres}>{codigoReserva.length}/8</small>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setModalReservaCodigo(false);
                    setCodigoReserva('');
                    setErroCodigoReserva('');
                  }}
                  disabled={processandoReserva}
                >
                  Cancelar
                </button>
                <button 
                  className={styles.confirmButton}
                  onClick={handleProcessarReservaCodigo}
                  disabled={processandoReserva || !codigoReserva.trim() || erroCodigoReserva}
                >
                  {processandoReserva ? 'Processando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Pré-reserva */}
      {modalConfirmarPreReserva && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton} 
              onClick={() => {
                setModalConfirmarPreReserva(false);
                setCodigoPreReserva('');
                setErroCodigoPreReserva('');
              }}
            >
              <X size={16} />
            </button>
            <div className={styles.modalHeader}>
              <h2>Confirmar Pré-reserva</h2>
              <p>Digite o código de pré-reserva do usuário para confirmar a reserva</p>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label htmlFor="codigoPreReserva" className={styles.inputLabel}>
                  Código de Pré-reserva:
                </label>
                <input
                  type="text"
                  id="codigoPreReserva"
                  value={codigoPreReserva}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase();
                    setCodigoPreReserva(valor);
                    if (erroCodigoPreReserva) {
                      setErroCodigoPreReserva('');
                    }
                  }}
                  placeholder="Ex: ABC123XY"
                  className={`${styles.codigoInput} ${erroCodigoPreReserva ? styles.inputError : ''}`}
                  maxLength="8"
                />
                {erroCodigoPreReserva && (
                  <span className={styles.errorMessage}>{erroCodigoPreReserva}</span>
                )}
              </div>
              <div className={styles.reservaCodigoActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setModalConfirmarPreReserva(false);
                    setCodigoPreReserva('');
                    setErroCodigoPreReserva('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className={styles.confirmButton}
                  onClick={() => confirmarPreReserva()}
                  disabled={processandoPreReserva || !codigoPreReserva.trim() || erroCodigoPreReserva}
                >
                  {processandoPreReserva ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibliotecaBibliotecario;