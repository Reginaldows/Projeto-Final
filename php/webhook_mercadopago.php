<?php
// webhook_mercadopago.php
require_once 'config_mercadopago.php';
require_once 'conexao.php';

define('MERCADOPAGO_ACCESS_TOKEN', 'TEST-7354900789104789-082910-2ea33e621f3120a956c9019818a1fcd5-1017117120');

function logWebhook($data) {
    $log = date('Y-m-d H:i:s') . " - " . json_encode($data) . "\n";
    file_put_contents('webhook_log.txt', $log, FILE_APPEND | LOCK_EX);
}

function updateMultaStatus($externalReference, $status, $paymentId) {
    global $conn;

    try {
        $multaId = str_replace('MULTA_', '', $externalReference);
        
        $metodoPagamento = ($status === 'pago') ? 'pix' : null;
        $dataPagamento = ($status === 'pago') ? 'CURRENT_TIMESTAMP' : 'NULL';

        $stmt = $conn->prepare("
            UPDATE multas 
            SET status = ?, 
                metodo_pagamento = ?, 
                data_pagamento = " . $dataPagamento . " 
            WHERE id = ?
        ");
        $stmt->bind_param('ssi', $status, $metodoPagamento, $multaId);
        $result = $stmt->execute();

        if ($result) {
            logWebhook([
                'multa_updated' => true,
                'multa_id' => $multaId,
                'new_status' => $status,
                'metodo_pagamento' => $metodoPagamento,
                'payment_id' => $paymentId
            ]);
        }

        return $result;
    } catch (Exception $e) {
        logWebhook(['error' => 'Erro ao atualizar multa: ' . $e->getMessage()]);
        return false;
    }
}

// Buscar pagamento via API REST do Mercado Pago
function getPaymentDetails($paymentId) {
    $ch = curl_init("https://api.mercadopago.com/v1/payments/$paymentId");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . MERCADOPAGO_ACCESS_TOKEN
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Processar notificação do Mercado Pago
function processPaymentNotification($paymentId) {
    $payment = getPaymentDetails($paymentId);
    if (!$payment || !isset($payment['status'])) {
        logWebhook(['error' => 'Pagamento não encontrado', 'payment_id' => $paymentId]);
        return false;
    }

    logWebhook([
        'payment_id' => $paymentId,
        'status' => $payment['status'],
        'external_reference' => $payment['external_reference'] ?? '',
        'transaction_amount' => $payment['transaction_amount'] ?? 0
    ]);

    // Atualizar status da multa
    $externalReference = $payment['external_reference'] ?? '';
    $status = $payment['status']; 

    switch ($status) {
        case 'approved':
            updateMultaStatus($externalReference, 'pago', $paymentId);
            break;
        case 'pending':
            updateMultaStatus($externalReference, 'pendente', $paymentId);
            break;
        case 'rejected':
        case 'cancelled':
            updateMultaStatus($externalReference, 'pendente', $paymentId);
            break;
    }

    return true;
}

// Receber webhook
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    logWebhook($data);

    if (isset($data['type']) && $data['type'] === 'payment') {
        if (isset($data['data']['id'])) {
            $paymentId = $data['data']['id'];
            if (processPaymentNotification($paymentId)) {
                http_response_code(200);
                echo json_encode(['status' => 'success']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'bad_request', 'message' => 'Payment ID not found']);
        }
    } else {
        http_response_code(200);
        echo json_encode(['status' => 'ignored']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'method_not_allowed']);
}
?>