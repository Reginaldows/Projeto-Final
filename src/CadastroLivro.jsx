import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Book, User, Calendar, Globe, DollarSign, Hash, Building, Tag, FileText, Search, Library, MapPin, Copy } from 'lucide-react';
import Acessibilidade from './acessibilidade';
import styles from './cadastrolivro.module.css';

export default function CadastroLivro() {
  const navigate = useNavigate();
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewCapa, setPreviewCapa] = useState(null);
  const [urlCapaAPI, setUrlCapaAPI] = useState(null);
  const [generosSelecionados, setGenerosSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [buscandoISBN, setBuscandoISBN] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    autores: '',
    isbn: '',
    editora: '',
    anoPublicacao: '',
    genero: '',
    numeroPaginas: '',
    idioma: '',
    descricao: '',
    cdd: '',
    localizacao: '',
    quantidadeCopias: '',
    capa: null
  });

  const [validacao, setValidacao] = useState({
    titulo: { valido: false, mensagem: '' },
    autores: { valido: false, mensagem: '' },
    isbn: { valido: false, mensagem: '' },
    editora: { valido: false, mensagem: '' },
    anoPublicacao: { valido: false, mensagem: '' },
    numeroPaginas: { valido: false, mensagem: '' },
    idioma: { valido: false, mensagem: '' },
    descricao: { valido: true, mensagem: '' },
    cdd: { valido: false, mensagem: '' },
    localizacao: { valido: false, mensagem: '' },
    quantidadeCopias: { valido: false, mensagem: '' }
  });

  const generosDisponiveis = [
    'Ficção', 'Romance', 'Mistério', 'Fantasia', 'Ficção Científica',
    'Biografia', 'História', 'Ciência', 'Tecnologia', 'Negócios',
    'Autoajuda', 'Saúde', 'Culinária', 'Arte', 'Filosofia',
    'Religião', 'Educação'
  ];

  const idiomasDisponiveis = [
    'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão',
    'Italiano', 'Japonês', 'Chinês', 'Russo', 'Árabe'
  ];

  // Mapeamento CDD para categorias
  const mapaCDD = {
    '0': ['Conhecimento geral', 'Informática', 'Bibliografia'],
    '1': ['Filosofia'],
    '2': ['Religião'],
    '3': ['Ciências sociais'],
    '4': ['Linguagem'],
    '5': ['Ciências naturais e matemática'],
    '6': ['Tecnologia'],
    '7': ['Artes e recreação'],
    '8': ['Literatura'],
    '9': ['História e geografia']
  };

  const sugerirCategoriasPorCDD = (cdd) => {
    if (!cdd) return [];
    
    const primeiroDigito = cdd.charAt(0);
    const categoria = mapaCDD[primeiroDigito];
    
    if (categoria) {
      // Mapeia para os gêneros disponíveis
      const sugestoes = [];
      
      switch (primeiroDigito) {
        case '0':
          sugestoes.push('Tecnologia', 'Ciência');
          break;
        case '1':
          sugestoes.push('Filosofia');
          break;
        case '2':
          sugestoes.push('Religião');
          break;
        case '3':
          sugestoes.push('História', 'Educação');
          break;
        case '5':
          sugestoes.push('Ciência', 'Saúde');
          break;
        case '6':
          sugestoes.push('Tecnologia', 'Negócios', 'Saúde');
          break;
        case '7':
          sugestoes.push('Arte');
          break;
        case '8':
          sugestoes.push('Ficção', 'Romance', 'Literatura', 'Clássico');
          break;
        case '9':
          sugestoes.push('História', 'Biografia');
          break;
      }
      
      return sugestoes.filter(sugestao => generosDisponiveis.includes(sugestao));
    }
    
    return [];
  };

  useEffect(() => {
    validarCampo('titulo', formData.titulo);
  }, [formData.titulo]);

  useEffect(() => {
    validarCampo('autores', formData.autores);
  }, [formData.autores]);

  useEffect(() => {
    validarCampo('isbn', formData.isbn);
  }, [formData.isbn]);

  useEffect(() => {
    validarCampo('editora', formData.editora);
  }, [formData.editora]);

  useEffect(() => {
    validarCampo('anoPublicacao', formData.anoPublicacao);
  }, [formData.anoPublicacao]);

  useEffect(() => {
    validarCampo('numeroPaginas', formData.numeroPaginas);
  }, [formData.numeroPaginas]);

  useEffect(() => {
    validarCampo('idioma', formData.idioma);
  }, [formData.idioma]);

  useEffect(() => {
    validarCampo('descricao', formData.descricao);
  }, [formData.descricao]);



  useEffect(() => {
    validarCampo('cdd', formData.cdd);
  }, [formData.cdd]);

  useEffect(() => {
    validarCampo('localizacao', formData.localizacao);
  }, [formData.localizacao]);

  useEffect(() => {
    validarCampo('quantidadeCopias', formData.quantidadeCopias);
  }, [formData.quantidadeCopias]);

  useEffect(() => {
    if (formData.cdd) {
      const sugestoes = sugerirCategoriasPorCDD(formData.cdd);
      if (sugestoes.length > 0 && generosSelecionados.length === 0) {
        // Sugere automaticamente as categorias se nenhuma estiver selecionada
        setGenerosSelecionados(sugestoes);
        setFormData(prev => ({
          ...prev,
          genero: sugestoes.join(', ')
        }));
      }
    }
  }, [formData.cdd, generosSelecionados.length]);

  const validarCampo = (campo, valor) => {
    let valido = false;
    let mensagem = '';

    switch (campo) {
      case 'titulo':
        valido = valor.length >= 2;
        mensagem = valido ? '' : 'Título deve ter pelo menos 2 caracteres';
        break;
      case 'autores':
        valido = valor.length >= 2;
        mensagem = valido ? '' : 'Nome do autor deve ter pelo menos 2 caracteres';
        break;
      case 'isbn':
        const isbnLimpo = valor.replace(/[-\s]/g, '');
        valido = isbnLimpo.length === 10 || isbnLimpo.length === 13;
        mensagem = valido ? '' : 'ISBN deve ter 10 ou 13 dígitos';
        break;
      case 'editora':
        valido = valor.length >= 2;
        mensagem = valido ? '' : 'Nome da editora deve ter pelo menos 2 caracteres';
        break;
      case 'anoPublicacao':
        const ano = parseInt(valor);
        const anoAtual = new Date().getFullYear();
        valido = ano >= 1000 && ano <= anoAtual;
        mensagem = valido ? '' : `Ano deve estar entre 1000 e ${anoAtual}`;
        break;
      case 'numeroPaginas':
        const paginas = parseInt(valor);
        valido = paginas > 0 && paginas <= 10000;
        mensagem = valido ? '' : 'Número de páginas deve ser entre 1 e 10000';
        break;
      case 'idioma':
        valido = valor.length > 0;
        mensagem = valido ? '' : 'Selecione um idioma';
        break;
      case 'descricao':
        valido = true;
        break;
      case 'cdd':
        valido = valor.trim().length > 0;
        mensagem = valido ? '' : 'CDD é obrigatório';
        break;
      case 'localizacao':
        valido = valor.trim().length > 0;
        mensagem = valido ? '' : 'Localização é obrigatória';
        break;
      case 'quantidadeCopias':
        const copias = parseInt(valor);
        valido = copias > 0 && copias <= 1000;
        mensagem = valido ? '' : 'Quantidade deve ser entre 1 e 1000 cópias';
        break;
    }

    setValidacao(prev => ({
      ...prev,
      [campo]: { valido, mensagem }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let valorFormatado = value;
    
    if (name === 'isbn') {
      valorFormatado = value.replace(/[^\d-]/g, '');
    } else if (name === 'numeroPaginas' || name === 'anoPublicacao' || name === 'quantidadeCopias') {
      valorFormatado = value.replace(/[^\d]/g, '');
    } else if (name === 'cdd') {
      valorFormatado = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFormatado
    }));
  };

  const buscarLivroPorISBN = async () => {
    const isbnLimpo = formData.isbn.replace(/[-\s]/g, '');
    
    if (isbnLimpo.length !== 10 && isbnLimpo.length !== 13) {
      setMensagem('ISBN deve ter 10 ou 13 dígitos para buscar dados do livro.');
      setTipoMensagem('erro');
      setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 3000);
      return;
    }

    setBuscandoISBN(true);
    
    try {
      // Busca na API Open Library
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbnLimpo}&format=json&jscmd=data`);
      const data = await response.json();
      
      const bookKey = `ISBN:${isbnLimpo}`;
      const bookData = data[bookKey];
      
      if (bookData) {
        // Preenche os campos com os dados encontrados
        const autores = bookData.authors ? bookData.authors.map(author => author.name).join(', ') : '';
        const editoras = bookData.publishers ? bookData.publishers.map(pub => pub.name).join(', ') : '';
        const anoPublicacao = bookData.publish_date ? new Date(bookData.publish_date).getFullYear().toString() : '';
        
        // Busca a URL da imagem da capa
        let urlCapa = null;
        if (bookData.cover) {
          // URL da imagem da Open Library
          urlCapa = bookData.cover.large || bookData.cover.medium || bookData.cover.small;
        }
        
        // Define a URL da capa para preview
        if (urlCapa) {
          setUrlCapaAPI(urlCapa);
          setPreviewCapa(urlCapa);
        }
        
        setFormData(prev => ({
          ...prev,
          titulo: bookData.title || prev.titulo,
          autores: autores || prev.autores,
          editora: editoras || prev.editora,
          anoPublicacao: anoPublicacao || prev.anoPublicacao,
          numeroPaginas: bookData.number_of_pages ? bookData.number_of_pages.toString() : prev.numeroPaginas,
          descricao: bookData.notes || bookData.subtitle || prev.descricao
        }));
        
        // Define gêneros se disponível
        if (bookData.subjects && bookData.subjects.length > 0) {
          const generosEncontrados = bookData.subjects
            .filter(subject => generosDisponiveis.includes(subject.name))
            .map(subject => subject.name);
          
          if (generosEncontrados.length > 0) {
            setGenerosSelecionados(generosEncontrados);
            setFormData(prev => ({
              ...prev,
              genero: generosEncontrados.join(', ')
            }));
          }
        }
        
        setMensagem('Dados do livro encontrados e preenchidos automaticamente!');
        setTipoMensagem('sucesso');
      } else {
        setMensagem('Livro não encontrado na base de dados. Preencha os campos manualmente.');
        setTipoMensagem('aviso');
      }
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      setMensagem('Erro ao buscar dados do livro. Verifique sua conexão e tente novamente.');
      setTipoMensagem('erro');
    } finally {
      setBuscandoISBN(false);
      setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 5000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMensagem('Arquivo muito grande. Máximo 5MB.');
        setTipoMensagem('erro');
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMensagem('Apenas arquivos de imagem são permitidos.');
        setTipoMensagem('erro');
        setTimeout(() => {
          setMensagem('');
          setTipoMensagem('');
        }, 3000);
        return;
      }

      setFormData(prev => ({ ...prev, capa: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewCapa(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleGenero = (genero) => {
    setGenerosSelecionados(prev => {
      const novosGeneros = prev.includes(genero)
        ? prev.filter(g => g !== genero)
        : [...prev, genero];
      
      setFormData(prevForm => ({
        ...prevForm,
        genero: novosGeneros.join(', ')
      }));
      
      return novosGeneros;
    });
  };

  const formularioValido = () => {
    return Object.values(validacao).every(campo => campo.valido) &&
           formData.titulo && formData.autores && formData.isbn &&
           formData.editora && formData.anoPublicacao && formData.numeroPaginas &&
           formData.idioma && formData.cdd &&
           formData.localizacao && formData.quantidadeCopias && generosSelecionados.length > 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formularioValido()) {
    setMensagem('Por favor, preencha todos os campos corretamente.');
    setTipoMensagem('erro');
    setTimeout(() => { setMensagem(''); setTipoMensagem(''); }, 3000);
    return;
  }

  setLoading(true);

  try {
    let body;
    let headers = {};

    if (formData.capa) {
      body = new FormData();
      body.append('titulo', formData.titulo);
      body.append('autor', formData.autores);
      body.append('isbn', formData.isbn);
      body.append('editora', formData.editora);
      body.append('ano', formData.anoPublicacao);
      body.append('genero', generosSelecionados.join(', '));
      body.append('paginas', formData.numeroPaginas);
      body.append('idioma', formData.idioma);
      body.append('descricao', formData.descricao);
      body.append('cdd', formData.cdd);
      body.append('localizacao', formData.localizacao);
      body.append('quantidadeCopias', formData.quantidadeCopias);
      if (formData.capa) {
        body.append('capa', formData.capa, formData.capa.name);
      } else if (urlCapaAPI) {
        body.append('urlCapa', urlCapaAPI);
      }
    } else {
        const dadosForm = {
          titulo: formData.titulo,
          autor: formData.autores,
          isbn: formData.isbn,
          editora: formData.editora,
          ano: formData.anoPublicacao,
          genero: generosSelecionados.join(', '),
          paginas: formData.numeroPaginas,
          idioma: formData.idioma,
          descricao: formData.descricao,
          cdd: formData.cdd,
          localizacao: formData.localizacao,
          quantidadeCopias: formData.quantidadeCopias
        };
        
        if (urlCapaAPI) {
          dadosForm.urlCapa = urlCapaAPI;
        }
        
        const dados = new URLSearchParams(dadosForm);
      body = dados.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch('http://localhost/php/cadastrolivro.php', {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const resultado = await response.json();

    if (resultado.success) {
      setMensagem(resultado.message);
      setTipoMensagem('sucesso');
      window.dispatchEvent(new Event('livrosAtualizados'));

      setFormData({
        titulo: '', autores: '', isbn: '', editora: '', anoPublicacao: '',
        genero: '', numeroPaginas: '', idioma: '', descricao: '',
        cdd: '', localizacao: '', capa: null
      });
      setGenerosSelecionados([]);
      setPreviewCapa(null);
      setUrlCapaAPI(null);
    } else {
      setMensagem(resultado.message);
      setTipoMensagem('erro');
    }

    setTimeout(() => { setMensagem(''); setTipoMensagem(''); }, 3000);

  } catch (error) {
    console.error(error);
    setMensagem('Erro ao cadastrar livro.');
    setTipoMensagem('erro');
    setTimeout(() => { setMensagem(''); setTipoMensagem(''); }, 3000);
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
      
      <div className={styles.container}>
        {mensagem && (
          <div className={`${styles.mensagemFeedback} ${styles[tipoMensagem]}`}>
            {mensagem}
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <span className={styles.logoBiblioteca}>Biblioteca</span>
            <img src="/img/logoSenai.png" alt="SENAI" className={styles.logoSenai} />
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.tituloPrincipal}>
              <Book className={styles.iconeTitulo} />
              Cadastro de Livros
            </h1>
            <p className={styles.subtitulo}>Adicione um novo livro ao acervo da biblioteca</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.campoUpload}>
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.uploadInput}
                />
                <div className={styles.uploadArea}>
                  {previewCapa ? (
                    <div className={styles.previewContainer}>
                      <img src={previewCapa} alt="Preview da capa" className={styles.previewImage} />
                      <div className={styles.uploadOverlay}>
                        <Upload className={styles.uploadIcon} />
                        <span>Alterar capa</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <Upload className={styles.uploadIcon} />
                      <span>Clique para adicionar a capa</span>
                      <small>PNG, JPG até 5MB</small>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className={styles.camposContainer}>
              <div className={styles.campoGrupo}>
                <label htmlFor="titulo" className={styles.campoLabel}>
                  <Book className={styles.campoIcone} />
                  Título do Livro *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.titulo.valido ? styles.valido : formData.titulo ? styles.invalido : ''}`}
                  placeholder="Digite o título do livro"
                  required
                />
                {validacao.titulo.mensagem && (
                  <span className={styles.campoErro}>{validacao.titulo.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="autores" className={styles.campoLabel}>
                  <User className={styles.campoIcone} />
                  Autor(es) *
                </label>
                <input
                  type="text"
                  id="autores"
                  name="autores"
                  value={formData.autores}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.autores.valido ? styles.valido : formData.autores ? styles.invalido : ''}`}
                  placeholder="Nome do(s) autor(es)"
                  required
                />
                {validacao.autores.mensagem && (
                  <span className={styles.campoErro}>{validacao.autores.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="isbn" className={styles.campoLabel}>
                  <Hash className={styles.campoIcone} />
                  ISBN *
                </label>
                <div className={styles.isbnContainer}>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className={`${styles.campoInput} ${styles.isbnInput} ${validacao.isbn.valido ? styles.valido : formData.isbn ? styles.invalido : ''}`}
                    placeholder="978-85-123-4567-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={buscarLivroPorISBN}
                    disabled={!validacao.isbn.valido || buscandoISBN}
                    className={styles.botaoBuscarISBN}
                    title="Buscar dados do livro pelo ISBN"
                  >
                    {buscandoISBN ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <Search className={styles.iconeSearch} />
                    )}
                  </button>
                </div>
                {validacao.isbn.mensagem && (
                  <span className={styles.campoErro}>{validacao.isbn.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="editora" className={styles.campoLabel}>
                  <Building className={styles.campoIcone} />
                  Editora *
                </label>
                <input
                  type="text"
                  id="editora"
                  name="editora"
                  value={formData.editora}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.editora.valido ? styles.valido : formData.editora ? styles.invalido : ''}`}
                  placeholder="Nome da editora"
                  required
                />
                {validacao.editora.mensagem && (
                  <span className={styles.campoErro}>{validacao.editora.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="anoPublicacao" className={styles.campoLabel}>
                  <Calendar className={styles.campoIcone} />
                  Ano de Publicação *
                </label>
                <input
                  type="number"
                  id="anoPublicacao"
                  name="anoPublicacao"
                  value={formData.anoPublicacao}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.anoPublicacao.valido ? styles.valido : formData.anoPublicacao ? styles.invalido : ''}`}
                  placeholder="2024"
                  min="1000"
                  max={new Date().getFullYear()}
                  required
                />
                {validacao.anoPublicacao.mensagem && (
                  <span className={styles.campoErro}>{validacao.anoPublicacao.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="numeroPaginas" className={styles.campoLabel}>
                  <FileText className={styles.campoIcone} />
                  Número de Páginas *
                </label>
                <input
                  type="number"
                  id="numeroPaginas"
                  name="numeroPaginas"
                  value={formData.numeroPaginas}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.numeroPaginas.valido ? styles.valido : formData.numeroPaginas ? styles.invalido : ''}`}
                  placeholder="300"
                  min="1"
                  max="10000"
                  required
                />
                {validacao.numeroPaginas.mensagem && (
                  <span className={styles.campoErro}>{validacao.numeroPaginas.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="idioma" className={styles.campoLabel}>
                  <Globe className={styles.campoIcone} />
                  Idioma *
                </label>
                <select
                  id="idioma"
                  name="idioma"
                  value={formData.idioma}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.idioma.valido ? styles.valido : formData.idioma ? styles.invalido : ''}`}
                  required
                >
                  <option value="">Selecione o idioma</option>
                  {idiomasDisponiveis.map(idioma => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>
                {validacao.idioma.mensagem && (
                  <span className={styles.campoErro}>{validacao.idioma.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="descricao" className={styles.campoLabel}>
                  <FileText className={styles.campoIcone} />
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${styles.campoTextarea}`}
                  placeholder="Descrição do livro (opcional)"
                  rows="3"
                />
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="cdd" className={styles.campoLabel}>
                  <Library className={styles.campoIcone} />
                  CDD*
                </label>
                <input
                  type="text"
                  id="cdd"
                  name="cdd"
                  value={formData.cdd}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.cdd.valido ? styles.valido : formData.cdd ? styles.invalido : ''}`}
                  placeholder="Ex: 004.678 ou 796.332"
                  required
                />
                {validacao.cdd.mensagem && (
                  <span className={styles.campoErro}>{validacao.cdd.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="localizacao" className={styles.campoLabel}>
                  <MapPin className={styles.campoIcone} />
                  Localização na Estante *
                </label>
                <input
                  type="text"
                  id="localizacao"
                  name="localizacao"
                  value={formData.localizacao}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.localizacao.valido ? styles.valido : formData.localizacao ? styles.invalido : ''}`}
                  placeholder="Ex: Estante A - Prateleira 3 - Posição 15"
                  required
                />
                {validacao.localizacao.mensagem && (
                  <span className={styles.campoErro}>{validacao.localizacao.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="quantidadeCopias" className={styles.campoLabel}>
                  <Copy className={styles.campoIcone} />
                  Quantidade de Cópias *
                </label>
                <input
                  type="number"
                  id="quantidadeCopias"
                  name="quantidadeCopias"
                  value={formData.quantidadeCopias}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.quantidadeCopias.valido ? styles.valido : formData.quantidadeCopias ? styles.invalido : ''}`}
                  placeholder="1"
                  min="1"
                  max="1000"
                  required
                />
                {validacao.quantidadeCopias.mensagem && (
                  <span className={styles.campoErro}>{validacao.quantidadeCopias.mensagem}</span>
                )}
              </div>

              <div className={styles.campoGrupo}>
              </div>
            </div>
          </div>

          <div className={styles.generosSection}>
            <label className={styles.campoLabel}>
              <Tag className={styles.campoIcone} />
              Gênero/Categoria *
            </label>
            <div className={styles.generosGrid}>
              {generosDisponiveis.map(genero => (
                <button
                  key={genero}
                  type="button"
                  onClick={() => toggleGenero(genero)}
                  className={`${styles.generoChip} ${generosSelecionados.includes(genero) ? styles.selecionado : ''}`}
                >
                  {genero}
                </button>
              ))}
            </div>
            {generosSelecionados.length === 0 && (
              <span className={styles.campoErro}>Selecione pelo menos um gênero</span>
            )}
          </div>

          <div className={styles.acoesContainer}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.btnCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btnCadastrar} ${formularioValido() ? styles.ativo : ''}`}
              disabled={!formularioValido() || loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Livro'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )};