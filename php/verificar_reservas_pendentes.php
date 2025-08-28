<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

try {
    $stmt = $conexao->prepare("
        SELECT DISTINCT r.id as reserva_id, r.usuario_id, r.livro_id, r.tipo, r.data_reserva,
               u.nome as usuario_nome, u.email as usuario_email,
               l.titulo, l.autor
        FROM reservas r
        JOIN usuarios u ON r.usuario_id = u.id
        JOIN livros l ON r.livro_id = l.id
        WHERE r.status IN ('pendente', 'confirmada')
        AND EXISTS (
            SELECT 1 FROM copias c 
            WHERE c.livro_id = r.livro_id 
            AND c.status = 'disponivel'
        )
        ORDER BY r.data_reserva ASC
    ");
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reservas_processadas = [];
    $emails_enviados = 0;
    
    while ($reserva = $result->fetch_assoc()) {
        $update_stmt = $conexao->prepare("UPDATE reservas SET status = 'disponivel' WHERE id = ?");
        $update_stmt->bind_param("i", $reserva['reserva_id']);
        $update_stmt->execute();
        
        $email_data = [
            'email' => $reserva['usuario_email'],
            'nomeUsuario' => $reserva['usuario_nome'],
            'tituloLivro' => $reserva['titulo'],
            'autorLivro' => $reserva['autor'],
            'dataReserva' => date('d/m/Y H:i', strtotime($reserva['data_reserva'])),
            'dataDisponibilidade' => date('d/m/Y H:i'),
            'tipoReserva' => $reserva['tipo']
        ];
        
        $email_json = json_encode($email_data);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/enviar_email_disponibilidade.php');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $email_json);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $email_result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $reservas_processadas[] = [
            'reserva_id' => $reserva['reserva_id'],
            'usuario' => $reserva['usuario_nome'],
            'email' => $reserva['usuario_email'],
            'livro' => $reserva['titulo'],
            'email_enviado' => ($http_code === 200),
            'email_response' => $email_result
        ];
        
        if ($http_code === 200) {
            $emails_enviados++;
            error_log("Email de disponibilidade enviado com sucesso para: " . $reserva['usuario_email']);
        } else {
            error_log("Erro ao enviar email de disponibilidade para: " . $reserva['usuario_email']);
        }
    }
    
    responder(true, "Processamento concluído. {$emails_enviados} e-mails enviados de " . count($reservas_processadas) . " reservas processadas.", [
        'total_reservas' => count($reservas_processadas),
        'emails_enviados' => $emails_enviados,
        'reservas' => $reservas_processadas
    ]);
    
} catch (Exception $e) {
    responder(false, 'Erro ao verificar reservas pendentes: ' . $e->getMessage());
}

$conexao->close();
?>