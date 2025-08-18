
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './biblioteca.module.css';

const PaginaIsolada = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [userName, setUserName] = useState('');
  const [showLoginStatus, setShowLoginStatus] = useState(false);
  
  // Carregar o nome do usuário do localStorage quando o componente for montado
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);
  
  const handleSearch = () => {
    console.log('Buscando com os filtros:', {
      searchTerm,
      category,
      author,
      keywords
    });
    // Aqui seria implementada a lógica de busca real
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
    if (e.key === 'Enter') {
      addKeyword();
    }
  };
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.travessa}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <h1 className={styles.logoTitle}>
              <div className={styles.logoContainer}>
                <span>Biblioteca</span>
                <img src="/img/logoSenai.png" alt="Logo SENAI" className={styles.logoImage} />
              </div>
            </h1>
            <div className={styles.userGreeting} onClick={() => setShowLoginStatus(!showLoginStatus)}>
              <i className="fas fa-user"></i>
              {userName ? (
                <span>Olá, {userName}!</span>
              ) : (
                <span className={styles.loginPrompt}>Fazer login</span>
              )}
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
                          setUserName('');
                          setShowLoginStatus(false);
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/login');
                        }}
                      >
                        Entrar
                      </button>
                    </div>
                  )}
                </div>
              )}
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
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Buscar livros..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className={styles.searchButton}
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
            <div className={styles.searchFilters}>
              <select 
                className={styles.filterSelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Filtrar por categoria</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="programacao">Programação</option>
                <option value="redes">Redes</option>
                <option value="dados">Banco de Dados</option>
                <option value="ia">Inteligência Artificial</option>
              </select>
              <select 
                className={styles.filterSelect}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              >
                <option value="">Filtrar por autor</option>
                <option value="joao">João Silva</option>
                <option value="maria">Maria Santos</option>
                <option value="carlos">Carlos Oliveira</option>
                <option value="ana">Ana Pereira</option>
              </select>
              <div className={styles.keywordFilter}>
                <input 
                  type="text" 
                  className={styles.keywordInput} 
                  placeholder="Palavras-chave" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className={styles.keywordButton}
                  onClick={addKeyword}
                >
                  +
                </button>
              </div>
            </div>
            {keywords.length > 0 && (
              <div className={styles.keywordTags}>
                {keywords.map((kw, index) => (
                  <span key={index} className={styles.keywordTag}>
                    {kw}
                    <button 
                      className={styles.removeKeyword}
                      onClick={() => removeKeyword(kw)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Carrossel */}
        <section className={styles.carousel}>
          <div className={styles.carouselSlide}>
            <div className={styles.carouselContent}>
              <h2 className={styles.carouselTitle}>Amplie seus horizontes</h2>
              <p className={styles.carouselText}>Descubra leituras que inspiram e transformam</p>
            </div>
          </div>
        </section>

        {/* Seções de Livros */}
        <section className={styles.bookSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Lançamentos</h2>
            <a href="#" className={styles.sectionLink}>Ver Mais</a>
          </div>
          <div className={styles.booksGrid}>
            {/* Livro 1 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Programação em Python</h3>
                <p className={styles.bookAuthor}>João Silva</p>
                <p className={styles.bookPrice}>R$ 89,90</p>
              </div>
            </div>
            {/* Livro 2 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Redes de Computadores</h3>
                <p className={styles.bookAuthor}>Maria Santos</p>
                <p className={styles.bookPrice}>R$ 105,50</p>
              </div>
            </div>
            {/* Livro 3 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Inteligência Artificial</h3>
                <p className={styles.bookAuthor}>Carlos Oliveira</p>
                <p className={styles.bookPrice}>R$ 129,90</p>
              </div>
            </div>
            {/* Livro 4 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Banco de Dados</h3>
                <p className={styles.bookAuthor}>Ana Pereira</p>
                <p className={styles.bookPrice}>R$ 75,00</p>
              </div>
            </div>
            {/* Livro 5 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Desenvolvimento Web</h3>
                <p className={styles.bookAuthor}>Pedro Costa</p>
                <p className={styles.bookPrice}>R$ 95,00</p>
              </div>
            </div>
            {/* Livro 6 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Segurança da Informação</h3>
                <p className={styles.bookAuthor}>Lucia Mendes</p>
                <p className={styles.bookPrice}>R$ 110,00</p>
              </div>
            </div>
            {/* Livro 7 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Cloud Computing</h3>
                <p className={styles.bookAuthor}>Roberto Alves</p>
                <p className={styles.bookPrice}>R$ 120,00</p>
              </div>
            </div>
            {/* Livro 8 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Machine Learning</h3>
                <p className={styles.bookAuthor}>Carla Souza</p>
                <p className={styles.bookPrice}>R$ 145,90</p>
              </div>
            </div>
            {/* Livro 9 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>DevOps na Prática</h3>
                <p className={styles.bookAuthor}>Marcos Lima</p>
                <p className={styles.bookPrice}>R$ 89,90</p>
              </div>
            </div>
            {/* Livro 10 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Blockchain</h3>
                <p className={styles.bookAuthor}>Fernanda Dias</p>
                <p className={styles.bookPrice}>R$ 110,00</p>
              </div>
            </div>
            {/* Livro 11 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Cibersegurança</h3>
                <p className={styles.bookAuthor}>Rafael Gomes</p>
                <p className={styles.bookPrice}>R$ 95,50</p>
              </div>
            </div>
            {/* Livro 12 (Antigo Pré-Venda) */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Análise de Dados</h3>
                <p className={styles.bookAuthor}>Juliana Castro</p>
                <p className={styles.bookPrice}>R$ 78,90</p>
              </div>
            </div>
          </div>
        </section>

        {/* Livros mais procurados */}
        <section className={styles.bookSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Livros mais procurados</h2>
            <a href="#" className={styles.sectionLink}>Ver Mais</a>
          </div>
          <div className={styles.booksGrid}>
            {/* Livro 1 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Algoritmos</h3>
                <p className={styles.bookAuthor}>Paulo Silveira</p>
                <p className={styles.bookPrice}>R$ 69,90</p>
              </div>
            </div>
            {/* Livro 2 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>UX Design</h3>
                <p className={styles.bookAuthor}>Mariana Costa</p>
                <p className={styles.bookPrice}>R$ 85,00</p>
              </div>
            </div>
            {/* Livro 3 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Gestão de Projetos</h3>
                <p className={styles.bookAuthor}>Ricardo Martins</p>
                <p className={styles.bookPrice}>R$ 79,90</p>
              </div>
            </div>
            {/* Livro 4 */}
            <div className={styles.bookCard}>
              <div className={styles.bookCover}></div>
              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>Arquitetura de Software</h3>
                <p className={styles.bookAuthor}>Daniela Rocha</p>
                <p className={styles.bookPrice}>R$ 115,00</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerInfo}>
              <p>Os preços apresentados nesse site não são necessariamente iguais aos das lojas físicas.</p>
              <p>Todos os produtos estão sujeitos a alteração de preço sem prévia comunicação.</p>
              <p>Biblioteca SENAI - www.bibliotecasenai.com.br | Rua Exemplo, n. 123, Centro - São Paulo</p>
            </div>
            <div className={styles.footerCopyright}>
              <p>© 2025 Biblioteca SENAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PaginaIsolada;
