<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Seleciona livros e conta as cópias existentes
$sql = "SELECT l.id, l.titulo, l.autor, l.ano, l.editora, l.genero, l.isbn, l.paginas, 
               l.descricao, l.capa, l.cdd, l.localizacao, COUNT(c.id) AS quantidade_copias
        FROM livros l
        LEFT JOIN copias c ON l.id = c.livro_id
        GROUP BY l.id
        ORDER BY l.id DESC";

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
