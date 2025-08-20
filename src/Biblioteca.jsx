import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './biblioteca.module.css';
import ChatFlutuante from './ChatFlutuante';

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


  const carregarLivros = async () => {
  try {
    console.log('Tentando carregar livros...');
    const response = await fetch('http://localhost:80/php/listarlivro.php');
    
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
      const response = await fetch('http://localhost:80/php/listarautores.php');
      
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
      const response = await fetch('http://localhost:80/php/listarcategorias.php');
      
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

    if (storedUserName && isLoggedIn === 'true') {
      setUserName(storedUserName);
    } else {
      localStorage.removeItem('userName');
      localStorage.removeItem('isLoggedIn');
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
      let url = new URL('http://localhost:80/php/filtrarlivros.php');
      
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
                          onClick={(e) => { e.stopPropagation(); localStorage.removeItem('userName'); localStorage.removeItem('isLoggedIn'); setUserName(''); setShowLoginStatus(false); }}
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
            <h2 className={styles.sectionTitle}>Livros Disponíveis</h2>
            <button onClick={() => navigate('/cadastro-livro')} className={styles.sectionLink}>Cadastrar Novo Livro</button>
          </div>

          <div className={styles.booksGrid}>
            {livrosFiltrados.length > 0 ? (
              livrosFiltrados.map(livro => (
                <div key={livro.id} className={styles.bookCard}>
                  <div
                    className={styles.bookCover}
                    style={{
                      backgroundImage: `url(${livro.capa || 'http://localhost/php/img/Biblioteca.png'})`
                    }}
                  />
                                    <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{livro.titulo}</h3>
                    <p className={styles.bookAuthor}>{livro.autor}</p>
                    <p className={styles.bookPrice}>R$ {livro.preco}</p>
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
        
        <ChatFlutuante />
      </div>
    </div>
  );
};

export default PaginaIsolada;
