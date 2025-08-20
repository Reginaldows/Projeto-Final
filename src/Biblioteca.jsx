import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './biblioteca.module.css';
import chatStyles from './chatflutuante.module.css';
import ChatCategoria from './ChatCategoria';
import { X } from 'lucide-react';

const PaginaIsolada = () => {
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


  const carregarLivros = async () => {
  try {
    console.log('Tentando carregar livros...');
    const response = await fetch('/php/listarlivro.php');
    
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
      const response = await fetch('/php/listarautores.php');
      
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
      const response = await fetch('/php/listarcategorias.php');
      
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
    const storedUserName = localStorage.getItem('userName');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (storedUserName && isLoggedIn === 'true') {
      setUserName(storedUserName);
      // Verificar se o usuário é bibliotecário e redirecionar se for
      if (tipoUsuario === 'bibliotecario') {
        navigate('/bibliotecario');
        return;
      }
    } else {
      localStorage.removeItem('userName');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('tipoUsuario');
      setUserName('');
    }

    carregarLivros();
    carregarAutores();
    carregarCategorias();
    window.addEventListener('storage', carregarLivros);
    window.addEventListener('livrosAtualizados', carregarLivros);

    return () => {
      window.removeEventListener('storage', carregarLivros);
      window.removeEventListener('livrosAtualizados', carregarLivros);
    };
  }, []);

  const handleSearch = async () => {
    try {
      
      // Construir a URL com os parâmetros de filtro
      let url = new URL('/php/filtrarlivros.php', window.location.origin);
      
      // Adicionar parâmetros de busca se existirem
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

  return (
    <div className={styles.pageWrapper}>
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
              <div className={styles.notificationIcon}><i className="fas fa-bell"></i></div>
              <div className={styles.userGreeting} onClick={() => setShowLoginStatus(!showLoginStatus)}>
                <i className="fas fa-user"></i>
                {userName ? <span>Olá, {userName}!</span> : <span className={styles.loginPrompt}>Fazer login</span>}
                {showLoginStatus && (
                  <div className={styles.loginStatus}>
                    {userName ? (
                      <div>
                        <p>Logado como: {userName}</p>
                        <button 
                          className={styles.logoutButton}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            localStorage.removeItem('userName'); 
                            localStorage.removeItem('isLoggedIn'); 
                            localStorage.removeItem('tipoUsuario');
                            setUserName(''); 
                            setShowLoginStatus(false); 
                            navigate('/login');
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
                          onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
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
              <li className={styles.navItem}><a className={styles.navLink} href="#">Livros</a></li>
              <li className={styles.navItem}><a className={styles.navLink} href="#">Categorias</a></li>
              <li className={styles.navItem}><a className={styles.navLink} href="#">Autores</a></li>
              <li className={styles.navItem}><a className={styles.navLink} href="#">Contato</a></li>
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
            <h2 className={styles.sectionTitle}>Livros Disponíveis</h2>
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
                    onClick={() => {
                      setLivroSelecionado(livro);
                      setMostrarDetalhes(true);
                    }}
                  />
                  <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{livro.titulo}</h3>
                    <p className={styles.bookAuthor}>{livro.autor}</p>
                    <p className={styles.bookPrice}>R$ {livro.preco}</p>
                    <button 
                      className={styles.detailsButton}
                      onClick={() => {
                        setLivroSelecionado(livro);
                        setMostrarDetalhes(true);
                      }}
                    >
                      Ver Detalhes
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
              <p>Todos os produtos estão sujeitos a alteração de preço sem prévia comunicação.</p>
              <p>Biblioteca SENAI - www.bibliotecasenai.com.br |  Rua Residêncial 6 - Loteamento Nova Fronteira - Paraíso do Tocantins/TO</p>
            </div>
            <div className={styles.footerCopyright}>
              <p>© 2025 Biblioteca SENAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

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
                  <p className={styles.livroPreco}><strong>Preço:</strong> R$ {livroSelecionado.preco}</p>
                  <div className={styles.livroDescricao}>
                    <h3>Descrição:</h3>
                    <p>{livroSelecionado.descricao || 'Nenhuma descrição disponível para este livro.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className={chatStyles.chatCategoriaWrapper}>
          <ChatCategoria categoria={category || (categorias.length > 0 ? categorias[0] : 'Geral')} />
        </div>
      </div>
    </div>
  );
};

export default PaginaIsolada;
