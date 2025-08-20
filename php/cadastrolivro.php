<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Conexão
require 'conexao.php';

// Receber dados (JSON ou FormData)
$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data) {
    // fallback para $_POST
    $data = $_POST;
}

// Campos obrigatórios
$camposObrigatorios = ['titulo', 'autor', 'isbn', 'editora', 'ano', 'genero', 'paginas', 'idioma', 'preco'];
foreach ($camposObrigatorios as $campo) {
    if (empty($data[$campo])) {
        echo json_encode(["success" => false, "message" => "Campo obrigatório '$campo' não preenchido."]);
        exit;
    }
}

// Receber dados
$titulo = trim($data['titulo']);
$autor = trim($data['autor']);
$isbn = trim($data['isbn']);
$editora = trim($data['editora']);
$ano = intval($data['ano']);
$genero = trim($data['genero']);
$paginas = intval($data['paginas']);
$idioma = trim($data['idioma']);
$descricao = trim($data['descricao'] ?? '');
$preco = floatval($data['preco']);

// Upload da capa (se estiver usando FormData)
$caminhoDestino = null;
if (isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK) {
    $uploadsDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
    $ext = pathinfo($_FILES['capa']['name'], PATHINFO_EXTENSION);
    $nomeArquivo = uniqid('capa_') . '.' . $ext;
    $caminhoCompleto = $uploadsDir . $nomeArquivo;
    $caminhoDestino = 'uploads/' . $nomeArquivo;
    move_uploaded_file($_FILES['capa']['tmp_name'], $caminhoCompleto);
}

// Inserir no banco
$stmt = $conexao->prepare("INSERT INTO livros 
    (titulo, autor, isbn, editora, ano, genero, paginas, idioma, descricao, preco, capa) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssissssds",
    $titulo, $autor, $isbn, $editora, $ano, $genero, $paginas, $idioma, $descricao, $preco, $caminhoDestino);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Livro cadastrado com sucesso!", "id" => $conexao->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar livro: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
