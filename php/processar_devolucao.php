<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexao.php';

// Função para responder em JSON
function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obrigatórios
if (!isset($input['emprestimo_id']) || empty($input['emprestimo_id'])) {
    responder(false, 'ID do empréstimo não fornecido');
}

$emprestimo_id = intval($input['emprestimo_id']);

try {
    // Iniciar transação
    $conexao->autocommit(false);

    // Verificar se o empréstimo existe e está ativo
    $stmt = $conexao->prepare("
        SELECT e.id, e.usuario_id, e.copia_id, e.data_emprestimo, e.data_prevista_devolucao,
               c.livro_id, c.codigo_copia, c.status as status_copia,
               l.titulo, l.autor,
               u.nome as usuario_nome, u.email as usuario_email
        FROM emprestimos e
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        JOIN usuarios u ON e.usuario_id = u.id
        WHERE e.id = ? AND e.status IN ('ativo', 'atrasado')
    ");
    $stmt->bind_param("i", $emprestimo_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Empréstimo não encontrado ou já foi devolvido');
    }

    $emprestimo = $result->fetch_assoc();

    // Atualizar status do empréstimo para 'finalizado' e registrar data de devolução
    $data_devolucao = date('Y-m-d');
    $stmt = $conexao->prepare("UPDATE emprestimos SET status = 'finalizado', data_prevista_devolucao = ? WHERE id = ?");
    $stmt->bind_param("si", $data_devolucao, $emprestimo_id);
    
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao atualizar status do empréstimo');
    }

    // Atualizar status da cópia para 'disponivel'
    $stmt = $conexao->prepare("UPDATE copias SET status = 'disponivel' WHERE id = ?");
    $stmt->bind_param("i", $emprestimo['copia_id']);
    
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao atualizar status da cópia');
    }

    // Verificar se há reservas pendentes para este livro
    $stmt = $conexao->prepare("
        SELECT r.id, r.usuario_id, r.tipo, r.data_reserva,
               u.nome as usuario_nome, u.email as usuario_email
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.livro_id = ? AND r.status IN ('pendente', 'confirmada')
        ORDER BY r.data_reserva ASC
        LIMIT 1
    ");
    $stmt->bind_param("i", $emprestimo['livro_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $reserva_notificada = null;
    if ($result->num_rows > 0) {
        $reserva = $result->fetch_assoc();
        
        // Atualizar status da reserva para 'disponivel'
        $stmt = $conexao->prepare("UPDATE reservas SET status = 'disponivel' WHERE id = ?");
        $stmt->bind_param("i", $reserva['id']);
        $stmt->execute();

        // Preparar dados para email de disponibilidade
        $reserva_notificada = [
            'reserva_id' => $reserva['id'],
            'usuario' => [
                'id' => $reserva['usuario_id'],
                'nome' => $reserva['usuario_nome'],
                'email' => $reserva['usuario_email']
            ],
            'livro' => [
                'id' => $emprestimo['livro_id'],
                'titulo' => $emprestimo['titulo'],
                'autor' => $emprestimo['autor']
            ],
            'email_data' => [
                'email' => $reserva['usuario_email'],
                'nomeUsuario' => $reserva['usuario_nome'],
                'tituloLivro' => $emprestimo['titulo'],
                'autorLivro' => $emprestimo['autor'],
                'dataReserva' => date('d/m/Y H:i', strtotime($reserva['data_reserva'])),
                'dataDisponibilidade' => date('d/m/Y H:i'),
                'tipoReserva' => $reserva['tipo']
            ]
        ];
    }

    // Confirmar transação
    $conexao->commit();

    $dados_devolucao = [
        'emprestimo_id' => $emprestimo_id,
        'livro' => [
            'id' => $emprestimo['livro_id'],
            'titulo' => $emprestimo['titulo'],
            'autor' => $emprestimo['autor']
        ],
        'usuario' => [
            'id' => $emprestimo['usuario_id'],
            'nome' => $emprestimo['usuario_nome'],
            'email' => $emprestimo['usuario_email']
        ],
        'copia' => [
            'id' => $emprestimo['copia_id'],
            'codigo' => $emprestimo['codigo_copia']
        ],
        'datas' => [
            'emprestimo' => $emprestimo['data_emprestimo'],
            'devolucao_prevista' => $emprestimo['data_prevista_devolucao'],
            'devolucao_real' => $data_devolucao
        ],
        'reserva_notificada' => $reserva_notificada
    ];

    // Se há uma reserva para notificar, enviar email de disponibilidade
    if ($reserva_notificada) {
        // Enviar email de forma assíncrona (não bloqueia a resposta)
        $email_data = $reserva_notificada['email_data'];
        
        // Fazer requisição para enviar email (pode ser feito pelo frontend também)
        $email_json = json_encode($email_data);
        
        // Usar cURL para enviar email de forma assíncrona
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/enviar_email_disponibilidade.php');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $email_json);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout de 5 segundos
        
        $email_result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Log do resultado do email (opcional)
        if ($http_code === 200) {
            error_log("Email de disponibilidade enviado com sucesso para: " . $email_data['email']);
        } else {
            error_log("Erro ao enviar email de disponibilidade para: " . $email_data['email']);
        }
    }

    responder(true, 'Devolução processada com sucesso', $dados_devolucao);

} catch (Exception $e) {
    $conexao->rollback();
    responder(false, 'Erro ao processar devolução: ' . $e->getMessage());
}

$conexao->close();
?>