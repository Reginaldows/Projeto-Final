<?php
// Permite requisições de qualquer origem (para testes)
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

// Consulta para obter autores únicos da tabela de livros
$sql = "SELECT DISTINCT autor FROM livros ORDER BY autor ASC";

$result = $conexao->query($sql);

$autores = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $autores[] = $row['autor'];
    }
}

echo json_encode($autores);

$conexao->close();
?>