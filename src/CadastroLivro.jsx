CadastroLivro.jsx 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Book, User, Calendar, Globe, DollarSign, Hash, Building, Tag, FileText } from 'lucide-react';
import Acessibilidade from './acessibilidade';
import './style.css';

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
    preco: '',
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
    preco: { valido: false, mensagem: '' }
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

  // Validação em tempo real
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
        valido = valor.length >= 2;
        mensagem = valido ? '' : 'Selecione um idioma';
        break;
      case 'preco':
        const preco = parseFloat(valor);
        valido = preco >= 0;
        mensagem = valido ? '' : 'Preço deve ser um valor positivo';
        break;
    }

    setValidacao(prev => ({
      ...prev,
      [campo]: { valido, mensagem }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação específica para alguns campos
    let valorFormatado = value;
    
    if (name === 'isbn') {
      valorFormatado = value.replace(/[^\d-]/g, '');
    } else if (name === 'preco') {
      valorFormatado = value.replace(/[^\d.,]/g, '').replace(',', '.');
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
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setMensagem('Arquivo muito grande. Máximo 5MB.');
        setTipoMensagem('erro');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMensagem('Apenas arquivos de imagem são permitidos.');
        setTipoMensagem('erro');
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
      return;
    }

    setLoading(true);

    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMensagem('Livro cadastrado com sucesso!');
      setTipoMensagem('sucesso');
      
      setTimeout(() => {
        navigate('/livros');
      }, 2000);
    } catch (error) {
      setMensagem('Erro ao cadastrar livro. Tente novamente.');
      setTipoMensagem('erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />
      
      <div className="cadastro-livro-container">
        {mensagem && (
          <div className={`mensagem-feedback ${tipoMensagem}`}>
            {mensagem}
          </div>
        )}

        <div className="cadastro-livro-header">
          <div className="logo-container">
            <img src="/img/logoSenai.png" alt="SENAI" className="logo-senai-cadastro" />
          </div>
          <div className="header-content">
            <h1 className="titulo-principal">
              <Book className="icone-titulo" />
              Cadastro de Livros
            </h1>
            <p className="subtitulo">Adicione um novo livro ao acervo da biblioteca</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-cadastro-livro">
          <div className="form-grid">
            {/* Upload da Capa */}
            <div className="campo-upload">
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="upload-input"
                />
                <div className="upload-area">
                  {previewCapa ? (
                    <div className="preview-container">
                      <img src={previewCapa} alt="Preview da capa" className="preview-image" />
                      <div className="upload-overlay">
                        <Upload className="upload-icon" />
                        <span>Alterar capa</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload className="upload-icon" />
                      <span>Clique para adicionar a capa</span>
                      <small>PNG, JPG até 5MB</small>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Campos do formulário */}
            <div className="campos-container">
              {/* Título */}
              <div className="campo-grupo">
                <label htmlFor="titulo" className="campo-label">
                  <Book className="campo-icone" />
                  Título do Livro *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.titulo.valido ? 'valido' : formData.titulo ? 'invalido' : ''}`}
                  placeholder="Digite o título do livro"
                  required
                />
                {validacao.titulo.mensagem && (
                  <span className="campo-erro">{validacao.titulo.mensagem}</span>
                )}
              </div>

              {/* Autores */}
              <div className="campo-grupo">
                <label htmlFor="autores" className="campo-label">
                  <User className="campo-icone" />
                  Autor(es) *
                </label>
                <input
                  type="text"
                  id="autores"
                  name="autores"
                  value={formData.autores}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.autores.valido ? 'valido' : formData.autores ? 'invalido' : ''}`}
                  placeholder="Nome do(s) autor(es)"
                  required
                />
                {validacao.autores.mensagem && (
                  <span className="campo-erro">{validacao.autores.mensagem}</span>
                )}
              </div>

              {/* ISBN */}
              <div className="campo-grupo">
                <label htmlFor="isbn" className="campo-label">
                  <Hash className="campo-icone" />
                  ISBN *
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.isbn.valido ? 'valido' : formData.isbn ? 'invalido' : ''}`}
                  placeholder="978-85-123-4567-8"
                  required
                />
                {validacao.isbn.mensagem && (
                  <span className="campo-erro">{validacao.isbn.mensagem}</span>
                )}
              </div>

              {/* Editora */}
              <div className="campo-grupo">
                <label htmlFor="editora" className="campo-label">
                  <Building className="campo-icone" />
                  Editora *
                </label>
                <input
                  type="text"
                  id="editora"
                  name="editora"
                  value={formData.editora}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.editora.valido ? 'valido' : formData.editora ? 'invalido' : ''}`}
                  placeholder="Nome da editora"
                  required
                />
                {validacao.editora.mensagem && (
                  <span className="campo-erro">{validacao.editora.mensagem}</span>
                )}
              </div>

              {/* Ano de Publicação */}
              <div className="campo-grupo">
                <label htmlFor="anoPublicacao" className="campo-label">
                  <Calendar className="campo-icone" />
                  Ano de Publicação *
                </label>
                <input
                  type="number"
                  id="anoPublicacao"
                  name="anoPublicacao"
                  value={formData.anoPublicacao}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.anoPublicacao.valido ? 'valido' : formData.anoPublicacao ? 'invalido' : ''}`}
                  placeholder="2024"
                  min="1000"
                  max={new Date().getFullYear()}
                  required
                />
                {validacao.anoPublicacao.mensagem && (
                  <span className="campo-erro">{validacao.anoPublicacao.mensagem}</span>
                )}
              </div>

              {/* Número de Páginas */}
              <div className="campo-grupo">
                <label htmlFor="numeroPaginas" className="campo-label">
                  <FileText className="campo-icone" />
                  Número de Páginas *
                </label>
                <input
                  type="number"
                  id="numeroPaginas"
                  name="numeroPaginas"
                  value={formData.numeroPaginas}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.numeroPaginas.valido ? 'valido' : formData.numeroPaginas ? 'invalido' : ''}`}
                  placeholder="300"
                  min="1"
                  max="10000"
                  required
                />
                {validacao.numeroPaginas.mensagem && (
                  <span className="campo-erro">{validacao.numeroPaginas.mensagem}</span>
                )}
              </div>

              {/* Idioma */}
              <div className="campo-grupo">
                <label htmlFor="idioma" className="campo-label">
                  <Globe className="campo-icone" />
                  Idioma *
                </label>
                <select
                  id="idioma"
                  name="idioma"
                  value={formData.idioma}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.idioma.valido ? 'valido' : formData.idioma ? 'invalido' : ''}`}
                  required
                >
                  <option value="">Selecione o idioma</option>
                  {idiomasDisponiveis.map(idioma => (
                    <option key={idioma} value={idioma}>{idioma}</option>
                  ))}
                </select>
                {validacao.idioma.mensagem && (
                  <span className="campo-erro">{validacao.idioma.mensagem}</span>
                )}
              </div>

              {/* Preço */}
              <div className="campo-grupo">
                <label htmlFor="preco" className="campo-label">
                  <DollarSign className="campo-icone" />
                  Preço *
                </label>
                <input
                  type="text"
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  className={`campo-input ${validacao.preco.valido ? 'valido' : formData.preco ? 'invalido' : ''}`}
                  placeholder="29.90"
                  required
                />
                {validacao.preco.mensagem && (
                  <span className="campo-erro">{validacao.preco.mensagem}</span>
                )}
              </div>
            </div>
          </div>

          {/* Seleção de Gêneros */}
          <div className="generos-section">
            <label className="campo-label">
              <Tag className="campo-icone" />
              Gênero/Categoria *
            </label>
            <div className="generos-grid">
              {generosDisponiveis.map(genero => (
                <button
                  key={genero}
                  type="button"
                  onClick={() => toggleGenero(genero)}
                  className={`genero-chip ${generosSelecionados.includes(genero) ? 'selecionado' : ''}`}
                >
                  {genero}
                </button>
              ))}
            </div>
            {generosSelecionados.length === 0 && (
              <span className="campo-erro">Selecione pelo menos um gênero</span>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="acoes-container">
            <button
              type="button"
              onClick={() => navigate('/livros')}
              className="btn-cancelar"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn-cadastrar ${formularioValido() ? 'ativo' : ''}`}
              disabled={!formularioValido() || loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
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
  );
}