<?php
// Permite requisições de qualquer origem (ajuste conforme sua porta)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Responde às requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclui a conexão com o banco
require 'conexao.php';

$sql = "SELECT id, titulo, autor, ano, editora, genero, preco, isbn, paginas, descricao, capa 
        FROM livros ORDER BY id DESC";

$result = $conexao->query($sql);

$livros = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Categoria para front-end
        $row['categoria'] = $row['genero'];

        // Descrição padrão caso esteja vazia
        $row['descricao'] = $row['descricao'] ? $row['descricao'] : "Nenhuma descrição disponível para este livro.";

        // Capa do livro ou imagem padrão
        $row['capa'] = $row['capa'] 
            ? "/php/uploads/" . basename($row['capa']) 
            : "/public/img/Biblioteca.png";

        $livros[] = $row;
    }
}

// Retorna JSON
echo json_encode($livros);

$conexao->close();
?>
