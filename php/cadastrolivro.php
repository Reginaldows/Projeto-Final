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
    $data = $_POST;
}

// Campos obrigatórios
$camposObrigatorios = ['titulo', 'autor', 'isbn', 'editora', 'ano', 'genero', 'paginas', 'idioma', 'cdd', 'localizacao', 'quantidadeCopias'];
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
$cdd = trim($data['cdd']);
$localizacao = trim($data['localizacao']);
$quantidadeCopias = intval($data['quantidadeCopias']);

// Upload da capa (arquivo ou URL)
$caminhoDestino = null;

// Upload de arquivo
if (isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK) {
    $uploadsDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
    $ext = pathinfo($_FILES['capa']['name'], PATHINFO_EXTENSION);
    $nomeArquivo = uniqid('capa_') . '.' . $ext;
    $caminhoCompleto = $uploadsDir . $nomeArquivo;
    $caminhoDestino = 'uploads/' . $nomeArquivo;
    move_uploaded_file($_FILES['capa']['tmp_name'], $caminhoCompleto);
}
// Upload via URL
elseif (!empty($data['urlCapa'])) {
    $urlCapa = $data['urlCapa'];
    $uploadsDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    $imagemConteudo = file_get_contents($urlCapa);
    if ($imagemConteudo !== false) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imagemConteudo);
        $ext = 'jpg';
        if ($mimeType === 'image/png') $ext = 'png';
        elseif ($mimeType === 'image/gif') $ext = 'gif';
        elseif ($mimeType === 'image/webp') $ext = 'webp';

        $nomeArquivo = uniqid('capa_api_') . '.' . $ext;
        $caminhoCompleto = $uploadsDir . $nomeArquivo;
        $caminhoDestino = 'uploads/' . $nomeArquivo;

        file_put_contents($caminhoCompleto, $imagemConteudo);
    }
}

// Inserir livro no banco
$stmt = $conexao->prepare("INSERT INTO livros 
    (titulo, autor, isbn, editora, ano, genero, paginas, idioma, descricao, cdd, localizacao, capa) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssisssssss",
    $titulo, $autor, $isbn, $editora, $ano, $genero, $paginas, $idioma, $descricao, $cdd, $localizacao, $caminhoDestino);

if ($stmt->execute()) {
    $livroId = $conexao->insert_id;

    // Criar cópias automaticamente
    for ($i = 1; $i <= $quantidadeCopias; $i++) {
        $codigoCopia = $livroId . '-' . $i; // Ex.: 12-1, 12-2, 12-3
        $stmtCopia = $conexao->prepare("INSERT INTO copias (livro_id, codigo_copia) VALUES (?, ?)");
        $stmtCopia->bind_param("is", $livroId, $codigoCopia);
        $stmtCopia->execute();
        $stmtCopia->close();
    }

    echo json_encode([
        "success" => true,
        "message" => "Livro cadastrado com sucesso!",
        "id" => $livroId
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar livro: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>