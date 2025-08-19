<?php
// ===============================
// CONFIGURAÇÃO DE CORS
// ===============================
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5174"); // Porta do seu React
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Max-Age: 3600");

// Responder requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===============================
// DEBUG - apenas para desenvolvimento
// ===============================
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// ===============================
// GARANTIR QUE É POST
// ===============================
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Método não permitido. Use POST."
    ]);
    exit;
}

// ===============================
// CONEXÃO COM O BANCO
// ===============================
try {
    require 'conexao.php'; // <- ajusta para o caminho do seu arquivo
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erro de conexão com banco: " . $e->getMessage()
    ]);
    exit;
}

// ===============================
// VALIDAR CAMPOS OBRIGATÓRIOS
// ===============================
$camposObrigatorios = ['titulo', 'autor', 'isbn', 'editora', 'ano', 'genero', 'paginas', 'idioma', 'preco'];
foreach ($camposObrigatorios as $campo) {
    if (empty($_POST[$campo])) {
        echo json_encode([
            "success" => false,
            "message" => "Campo obrigatório '$campo' não preenchido."
        ]);
        exit;
    }
}

// ===============================
// RECEBER DADOS DO FORMULÁRIO
// ===============================
$titulo = trim($_POST['titulo']);
$autor = trim($_POST['autor']);
$isbn = trim($_POST['isbn']);
$editora = trim($_POST['editora']);
$ano = intval($_POST['ano']);
$genero = trim($_POST['genero']);
$paginas = intval($_POST['paginas']);
$idioma = trim($_POST['idioma']);
$descricao = trim($_POST['descricao'] ?? '');
$preco = floatval($_POST['preco']);

// ===============================
// UPLOAD DA CAPA
// ===============================
$caminhoDestino = null;
if (isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK) {
    $uploadsDir = __DIR__ . '/uploads/';
    
    // Criar diretório se não existir
    if (!is_dir($uploadsDir)) {
        if (!mkdir($uploadsDir, 0755, true)) {
            echo json_encode([
                "success" => false,
                "message" => "Erro ao criar diretório de uploads."
            ]);
            exit;
        }
    }
    
    // Validar tipo de arquivo
    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $tipoArquivo = $_FILES['capa']['type'];
    
    if (!in_array($tipoArquivo, $tiposPermitidos)) {
        echo json_encode([
            "success" => false,
            "message" => "Tipo de arquivo não permitido. Use JPG, PNG ou GIF."
        ]);
        exit;
    }
    
    // Gerar nome único para evitar conflitos
    $extensao = pathinfo($_FILES['capa']['name'], PATHINFO_EXTENSION);
    $nomeArquivo = uniqid('capa_') . '.' . $extensao;
    $caminhoCompleto = $uploadsDir . $nomeArquivo;
    $caminhoDestino = 'uploads/' . $nomeArquivo; // Para salvar no banco
    
    if (!move_uploaded_file($_FILES['capa']['tmp_name'], $caminhoCompleto)) {
        echo json_encode([
            "success" => false,
            "message" => "Erro ao salvar arquivo da capa."
        ]);
        exit;
    }
}

// ===============================
// INSERIR NO BANCO
// ===============================
try {
    $stmt = $conexao->prepare(
        "INSERT INTO livros 
        (titulo, autor, isbn, editora, ano, genero, paginas, idioma, descricao, preco, capa) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    if ($stmt === false) {
        throw new Exception("Erro na preparação da query: " . $conexao->error);
    }
    
    $stmt->bind_param(
        "ssssisssdss", // tipos: s=string, i=int, d=double
        $titulo,
        $autor,
        $isbn,
        $editora,
        $ano,
        $genero,
        $paginas,
        $idioma,
        $descricao,
        $preco,
        $caminhoDestino
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Livro cadastrado com sucesso!",
            "id" => $conexao->insert_id
        ]);
    } else {
        throw new Exception("Erro ao executar query: " . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erro no banco de dados: " . $e->getMessage()
    ]);
    error_log("Erro no cadastro de livro: " . $e->getMessage());
} finally {
    if (isset($conexao)) {
        $conexao->close();
    }
}
