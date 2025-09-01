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

try {
    // Consulta 1 - Total de livros cadastrados
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM livros");
    $stmt->execute();
    $result = $stmt->get_result();
    $livrosCadastrados = $result->fetch_assoc()['total'];

    // Consulta 2 - Total de empréstimos realizados
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM emprestimos");
    $stmt->execute();
    $result = $stmt->get_result();
    $livrosEmprestados = $result->fetch_assoc()['total'];

    // Consulta 3 - Livros atualmente emprestados
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM emprestimos WHERE status IN ('ativo', 'atrasado')");
    $stmt->execute();
    $result = $stmt->get_result();
    $livrosAtualmenteEmprestados = $result->fetch_assoc()['total'];

    // Consulta 4 - Livro mais emprestado
    $stmt = $conexao->prepare("
        SELECT l.titulo, COUNT(e.id) as total_emprestimos 
        FROM livros l 
        LEFT JOIN copias c ON l.id = c.livro_id
        LEFT JOIN emprestimos e ON c.id = e.copia_id 
        GROUP BY l.id, l.titulo 
        ORDER BY total_emprestimos DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $livroMaisEmprestado = $result->fetch_assoc();
    
    if (!$livroMaisEmprestado || $livroMaisEmprestado['total_emprestimos'] == 0) {
        $livroMaisEmprestado = [
            'titulo' => 'Nenhum empréstimo registrado',
            'total_emprestimos' => 0
        ];
    }

    // Consulta 5 - Multas pendentes
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM multas WHERE status = 'pendente'");
    $stmt->execute();
    $result = $stmt->get_result();
    $multasPendentes = $result->fetch_assoc()['total'];

    // Consulta 6 - Valor total das multas pagas
    $stmt = $conexao->prepare("SELECT COALESCE(SUM(valor), 0) as total FROM multas WHERE status = 'paga'");
    $stmt->execute();
    $result = $stmt->get_result();
    $valorMultasPagas = $result->fetch_assoc()['total'];

    // Consulta 7 - Número de reservas
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM reservas WHERE status = 'ativa'");
    $stmt->execute();
    $result = $stmt->get_result();
    $numeroReservas = $result->fetch_assoc()['total'];

    // Consulta 8 - Usuários cadastrados
    $stmt = $conexao->prepare("SELECT COUNT(*) as total FROM usuarios");
    $stmt->execute();
    $result = $stmt->get_result();
    $usuariosCadastrados = $result->fetch_assoc()['total'];

    $dadosRelatorios = [
        'livrosCadastrados' => (int)$livrosCadastrados,
        'livrosEmprestados' => (int)$livrosEmprestados,
        'livrosAtualmenteEmprestados' => (int)$livrosAtualmenteEmprestados,
        'livroMaisEmprestado' => [
            'titulo' => $livroMaisEmprestado['titulo'],
            'total_emprestimos' => (int)$livroMaisEmprestado['total_emprestimos']
        ],
        'multasPendentes' => (int)$multasPendentes,
        'valorMultasPagas' => (float)$valorMultasPagas,
        'numeroReservas' => (int)$numeroReservas,
        'usuariosCadastrados' => (int)$usuariosCadastrados
    ];

    echo json_encode([
        'success' => true,
        'message' => 'Dados dos relatórios carregados com sucesso',
        'dados' => $dadosRelatorios
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor ao buscar dados dos relatórios: ' . $e->getMessage()
    ]);
}
?>