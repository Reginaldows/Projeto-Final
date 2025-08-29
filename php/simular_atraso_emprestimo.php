<?php

require_once 'conexao.php';

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

$acao = $_GET['acao'] ?? $_POST['acao'] ?? '';

switch ($acao) {
    case 'listar_emprestimos':
        listarEmprestimosAtivos();
        break;
        
    case 'simular_atraso':
        $emprestimo_id = $_POST['emprestimo_id'] ?? '';
        $dias_atraso = $_POST['dias_atraso'] ?? 7;
        simularAtraso($emprestimo_id, $dias_atraso);
        break;
        
    case 'verificar_multas':
        verificarMultas();
        break;
        
    case 'resetar_emprestimo':
        $emprestimo_id = $_POST['emprestimo_id'] ?? '';
        resetarEmprestimo($emprestimo_id);
        break;
        
    default:
        responder(false, "Ação não especificada. Use: listar_emprestimos, simular_atraso, verificar_multas, resetar_emprestimo");
}

function listarEmprestimosAtivos() {
    global $conexao;
    
    $sql = "
        SELECT 
            e.id,
            e.data_emprestimo,
            e.data_prevista_devolucao,
            e.status,
            u.nome as usuario_nome,
            u.email as usuario_email,
            l.titulo as livro_titulo,
            DATEDIFF(CURDATE(), e.data_prevista_devolucao) as dias_atraso
        FROM emprestimos e
        JOIN usuarios u ON e.usuario_id = u.id
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        WHERE e.status = 'ativo'
        ORDER BY e.data_emprestimo DESC
    ";
    
    $result = $conexao->query($sql);
    
    if (!$result) {
        responder(false, "Erro ao consultar empréstimos: " . $conexao->error);
    }
    
    $emprestimos = [];
    while ($row = $result->fetch_assoc()) {
        $emprestimos[] = $row;
    }
    
    responder(true, "Empréstimos ativos listados", $emprestimos);
}

