<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexao.php';

function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['usuario_id']) || empty($input['usuario_id'])) {
    responder(false, 'ID do usuário não fornecido');
}

$usuario_id = intval($input['usuario_id']);

try {
    $stmt = $conexao->prepare("SELECT id, nome FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        responder(false, 'Usuário não encontrado');
    }

    $stmt = $conexao->prepare("
        SELECT e.id, e.data_emprestimo, e.data_prevista_devolucao, e.status,
               l.id as livro_id, l.titulo, l.autor, l.capa,
               c.id as copia_id, c.codigo_copia
        FROM emprestimos e
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        WHERE e.usuario_id = ? AND e.status IN ('ativo', 'atrasado')
        ORDER BY e.data_emprestimo DESC
    ");
    
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $emprestimos = [];
    while ($row = $result->fetch_assoc()) {
        $capa_url = null;
        if ($row['capa']) {
            if (strpos($row['capa'], 'http') === 0) {
                $capa_url = $row['capa'];
            } else {
                $capa_url = "http://localhost:8000/uploads/" . basename($row['capa']);
            }
        }
        
        $hoje = new DateTime();
        $data_devolucao = new DateTime($row['data_prevista_devolucao']);
        $diff = $hoje->diff($data_devolucao);
        $dias_restantes = $diff->days;
        
        if ($hoje > $data_devolucao) {
            $status_calculado = 'atrasado';
            $dias_restantes = -$dias_restantes;
        } elseif ($dias_restantes <= 3) {
            $status_calculado = 'vencendo';
        } else {
            $status_calculado = 'normal';
        }
        
        $emprestimos[] = [
            'id' => intval($row['id']),
            'livro_id' => intval($row['livro_id']),
            'titulo' => $row['titulo'],
            'autor' => $row['autor'],
            'capa' => $capa_url,
            'copia_id' => intval($row['copia_id']),
            'codigo_copia' => $row['codigo_copia'],
            'data_emprestimo' => $row['data_emprestimo'],
            'data_prevista_devolucao' => $row['data_prevista_devolucao'],
            'status' => $row['status'],
            'status_calculado' => $status_calculado,
            'dias_restantes' => $dias_restantes
        ];
    }
    
    responder(true, 'Empréstimos carregados com sucesso', $emprestimos);
    
} catch (Exception $e) {
    responder(false, 'Erro ao carregar empréstimos: ' . $e->getMessage());
}

$conexao->close();
?>