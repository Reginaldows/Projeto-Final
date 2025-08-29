<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'conexao.php';

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

if (!$input || !isset($input['usuario_id'])) {
    responder(false, 'ID do usuário é obrigatório');
}

$usuario_id = (int)$input['usuario_id'];

if ($usuario_id <= 0) {
    responder(false, 'ID do usuário inválido');
}

try {
    // Buscar multas pendentes do usuário
    $stmt = $conexao->prepare("
        SELECT 
            m.id as multa_id,
            m.emprestimo_id,
            m.valor,
            m.data_multa,
            m.status,
            m.data_pagamento,
            m.metodo_pagamento,
            e.data_emprestimo,
            e.data_prevista_devolucao,
            e.status as status_emprestimo,
            l.titulo as livro_titulo,
            l.autor as livro_autor,
            DATEDIFF(CURDATE(), e.data_prevista_devolucao) as dias_atraso
        FROM multas m
        JOIN emprestimos e ON m.emprestimo_id = e.id
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        WHERE m.usuario_id = ?
        ORDER BY m.data_multa DESC
    ");
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $multas_db = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    // Também buscar empréstimos em atraso que ainda não têm multa registrada
    $stmt = $conexao->prepare("
        SELECT 
            e.id as emprestimo_id,
            e.data_emprestimo,
            e.data_prevista_devolucao,
            e.status,
            l.titulo as livro_titulo,
            l.autor as livro_autor,
            DATEDIFF(CURDATE(), e.data_prevista_devolucao) as dias_atraso
        FROM emprestimos e
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        LEFT JOIN multas m ON e.id = m.emprestimo_id
        WHERE e.usuario_id = ? 
        AND e.status = 'ativo'
        AND e.data_prevista_devolucao < CURDATE()
        AND m.id IS NULL
        ORDER BY e.data_prevista_devolucao ASC
    ");
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $emprestimos_sem_multa = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $multas = [];
    
    // Processar multas já registradas
    foreach ($multas_db as $multa) {
        $multas[] = [
            'multa_id' => $multa['multa_id'],
            'emprestimo_id' => $multa['emprestimo_id'],
            'livro_titulo' => $multa['livro_titulo'],
            'livro_autor' => $multa['livro_autor'],
            'data_emprestimo' => $multa['data_emprestimo'],
            'data_prevista_devolucao' => $multa['data_prevista_devolucao'],
            'dias_atraso' => $multa['dias_atraso'],
            'valor_multa' => (float)$multa['valor'],
            'status_multa' => $multa['status'],
            'data_multa' => $multa['data_multa'],
            'data_pagamento' => $multa['data_pagamento'],
            'metodo_pagamento' => $multa['metodo_pagamento'],
            'status_emprestimo' => $multa['status_emprestimo'],
            'tem_multa_registrada' => true
        ];
    }
    
    // Processar empréstimos em atraso sem multa registrada
    foreach ($emprestimos_sem_multa as $emprestimo) {
        $dias_atraso = $emprestimo['dias_atraso'];
        $valor_multa = $dias_atraso * 2.00; // R$ 2,00 por dia de atraso
        
        $multas[] = [
            'multa_id' => null,
            'emprestimo_id' => $emprestimo['emprestimo_id'],
            'livro_titulo' => $emprestimo['livro_titulo'],
            'livro_autor' => $emprestimo['livro_autor'],
            'data_emprestimo' => $emprestimo['data_emprestimo'],
            'data_prevista_devolucao' => $emprestimo['data_prevista_devolucao'],
            'dias_atraso' => $dias_atraso,
            'valor_multa' => $valor_multa,
            'status_multa' => 'pendente',
            'data_multa' => null,
            'data_pagamento' => null,
            'metodo_pagamento' => null,
            'status_emprestimo' => $emprestimo['status'],
            'tem_multa_registrada' => false
        ];
    }
    
    // Separar multas pendentes e pagas
    $multas_pendentes = array_filter($multas, function($multa) {
        return $multa['status_multa'] === 'pendente';
    });
    
    $multas_pagas = array_filter($multas, function($multa) {
        return $multa['status_multa'] === 'pago';
    });
    
    $valor_total_pendente = array_sum(array_column($multas_pendentes, 'valor_multa'));
    
    responder(true, 'Multas carregadas com sucesso', [
        'multas' => $multas,
        'multas_pendentes' => array_values($multas_pendentes),
        'multas_pagas' => array_values($multas_pagas),
        'total_multas' => count($multas),
        'total_pendentes' => count($multas_pendentes),
        'total_pagas' => count($multas_pagas),
        'valor_total_pendente' => $valor_total_pendente
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao listar multas: ' . $e->getMessage());
    responder(false, 'Erro interno do servidor');
}
?>