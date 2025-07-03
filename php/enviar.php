<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require 'conexao.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['erro' => 'Método não permitido']));
}

try {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $cpf = $input['cpf'] ?? '';
    } else {
        $cpf = $_POST['cpf'] ?? '';
    }

    $cpf = preg_replace('/\D/', '', $cpf);

    if (empty($cpf)) {
        http_response_code(400);
        exit(json_encode(['erro' => 'CPF inválido ou não informado']));
    }

    $stmt = $conexao->prepare(
        "SELECT id, nome, email 
         FROM dados 
         WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?"
    );
    $stmt->bind_param('s', $cpf);
    $stmt->execute();
    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();

    if (!$usuario) {
        http_response_code(404);
        exit(json_encode(['erro' => 'CPF não encontrado em nossa base de dados']));
    }

    if (empty($usuario['email'])) {
        http_response_code(400);
        exit(json_encode(['erro' => 'Usuário não possui email cadastrado']));
    }

    $stmt = $conexao->prepare("UPDATE tokens SET usado = 1 WHERE dados_id = ? AND usado = 0");
    $stmt->bind_param('i', $usuario['id']);
    $stmt->execute();


    $token = bin2hex(random_bytes(32));
    $expira_em = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $stmt = $conexao->prepare(
        "INSERT INTO tokens (dados_id, token, expira, usado) VALUES (?, ?, ?, 0)"
    );
    $stmt->bind_param('iss', $usuario['id'], $token, $expira_em);
    
    if (!$stmt->execute()) {
        http_response_code(500);
        exit(json_encode(['erro' => 'Erro ao gerar token de redefinição']));
    }

    $link = "http://localhost/ProjetoFinal/redefinirsenha.php?token=" . $token;
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'juniorfb98@gmail.com';
    $mail->Password   = 'vajp qbto djir bdim';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom('juniorfb98@gmail.com', 'Sistema SENAI');
    $mail->addAddress($usuario['email'], $usuario['nome']);

    // Conteúdo do email
    $mail->isHTML(true);
    $mail->Subject = 'Redefinição de senha - Sistema SENAI';
    
    $mail->Body = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Redefinição de senha</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
                display: inline-block; 
                background-color: #0066cc; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Sistema SENAI</h2>
                <p>Redefinição de senha</p>
            </div>
            <div class='content'>
                <p>Olá, <strong>{$usuario['nome']}</strong>!</p>
                <p>Você solicitou a redefinição de sua senha no sistema SENAI.</p>
                <p>Para criar uma nova senha, clique no botão abaixo:</p>
                <p style='text-align: center; margin: 30px 0;'>
                    <a href='$link' class='button'>Redefinir minha senha</a>
                </p>
                <p>Ou copie e cole o link abaixo em seu navegador:</p>
                <p style='background-color: #e9e9e9; padding: 10px; word-break: break-all;'>
                    <a href='$link'>$link</a>
                </p>
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Este link expira em 1 hora</li>
                    <li>Se você não solicitou esta redefinição, ignore este email</li>
                    <li>Não compartilhe este link com ninguém</li>
                </ul>
            </div>
            <div class='footer'>
                <p>Este é um email automático, não responda.</p>
                <p>Sistema SENAI - " . date('Y') . "</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $mail->AltBody = "Olá {$usuario['nome']}!\n\nVocê solicitou a redefinição de sua senha.\n\nAcesse o link abaixo para criar uma nova senha:\n$link\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.\n\nSistema SENAI";
    $mail->send();
    
    http_response_code(200);
    echo json_encode([
        'sucesso' => 'Email de redefinição enviado com sucesso!',
        'email' => substr($usuario['email'], 0, 3) . '***@' . substr(strrchr($usuario['email'], '@'), 1)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao enviar email: ' . $e->getMessage()]);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no banco de dados: ' . $e->getMessage()]);
}