function simularAtraso($emprestimo_id, $dias_atraso) {
    global $conexao;
    
    if (empty($emprestimo_id)) {
        responder(false, "ID do empréstimo é obrigatório");
    }
    
    $stmt = $conexao->prepare("SELECT id, data_emprestimo, data_prevista_devolucao FROM emprestimos WHERE id = ? AND status = 'ativo'");
    $stmt->bind_param("i", $emprestimo_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        responder(false, "Empréstimo não encontrado ou não está ativo");
    }
    
    $emprestimo = $result->fetch_assoc();
    
    $nova_data_emprestimo = date('Y-m-d', strtotime("-" . (15 + $dias_atraso) . " days"));
    $nova_data_devolucao = date('Y-m-d', strtotime("-" . $dias_atraso . " days"));
    
    $stmt = $conexao->prepare("
        UPDATE emprestimos 
        SET data_emprestimo = ?, data_prevista_devolucao = ? 
        WHERE id = ?
    ");
    $stmt->bind_param("ssi", $nova_data_emprestimo, $nova_data_devolucao, $emprestimo_id);
    
    if ($stmt->execute()) {
        responder(true, "Atraso simulado com sucesso", [
            'emprestimo_id' => $emprestimo_id,
            'dias_atraso' => $dias_atraso,
            'nova_data_emprestimo' => $nova_data_emprestimo,
            'nova_data_devolucao' => $nova_data_devolucao,
            'data_original_emprestimo' => $emprestimo['data_emprestimo'],
            'data_original_devolucao' => $emprestimo['data_prevista_devolucao']
        ]);
    } else {
        responder(false, "Erro ao simular atraso: " . $conexao->error);
    }
}

function verificarMultas() {
    global $conexao;

    $sql_multas = "
        SELECT 
            m.id as multa_id,
            m.emprestimo_id,
            m.valor,
            m.data_multa,
            m.status as multa_status,
            m.data_pagamento,
            m.metodo_pagamento,
            u.nome as usuario_nome,
            l.titulo as livro_titulo,
            DATEDIFF(CURDATE(), e.data_prevista_devolucao) as dias_atraso_atual
        FROM multas m
        JOIN emprestimos e ON m.emprestimo_id = e.id
        JOIN usuarios u ON m.usuario_id = u.id
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        ORDER BY m.data_multa DESC
    ";
    
    $result_multas = $conexao->query($sql_multas);
    
    if (!$result_multas) {
        responder(false, "Erro ao consultar multas: " . $conexao->error);
    }
    
    $multas_registradas = [];
    while ($row = $result_multas->fetch_assoc()) {
        $multas_registradas[] = $row;
    }
    
    $sql_atrasos = "
        SELECT 
            e.id as emprestimo_id,
            e.data_emprestimo,
            e.data_prevista_devolucao,
            e.status,
            u.nome as usuario_nome,
            l.titulo as livro_titulo,
            l.autor as livro_autor,
            DATEDIFF(CURDATE(), e.data_prevista_devolucao) as dias_atraso
        FROM emprestimos e
        JOIN usuarios u ON e.usuario_id = u.id
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        LEFT JOIN multas m ON e.id = m.emprestimo_id
        WHERE e.status = 'ativo'
        AND e.data_prevista_devolucao < CURDATE()
        AND m.id IS NULL
        ORDER BY e.data_prevista_devolucao ASC
    ";
    
    $result_atrasos = $conexao->query($sql_atrasos);
    
    if (!$result_atrasos) {
        responder(false, "Erro ao consultar empréstimos em atraso: " . $conexao->error);
    }
    
    $emprestimos_atraso = [];
    while ($row = $result_atrasos->fetch_assoc()) {
        $dias_atraso = $row['dias_atraso'];
        $valor_multa = $dias_atraso * 2.00; 
        
        $emprestimos_atraso[] = [
            'multa_id' => null,
            'emprestimo_id' => $row['emprestimo_id'],
            'valor' => $valor_multa,
            'data_multa' => null,
            'multa_status' => 'pendente',
            'data_pagamento' => null,
            'metodo_pagamento' => null,
            'usuario_nome' => $row['usuario_nome'],
            'livro_titulo' => $row['livro_titulo'],
            'dias_atraso_atual' => $dias_atraso
        ];
    }
    
    $total_multas = count($multas_registradas) + count($emprestimos_atraso);
    $todas_multas = array_merge($multas_registradas, $emprestimos_atraso);
    
    if ($total_multas === 0) {
        responder(true, "Nenhuma multa encontrada.", []);
    } else {
        responder(true, "Multas verificadas - Total: {$total_multas}", $todas_multas);
    }
}

function resetarEmprestimo($emprestimo_id) {
    global $conexao;
    
    if (empty($emprestimo_id)) {
        responder(false, "ID do empréstimo é obrigatório");
    }
    
    $data_emprestimo = date('Y-m-d');
    $data_devolucao = date('Y-m-d', strtotime("+15 days"));
    
    $stmt = $conexao->prepare("
        UPDATE emprestimos 
        SET data_emprestimo = ?, data_prevista_devolucao = ? 
        WHERE id = ?
    ");
    $stmt->bind_param("ssi", $data_emprestimo, $data_devolucao, $emprestimo_id);
    
    if ($stmt->execute()) {

        $stmt2 = $conexao->prepare("DELETE FROM multas WHERE emprestimo_id = ?");
        $stmt2->bind_param("i", $emprestimo_id);
        $stmt2->execute();
        
        responder(true, "Empréstimo resetado com sucesso", [
            'emprestimo_id' => $emprestimo_id,
            'nova_data_emprestimo' => $data_emprestimo,
            'nova_data_devolucao' => $data_devolucao
        ]);
    } else {
        responder(false, "Erro ao resetar empréstimo: " . $conexao->error);
    }
}
?>