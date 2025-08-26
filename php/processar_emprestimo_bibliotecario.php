<?php
// Sempre enviar os headers
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Se for preflight (OPTIONS), responder com sucesso e encerrar
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Incluir arquivo de conexão
require_once 'conexao.php';

try {
    // Receber dados JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['usuario_id']) || !isset($input['livro_id'])) {
        throw new Exception('Dados incompletos');
    }
    
    $usuario_id = (int)$input['usuario_id'];
    $livro_id = (int)$input['livro_id'];
    
    // Validar se o usuário existe
    $stmt = $conn->prepare("SELECT id, nome FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $usuario = $stmt->get_result()->fetch_assoc();
    
    if (!$usuario) {
        throw new Exception('Usuário não encontrado');
    }
    
    // Validar se o livro existe e está disponível
    $stmt = $conn->prepare("
        SELECT l.id, l.titulo, c.id as copia_id 
        FROM livros l 
        JOIN copias c ON l.id = c.livro_id 
        WHERE l.id = ? AND c.status = 'disponível' 
        LIMIT 1
    ");
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $livro = $stmt->get_result()->fetch_assoc();
    
    if (!$livro) {
        throw new Exception('Livro não disponível para empréstimo');
    }
    
    // Verificar se o usuário já tem empréstimo ativo deste livro
    $stmt = $conn->prepare("
        SELECT id FROM emprestimos 
        WHERE usuario_id = ? AND livro_id = ? AND status IN ('ativo', 'atrasado')
    ");
    $stmt->bind_param("ii", $usuario_id, $livro_id);
    $stmt->execute();
    $emprestimo_existente = $stmt->get_result()->fetch_assoc();
    
    if ($emprestimo_existente) {
        throw new Exception('Usuário já possui empréstimo ativo deste livro');
    }
    
    // Iniciar transação
    $conn->begin_transaction();
    
    try {
        // Calcular data de devolução (14 dias a partir de hoje)
        $data_emprestimo = date('Y-m-d');
        $data_prevista_devolucao = date('Y-m-d', strtotime('+14 days'));
        
        // Criar empréstimo
        $stmt = $conn->prepare("
            INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_prevista_devolucao, status) 
            VALUES (?, ?, ?, ?, 'ativo')
        ");
        $stmt->bind_param("iiss", $usuario_id, $livro_id, $data_emprestimo, $data_prevista_devolucao);
        $stmt->execute();
        
        $emprestimo_id = $conn->insert_id;
        
        // Atualizar status da cópia para emprestado
        $stmt = $conn->prepare("UPDATE copias SET status = 'emprestado' WHERE id = ?");
        $stmt->bind_param("i", $livro['copia_id']);
        $stmt->execute();
        
        // Confirmar transação
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Empréstimo realizado com sucesso',
            'emprestimo_id' => $emprestimo_id,
            'data_devolucao' => $data_prevista_devolucao
        ]);
        
    } catch (Exception $e) {
        // Reverter transação em caso de erro
        $conn->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>