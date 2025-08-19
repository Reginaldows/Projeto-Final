<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Inclui a conexão com o banco
require 'conexao.php';

$sql = "SELECT id, titulo, autor, ano, editora, genero, preco, isbn, paginas, descricao, capa 
        FROM livros ORDER BY id DESC";

$result = $conexao->query($sql);

$livros = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Se a capa for armazenada como caminho da imagem
        $row['capa'] = $row['capa'] ? "http://localhost/uploads/" . $row['capa'] : null;
        $livros[] = $row;
    }
}

echo json_encode($livros);

// Fecha a conexão (opcional se você fechar no arquivo de conexão)
$conexao->close();
?>
