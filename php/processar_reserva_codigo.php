<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and verify authentication
session_start();
if (!isset($_SESSION['usuario_id']) || !isset($_SESSION['tipo_usuario'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuário não autenticado. Faça login para continuar.'
    ]);
    exit();
}

// Verify if user is bibliotecario
if ($_SESSION['tipo_usuario'] !== 'bibliotecario') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acesso negado. Apenas bibliotecários podem confirmar pré-reservas.'
    ]);
    exit();
}

require_once 'conexao.php';

// Função para responder em JSON
function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    // Verificar se é POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(false, 'Método não permitido');
    }

    // Obter dados JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        responder(false, 'Dados inválidos');
    }

    $codigo_reserva = trim($input['codigo_reserva'] ?? '');

    // Validar código
    if (empty($codigo_reserva)) {
        responder(false, 'Código de reserva é obrigatório');
    }

    if (strlen($codigo_reserva) !== 8) {
        responder(false, 'Código de reserva deve ter 8 caracteres');
    }

    // Iniciar transação
    $conexao->begin_transaction();

    // Primeiro, verificar se o código existe (independente do status)
    $stmt = $conexao->prepare("
        SELECT pr.id, pr.usuario_id, pr.livro_id, pr.status, pr.data_solicitacao,
               u.nome as usuario_nome, u.email as usuario_email,
               l.titulo, l.autor, l.capa
        FROM pre_reservas pr
        JOIN usuarios u ON pr.usuario_id = u.id
        JOIN livros l ON pr.livro_id = l.id
        WHERE pr.codigo_reserva = ?
    ");
    
    $stmt->bind_param("s", $codigo_reserva);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Código de pré-reserva não encontrado');
    }
    
    $pre_reserva_info = $result->fetch_assoc();
    
    // Verificar se já foi convertida
    if ($pre_reserva_info['status'] === 'convertida') {
        $conexao->rollback();
        responder(false, 'Este código de pré-reserva já foi confirmado anteriormente');
    }
    
    // Verificar se ainda está pendente
    if ($pre_reserva_info['status'] !== 'pendente') {
        $conexao->rollback();
        responder(false, 'Código de pré-reserva inválido ou expirado');
    }
    
    // Buscar pré-reserva pendente
    $stmt = $conexao->prepare("
        SELECT pr.id, pr.usuario_id, pr.livro_id, pr.status, pr.data_solicitacao,
               u.nome as usuario_nome, u.email as usuario_email,
               l.titulo, l.autor, l.capa
        FROM pre_reservas pr
        JOIN usuarios u ON pr.usuario_id = u.id
        JOIN livros l ON pr.livro_id = l.id
        WHERE pr.codigo_reserva = ? AND pr.status = 'pendente'
    ");
    
    $stmt->bind_param("s", $codigo_reserva);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Erro interno: pré-reserva não encontrada');
    }
    
    $pre_reserva = $result->fetch_assoc();
    
    // Verificar se a pré-reserva não expirou (30 dias após solicitação)
    $agora = new DateTime();
    $data_solicitacao = new DateTime($pre_reserva['data_solicitacao']);
    $data_expiracao = clone $data_solicitacao;
    $data_expiracao->add(new DateInterval('P30D')); // 30 dias
    
    if ($agora > $data_expiracao) {
        $conexao->rollback();
        responder(false, 'Código de pré-reserva expirado');
    }
    
    // Verificar se há cópias disponíveis
    $stmt = $conexao->prepare("
        SELECT COUNT(*) as copias_disponiveis 
        FROM copias 
        WHERE livro_id = ? AND status = 'disponivel'
    ");
    $stmt->bind_param("i", $pre_reserva['livro_id']);
    $stmt->execute();
    $disponibilidade = $stmt->get_result()->fetch_assoc();
    
    if ($disponibilidade['copias_disponiveis'] > 0) {
        // Se há cópias disponíveis, fazer empréstimo direto
        $conexao->rollback();
        responder(false, 'Há cópias disponíveis. Faça um empréstimo direto ao invés de reserva');
    }
    
    // Calcular nova posição na fila (reservas ativas)
    $stmt = $conexao->prepare("
        SELECT COUNT(*) + 1 as posicao_fila
        FROM reservas
        WHERE livro_id = ? AND status = 'ativa'
    ");
    $stmt->bind_param("i", $pre_reserva['livro_id']);
    $stmt->execute();
    $posicao_fila = $stmt->get_result()->fetch_assoc()['posicao_fila'];
    
    // Definir timezone de Brasília
    date_default_timezone_set('America/Sao_Paulo');
    
    // Criar nova reserva e marcar pré-reserva como convertida
    $data_confirmacao = date('Y-m-d H:i:s');
    $data_expiracao_reserva = date('Y-m-d H:i:s', strtotime("+7 days")); // Reserva válida por 7 dias
    
    // Inserir nova reserva
    $stmt = $conexao->prepare("
        INSERT INTO reservas (usuario_id, livro_id, pre_reserva_id, data_reserva, data_expiracao, posicao_fila, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ativa')
    ");
    $stmt->bind_param("iiissi", $pre_reserva['usuario_id'], $pre_reserva['livro_id'], $pre_reserva['id'], $data_confirmacao, $data_expiracao_reserva, $posicao_fila);
    
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao criar reserva');
    }
    
    $reserva_id = $conexao->insert_id;
    
    // Marcar pré-reserva como convertida
    $stmt = $conexao->prepare("
        UPDATE pre_reservas 
        SET status = 'convertida'
        WHERE id = ?
    ");
    $stmt->bind_param("i", $pre_reserva['id']);
    
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao confirmar reserva');
    }
    
    $conexao->commit();
    
    // Preparar dados de resposta
    $dados_reserva = [
        'reserva_id' => $reserva_id,
        'pre_reserva_id' => $pre_reserva['id'],
        'livro' => [
            'id' => $pre_reserva['livro_id'],
            'titulo' => $pre_reserva['titulo'],
            'autor' => $pre_reserva['autor'],
            'capa' => $pre_reserva['capa']
        ],
        'usuario' => [
            'id' => $pre_reserva['usuario_id'],
            'nome' => $pre_reserva['usuario_nome'],
            'email' => $pre_reserva['usuario_email']
        ],
        'reserva' => [
            'codigo_reserva' => $codigo_reserva,
            'posicao_fila' => $posicao_fila,
            'data_confirmacao' => $data_confirmacao,
            'data_expiracao' => $data_expiracao_reserva,
            'status' => 'ativa'
        ]
    ];
    
    // Preparar dados para email de confirmação
    $dadosEmail = [
        'email' => $pre_reserva['usuario_email'],
        'nomeUsuario' => $pre_reserva['usuario_nome'],
        'tituloLivro' => $pre_reserva['titulo'],
        'autorLivro' => $pre_reserva['autor'],
        'dataReserva' => date('d/m/Y H:i', strtotime($data_confirmacao)),
        'dataExpiracao' => date('d/m/Y H:i', strtotime($data_expiracao_reserva)),
        'posicaoFila' => $posicao_fila,
        'tipoReserva' => 'reserva',
        'codigoReserva' => $codigo_reserva
    ];
    
    // Enviar email de confirmação (opcional)
    $emailEnviado = false;
    try {
        if (file_exists('enviar_email_reserva.php')) {
            include_once 'enviar_email_reserva.php';
            $emailEnviado = enviarEmailReserva($dadosEmail);
        }
    } catch (Exception $emailError) {
        // Log do erro de email, mas não interrompe o processo
        error_log('Erro no envio de email: ' . $emailError->getMessage());
    }
    
    // Responder com sucesso independente do email
    $mensagem = 'Pré-reserva confirmada com sucesso! Posição na fila: ' . $posicao_fila;
    if (!$emailEnviado) {
        $mensagem .= ' (Email de confirmação não pôde ser enviado)';
    }
    
    responder(true, $mensagem, $dados_reserva);
    
} catch (Exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }
    responder(false, 'Erro ao processar reserva: ' . $e->getMessage());
}

if (isset($conexao)) {
    $conexao->close();
}
?>