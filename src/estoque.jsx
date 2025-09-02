import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './estoque.css';
import Acessibilidade from './acessibilidade'; // 👈 importa o componente

export default function ListagemEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [leituraAtiva, setLeituraAtiva] = useState(false); // 👈 estado da acessibilidade
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost/php/estoque.php')
      .then(response => {
        if (!response.ok) throw new Error('Falha na rede');
        return response.json();
      })
      .then(data => {
        if (data.success) setProdutos(data.data);
        else setErro(data.message || 'Erro desconhecido');
      })
      .catch(error => setErro(error.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <div className="loading">Carregando estoque...</div>;
  if (erro) return <div className="error">Erro: {erro}</div>;

  return (
    <div className="container-estoque">
      {/* Barra de acessibilidade no topo 👇 */}
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />

      <div className="header-estoque">
        <h1>📦 Inventário de Estoque</h1>
        <button onClick={() => navigate('/relatorio')} className="btn-relatorio">
          📊 Relatório Completo
        </button>
      </div>

      <table className="tabela-estoque">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código</th>
            <th>Qtd.</th>
            <th>Categoria</th>
            <th>Última Atualização</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id} className={produto.quantidade < 5 ? 'estoque-baixo' : ''}>
              <td>{produto.nome_produto}</td>
              <td>{produto.codigo_barras || 'N/A'}</td>
              <td>{produto.quantidade}</td>
              <td>{produto.categoria || '-'}</td>
              <td>{produto.data_atualizacao}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {produtos.length === 0 && (
        <p className="empty">Nenhum produto cadastrado no estoque.</p>
      )}
    </div>
  );
}
