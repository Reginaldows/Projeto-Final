import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Book, User, Calendar, Globe, DollarSign, Hash, Building, Tag, FileText } from 'lucide-react';
import Acessibilidade from './acessibilidade';
import styles from './cadastrolivro.module.css';

export default function CadastroLivro() {
  const navigate = useNavigate();
  const [leituraAtiva, setLeituraAtiva] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewCapa, setPreviewCapa] = useState(null);
  const [generosSelecionados, setGenerosSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');

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
    descricao: { valido: true, mensagem: '' }
  });

  const generosDisponiveis = [
    'Ficção', 'Romance', 'Mistério', 'Fantasia', 'Ficção Científica',
    'Biografia', 'História', 'Ciência', 'Tecnologia', 'Negócios',
    'Autoajuda', 'Saúde', 'Culinária', 'Arte', 'Filosofia',
    'Religião', 'Educação', 'Infantil', 'Jovem Adulto', 'Clássico'
  ];

  const idiomasDisponiveis = [
    'Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão',
    'Italiano', 'Japonês', 'Chinês', 'Russo', 'Árabe'
  ];

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
    validarCampo('preco', formData.preco);
  }, [formData.preco]);

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
    } else if (name === 'numeroPaginas' || name === 'anoPublicacao') {
      valorFormatado = value.replace(/[^\d]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFormatado
    }));
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
           formData.idioma && formData.preco !== '' && generosSelecionados.length > 0;
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
      body.append('preco', formData.preco);
      body.append('capa', formData.capa, formData.capa.name);
    } else {
      const dados = new URLSearchParams({
        titulo: formData.titulo,
        autor: formData.autores,
        isbn: formData.isbn,
        editora: formData.editora,
        ano: formData.anoPublicacao,
        genero: generosSelecionados.join(', '),
        paginas: formData.numeroPaginas,
        idioma: formData.idioma,
        descricao: formData.descricao,
        preco: formData.preco
      });
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
        genero: '', numeroPaginas: '', idioma: '', descricao: '', preco: '', capa: null
      });
      setGenerosSelecionados([]);
      setPreviewCapa(null);
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
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className={`${styles.campoInput} ${validacao.isbn.valido ? styles.valido : formData.isbn ? styles.invalido : ''}`}
                  placeholder="978-85-123-4567-8"
                  required
                />
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