import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./inventario-pdf.css";
import Acessibilidade from "./acessibilidade"; // 👈 Componente de acessibilidade

export default function InventarioEstoquePDF() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [leituraAtiva, setLeituraAtiva] = useState(false); // 👈 estado da acessibilidade

  useEffect(() => {
    fetch("http://localhost/php/estoque.php")
      .then((res) => {
        if (!res.ok) throw new Error("Falha na rede");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProdutos(data.data);
        } else {
          setProdutos([]);
          setErro(data.message || "Erro desconhecido");
        }
      })
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false));
  }, []);

  const gerarPDF = () => {
    if (!produtos || produtos.length === 0) {
      alert("Nenhum produto disponível para gerar PDF.");
      return;
    }

    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.text(
      "RELATÓRIO DE ESTOQUE - BIBLIOTECA SENAI",
      105,
      20,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.text(
      `Data: ${new Date().toLocaleDateString()} - Hora: ${new Date().toLocaleTimeString()}`,
      105,
      28,
      { align: "center" }
    );

    // Dados da tabela
    const tableData = produtos.map((prod) => [
      String(prod.nome_produto || "N/A"),
      String(prod.codigo_barras || "N/A"),
      Number(prod.quantidade != null ? prod.quantidade : 0),
      String(prod.categoria || "-"),
      String(prod.data_atualizacao || "-"),
    ]);

    autoTable(doc, {
      head: [["Produto", "Código", "Qtd", "Categoria", "Última Atualização"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });

    doc.save(`relatorio_estoque_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (carregando) return <div className="loading">📡 Carregando inventário...</div>;
  if (erro) return <div className="error">Erro: {erro}</div>;

  return (
    <div className={`inventario-container ${leituraAtiva ? "high-contrast large-font" : ""}`}>
      {/* Barra de acessibilidade */}
      <Acessibilidade leituraAtiva={leituraAtiva} setLeituraAtiva={setLeituraAtiva} />

      <header className="header-inventario">
        <h1>📦 INVENTÁRIO DO ESTOQUE</h1>
        <div className="acoes">
          <button onClick={gerarPDF} className="btn-pdf">
            📄 Gerar PDF
          </button>
        </div>
      </header>

      <div className="grid-inventario">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className={`card-produto ${produto.quantidade < 5 ? "critico" : ""}`}
          >
            <h3>{produto.nome_produto || "N/A"}</h3>
            <div className="detalhes">
              <p><strong>Código:</strong> {produto.codigo_barras || "N/A"}</p>
              <p><strong>Qtd:</strong> {produto.quantidade != null ? produto.quantidade : 0}</p>
              <p><strong>Categoria:</strong> {produto.categoria || "-"}</p>
              <p><strong>Última atualização:</strong> {produto.data_atualizacao || "-"}</p>
            </div>
          </div>
        ))}
      </div>

      {produtos.length === 0 && (
        <p className="empty">Nenhum produto cadastrado no estoque.</p>
      )}
    </div>
  );
}
