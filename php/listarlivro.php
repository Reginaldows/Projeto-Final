<?php
// Permite requisições de qualquer origem (para testes)
header("Access-Control-Allow-Origin: http://localhost:5177");
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
        $row['capa'] = $row['capa'] 
            ? "http://localhost/php/uploads/" . basename($row['capa']) 
            : "http://localhost/php/img/Biblioteca.png"; // imagem padrão
        $livros[] = $row;
    }
}

echo json_encode($livros);

$conexao->close();
?>
