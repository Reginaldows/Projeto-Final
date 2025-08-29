<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function logDebug($message) {
    $log = date('Y-m-d H:i:s') . ' - ' . $message . PHP_EOL;
    file_put_contents('email_pagamento_debug.log', $log, FILE_APPEND | LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'JSON inválido']);
    exit;
}

if (!isset($input['email']) || !isset($input['nome']) || !isset($input['livro_titulo']) || !isset($input['valor_pago']) || !isset($input['emprestimo_id'])) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Campos obrigatórios não fornecidos']);
    exit;
}

$email = $input['email'];
$nome = $input['nome'];
$livroTitulo = $input['livro_titulo'];
$valorPago = $input['valor_pago'];
$emprestimoId = $input['emprestimo_id'];

logDebug("Enviando e-mail de confirmação de pagamento para: $email");

try {
    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'seu_email@gmail.com';
    $mail->Password = 'sua_senha_de_app';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';
    
    $mail->setFrom('seu_email@gmail.com', 'Sistema Biblioteca');
    $mail->addAddress($email, $nome);
    
    $mail->isHTML(true);
    $mail->Subject = 'Pagamento de Multa Confirmado - Sistema Biblioteca';
    
    $corpoHTML = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .success-icon { font-size: 48px; color: #28a745; text-align: center; margin-bottom: 20px; }
            .info-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>✅ Pagamento Confirmado!</h1>
            </div>
            <div class='content'>
                <div class='success-icon'>🎉</div>
                
                <p>Olá <strong>$nome</strong>,</p>
                
                <p>Seu pagamento da multa foi <strong>confirmado com sucesso</strong>!</p>
                
                <div class='info-box'>
                    <h3>📋 Detalhes do Pagamento:</h3>
                    <p><strong>Livro:</strong> $livroTitulo</p>
                    <p><strong>Empréstimo ID:</strong> #$emprestimoId</p>
                    <p><strong>Valor Pago:</strong></p>
                    <div class='amount'>R$ " . number_format($valorPago, 2, ',', '.') . "</div>
                    <p><strong>Data do Pagamento:</strong> " . date('d/m/Y H:i:s') . "</p>
                </div>
                
                <p>✅ <strong>Sua situação foi regularizada!</strong> Agora você pode fazer novos empréstimos normalmente.</p>
                
                <p>Obrigado por utilizar nosso sistema de biblioteca!</p>
                
                <div class='footer'>
                    <p>Este é um e-mail automático, não responda.</p>
                    <p>Sistema de Biblioteca - " . date('Y') . "</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->Body = $corpoHTML;
    
    $mail->AltBody = "
    PAGAMENTO DE MULTA CONFIRMADO
    
    Olá $nome,
    
    Seu pagamento da multa foi confirmado com sucesso!
    
    Detalhes do Pagamento:
    - Livro: $livroTitulo
    - Empréstimo ID: #$emprestimoId
    - Valor Pago: R$ " . number_format($valorPago, 2, ',', '.') . "
    - Data do Pagamento: " . date('d/m/Y H:i:s') . "
    
    Sua situação foi regularizada! Agora você pode fazer novos empréstimos normalmente.
    
    Obrigado por utilizar nosso sistema de biblioteca!
    
    ---
    Este é um e-mail automático, não responda.
    Sistema de Biblioteca - " . date('Y') . "
    ";
    
    $mail->send();
    
    logDebug("E-mail de confirmação de pagamento enviado com sucesso para: $email");
    
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'E-mail de confirmação de pagamento enviado com sucesso'
    ]);
    
} catch (Exception $e) {
    logDebug("Erro ao enviar e-mail de confirmação de pagamento: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro ao enviar e-mail: ' . $e->getMessage()
    ]);
}

?>