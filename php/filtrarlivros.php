<?php
// Permite requisições de qualquer origem (para testes)
header("Access-Control-Allow-Origin: http://localhost:5174");
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

// Recebe os parâmetros de filtro
$searchTerm = isset($_GET['searchTerm']) ? $_GET['searchTerm'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';
$author = isset($_GET['author']) ? $_GET['author'] : '';
$keywords = isset($_GET['keywords']) ? json_decode($_GET['keywords']) : [];

// Inicia a construção da consulta SQL
$sql = "SELECT id, titulo, autor, ano, editora, genero,isbn, paginas, descricao, capa FROM livros WHERE 1=1";
$params = [];
$types = "";

// Adiciona condições de filtro se fornecidas
if (!empty($searchTerm)) {
    $sql .= " AND (titulo LIKE ? OR autor LIKE ? OR descricao LIKE ?)";
    $searchParam = "%$searchTerm%";
    $params[] = $searchParam;
    $params[] = $searchParam;
    $params[] = $searchParam;
    $types .= "sss";
}

if (!empty($category)) {
    $sql .= " AND genero LIKE ?";
    $params[] = "%$category%";
    $types .= "s";
}

if (!empty($author)) {
    $sql .= " AND autor LIKE ?";
    $params[] = "%$author%";
    $types .= "s";
}

// Adiciona condições para palavras-chave
if (!empty($keywords)) {
    $keywordConditions = [];
    foreach ($keywords as $kw) {
        $keywordConditions[] = "(titulo LIKE ? OR descricao LIKE ?)";
        $kwParam = "%$kw%";
        $params[] = $kwParam;
        $params[] = $kwParam;
        $types .= "ss";
    }
    if (!empty($keywordConditions)) {
        $sql .= " AND (" . implode(" OR ", $keywordConditions) . ")";
    }
}

// Ordena por ID decrescente (mais recentes primeiro)
$sql .= " ORDER BY id DESC";

// Prepara e executa a consulta
$stmt = $conexao->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// Processa os resultados
$livros = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['capa'] = $row['capa'] 
            ? "http://localhost/php/uploads/" . basename($row['capa']) 
            : "http://localhost/php/img/Biblioteca.png"; // imagem padrão
        $livros[] = $row;
    }
}

// Retorna os resultados como JSON
echo json_encode($livros);

$stmt->close();
$conexao->close();
?>