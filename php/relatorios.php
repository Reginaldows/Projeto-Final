<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
if (!isset($_SESSION['usuario_id']) || !isset($_SESSION['tipo_usuario'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não autenticado. Faça login para continuar.'
    ]);
    exit();
}

if ($_SESSION['tipo_usuario'] !== 'bibliotecario') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acesso negado. Apenas bibliotecários podem acessar relatórios.'
    ]);
    exit();
}

require_once 'conexao.php';


function responder($success, $mensagem, $dados = null) {
    echo json_encode([
        'success' => $success,
        'message' => $mensagem,
        'dados' => $dados
    ]);
    exit;
}


ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    if (!$conexao) {
        error_log("ERRO: Conexão com banco de dados falhou");
        responder(false, "Erro na conexão com o banco de dados");
    }
    
    error_log("DEBUG: Conexão com banco OK, iniciando consultas...");

    error_log("DEBUG: Executando consulta 1 - Total de livros");
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM livros");
    if (!$stmt) {
        error_log("ERRO: Falha ao preparar consulta 1: " . $conexao->error);
        throw new Exception("Erro na consulta 1");
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $livrosCadastrados = $result->fetch_assoc()['total'];
    error_log("DEBUG: Consulta 1 OK - Livros cadastrados: " . $livrosCadastrados);

    error_log("DEBUG: Executando consulta 2 - Total de empréstimos");
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM emprestimos");
    if (!$stmt) {
        error_log("ERRO: Falha ao preparar consulta 2: " . $conexao->error);
        throw new Exception("Erro na consulta 2");
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $totalEmprestimos = $result->fetch_assoc()['total'];
    error_log("DEBUG: Consulta 2 OK - Total empréstimos: " . $totalEmprestimos);

    error_log("DEBUG: Executando consulta 3 - Livros atualmente emprestados");
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM emprestimos WHERE status = 'ativo'");
    if (!$stmt) {
        error_log("ERRO: Falha ao preparar consulta 3: " . $conexao->error);
        throw new Exception("Erro na consulta 3");
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $livrosAtualmenteEmprestados = $result->fetch_assoc()['total'];
    error_log("DEBUG: Consulta 3 OK - Livros atualmente emprestados: " . $livrosAtualmenteEmprestados);

    error_log("DEBUG: Executando consulta 4 - Livro mais emprestado");
    $stmt = $conexao->prepare("
        SELECT l.titulo, COUNT(e.id) as total_emprestimos 
        FROM livros l 
        LEFT JOIN copias c ON l.id = c.livro_id
        LEFT JOIN emprestimos e ON c.id = e.copia_id 
        GROUP BY l.id, l.titulo 
        ORDER BY total_emprestimos DESC 
        LIMIT 1
    ");
    if (!$stmt) {
        error_log("ERRO: Falha ao preparar consulta 4: " . $conexao->error);
        throw new Exception("Erro na consulta 4");
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $livroMaisEmprestado = $result->fetch_assoc();
    error_log("DEBUG: Consulta 4 OK - Livro mais emprestado: " . ($livroMaisEmprestado ? $livroMaisEmprestado['titulo'] : 'Nenhum'));
    
    if (!$livroMaisEmprestado || $livroMaisEmprestado['total_emprestimos'] == 0) {
        $livroMaisEmprestado = [
            'titulo' => 'Nenhum empréstimo registrado',
            'total_emprestimos' => 0
        ];
    }
    $dadosRelatorios = [
        'livrosCadastrados' => (int)$livrosCadastrados,
        'livrosEmprestados' => (int)$totalEmprestimos,
        'livrosAtualmenteEmprestados' => (int)$livrosAtualmenteEmprestados,
        'livroMaisEmprestado' => [
            'titulo' => $livroMaisEmprestado['titulo'],
            'total_emprestimos' => (int)$livroMaisEmprestado['total_emprestimos']
        ]
    ];

    responder(true, "Dados dos relatórios carregados com sucesso", $dadosRelatorios);

} catch (Exception $e) {
    error_log("Erro ao buscar dados dos relatórios: " . $e->getMessage());
    responder(false, "Erro interno do servidor ao buscar dados dos relatórios");
}
?>