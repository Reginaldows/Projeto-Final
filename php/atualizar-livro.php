<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5175");
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

// Verificar ID
if (empty($data['id'])) {
    echo json_encode(["success" => false, "message" => "ID do livro não fornecido."]);
    exit;
}

// Campos obrigatórios
$camposObrigatorios = ['titulo', 'autor', 'isbn', 'editora', 'ano', 'genero', 'paginas', 'idioma'];
foreach ($camposObrigatorios as $campo) {
    if (empty($data[$campo])) {
        echo json_encode(["success" => false, "message" => "Campo obrigatório '$campo' não preenchido."]);
        exit;
    }
}

// Receber dados
$id = intval($data['id']);
$titulo = trim($data['titulo']);
$autor = trim($data['autor']);
$isbn = trim($data['isbn']);
$editora = trim($data['editora']);
$ano = intval($data['ano']);
$genero = trim($data['genero']);
$paginas = intval($data['paginas']);
$idioma = trim($data['idioma']);
$descricao = trim($data['descricao'] ?? '');
$cdd = trim($data['cdd'] ?? '');
$localizacao = trim($data['localizacao'] ?? '');
$quantidadeCopias = intval($data['quantidadeCopias'] ?? 1);

// Verificar se o livro existe
$stmt = $conexao->prepare("SELECT capa FROM livros WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Livro não encontrado."]);
    $stmt->close();
    exit;
}

$livro = $result->fetch_assoc();
$capaAtual = $livro['capa'];
$stmt->close();

// Upload da capa (se estiver usando FormData)
$caminhoDestino = $capaAtual; // Mantém a capa atual por padrão
if (isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK) {
    $uploadsDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
    $ext = pathinfo($_FILES['capa']['name'], PATHINFO_EXTENSION);
    $nomeArquivo = uniqid('capa_') . '.' . $ext;
    $caminhoCompleto = $uploadsDir . $nomeArquivo;
    $caminhoDestino = 'uploads/' . $nomeArquivo;
    move_uploaded_file($_FILES['capa']['tmp_name'], $caminhoCompleto);
    
    // Remover capa antiga se existir e for diferente da padrão
    if ($capaAtual && $capaAtual !== 'img/Biblioteca.png' && file_exists(__DIR__ . '/' . $capaAtual)) {
        @unlink(__DIR__ . '/' . $capaAtual);
    }
}

// Atualizar no banco
$stmt = $conexao->prepare("UPDATE livros SET 
    titulo = ?, autor = ?, isbn = ?, editora = ?, ano = ?, 
    genero = ?, paginas = ?, idioma = ?, descricao = ?, capa = ?, cdd = ?, localizacao = ?, quantidade_copias = ? 
    WHERE id = ?");
$stmt->bind_param("ssssissssssii",
    $titulo, $autor, $isbn, $editora, $ano, $genero, $paginas, $idioma, $descricao, $caminhoDestino, $cdd, $localizacao, $quantidadeCopias, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Livro atualizado com sucesso!"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao atualizar livro: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>