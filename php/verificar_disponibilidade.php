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

function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

if (!isset($_GET['livro_id']) || empty($_GET['livro_id'])) {
    responder(false, 'ID do livro não fornecido');
}

$livro_id = intval($_GET['livro_id']);

try {
    $stmt = $conexao->prepare("
        SELECT l.id, l.titulo, l.autor, l.quantidade_copias,
               COUNT(c.id) as copias_cadastradas,
               COUNT(CASE WHEN c.status = 'disponivel' THEN 1 END) as copias_disponiveis,
               COUNT(CASE WHEN c.status = 'emprestado' THEN 1 END) as copias_emprestadas,
               COUNT(CASE WHEN c.status = 'manutencao' THEN 1 END) as copias_manutencao,
               COUNT(CASE WHEN c.status = 'perdido' THEN 1 END) as copias_perdidas
        FROM livros l
        LEFT JOIN copias c ON l.id = c.livro_id
        WHERE l.id = ?
        GROUP BY l.id
    ");
    
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        responder(false, 'Livro não encontrado');
    }
    
    $livro = $result->fetch_assoc();
    
    if ($livro['copias_cadastradas'] == 0 && $livro['quantidade_copias'] > 0) {
        $stmt_insert = $conexao->prepare("INSERT INTO copias (livro_id, codigo_copia, status) VALUES (?, ?, 'disponivel')");
        
        for ($i = 1; $i <= $livro['quantidade_copias']; $i++) {
            $codigo_copia = sprintf("%s-%03d", str_pad($livro_id, 4, '0', STR_PAD_LEFT), $i);
            $stmt_insert->bind_param("is", $livro_id, $codigo_copia);
            $stmt_insert->execute();
        }
        
        $stmt_insert->close();
        
        $stmt->execute();
        $result = $stmt->get_result();
        $livro = $result->fetch_assoc();
    }
    
    $stmt_emprestimos = $conexao->prepare("
        SELECT e.id, e.data_emprestimo, e.data_prevista_devolucao, 
               u.nome as usuario_nome, c.codigo_copia
        FROM emprestimos e
        JOIN usuarios u ON e.usuario_id = u.id
        JOIN copias c ON e.copia_id = c.id
        WHERE c.livro_id = ? AND e.status IN ('ativo', 'atrasado')
        ORDER BY e.data_emprestimo DESC
    ");
    
    $stmt_emprestimos->bind_param("i", $livro_id);
    $stmt_emprestimos->execute();
    $result_emprestimos = $stmt_emprestimos->get_result();
    
    $emprestimos_ativos = [];
    while ($row = $result_emprestimos->fetch_assoc()) {
        $emprestimos_ativos[] = $row;
    }
    
    $stmt_reservas = $conexao->prepare("
        SELECT r.id, r.data_reserva, r.tipo, r.posicao_fila, r.status,
               u.nome as usuario_nome
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.livro_id = ? AND r.status IN ('pendente', 'confirmada')
        ORDER BY r.data_reserva ASC
    ");
    
    $stmt_reservas->bind_param("i", $livro_id);
    $stmt_reservas->execute();
    $result_reservas = $stmt_reservas->get_result();
    
    $reservas_ativas = [];
    while ($row = $result_reservas->fetch_assoc()) {
        $reservas_ativas[] = $row;
    }
    
    $disponivel_emprestimo = $livro['copias_disponiveis'] > 0;
    $disponivel_pre_reserva = true;
    $disponivel_reserva = $livro['copias_disponiveis'] == 0;
    
    $dados_disponibilidade = [
        'livro' => [
            'id' => $livro['id'],
            'titulo' => $livro['titulo'],
            'autor' => $livro['autor'],
            'quantidade_copias' => intval($livro['quantidade_copias'])
        ],
        'copias' => [
            'total' => intval($livro['copias_cadastradas']),
            'disponiveis' => intval($livro['copias_disponiveis']),
            'emprestadas' => intval($livro['copias_emprestadas']),
            'manutencao' => intval($livro['copias_manutencao']),
            'perdidas' => intval($livro['copias_perdidas'])
        ],
        'acoes_disponiveis' => [
            'emprestimo' => $disponivel_emprestimo,
            'pre_reserva' => $disponivel_pre_reserva,
            'reserva' => $disponivel_reserva
        ],
        'emprestimos_ativos' => $emprestimos_ativos,
        'reservas_ativas' => $reservas_ativas,
        'total_reservas' => count($reservas_ativas)
    ];
    
    responder(true, 'Disponibilidade verificada com sucesso', $dados_disponibilidade);
    
} catch (Exception $e) {
    responder(false, 'Erro ao verificar disponibilidade: ' . $e->getMessage());
}

$conexao->close();
?>