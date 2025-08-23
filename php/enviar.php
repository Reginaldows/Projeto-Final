<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'vendor/autoload.php';
require 'conexao.php';

function enviarResposta($codigo, $dados) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        enviarResposta(405, ['erro' => 'Método não permitido']);
    }

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $input = null;

    if (strpos($contentType, 'application/json') !== false) {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            enviarResposta(400, ['erro' => 'JSON inválido: ' . json_last_error_msg()]);
        }
        $cpf = $input['cpf'] ?? '';
    } else {
        $cpf = $_POST['cpf'] ?? '';
    }

    $cpf = preg_replace('/\D/', '', $cpf);

    if (empty($cpf)) {
        enviarResposta(400, ['erro' => 'CPF não informado']);
    }
    if (strlen($cpf) !== 11) {
        enviarResposta(400, ['erro' => 'CPF deve conter 11 dígitos']);
    }

    $stmt = $conexao->prepare("SELECT id, nome, email FROM dados WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?");
    if (!$stmt) {
        enviarResposta(500, ['erro' => 'Erro interno do servidor']);
    }
    $stmt->bind_param('s', $cpf);
    $stmt->execute();
    $result = $stmt->get_result();
    $usuario = $result->fetch_assoc();

    if (!$usuario) {
        enviarResposta(404, ['erro' => 'CPF não encontrado']);
    }
    if (empty($usuario['email'])) {
        enviarResposta(400, ['erro' => 'Usuário não possui email cadastrado']);
    }

    $stmt = $conexao->prepare("UPDATE tokens SET usado = 1 WHERE dados_id = ? AND usado = 0");
    if ($stmt) {
        $stmt->bind_param('i', $usuario['id']);
        $stmt->execute();
    }

    $token = bin2hex(random_bytes(32));
    $expira_em = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $conexao->prepare("INSERT INTO tokens (dados_id, token, expira, usado) VALUES (?, ?, ?, 0)");
    if (!$stmt) {
        enviarResposta(500, ['erro' => 'Erro interno do servidor']);
    }
    $stmt->bind_param('iss', $usuario['id'], $token, $expira_em);
    $stmt->execute();

    $link = "http://localhost:5173/alterarsenha?token=" . $token;

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'juniorfb98@gmail.com';
    $mail->Password = 'neqs uetc knsm hrtd';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom('juniorfb98@gmail.com', 'Sistema SENAI');
    $mail->addAddress($usuario['email'], $usuario['nome']);

    $mail->isHTML(true);
    $mail->Subject = 'Redefinição de senha - Sistema SENAI';

    $mail->Body = "
    <html>
    <head><meta charset='UTF-8'><title>Redefinição de senha</title></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background-color: #0066cc; color: white; padding: 20px; text-align: center;'>
                <h2>Biblioteca SENAI</h2>
                <p>Redefinição de senha</p>
            </div>
            <div style='padding: 20px; background-color: #f9f9f9;'>
                <p>Olá, <strong>" . htmlspecialchars($usuario['nome']) . "</strong>!</p>
                <p>Você solicitou a redefinição de sua senha na Biblioteca SENAI.</p>
                <p>Para criar uma nova senha, clique no botão abaixo:</p>
                <p style='text-align: center; margin: 30px 0;'>
                    <a href='$link' style='display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Redefinir minha senha</a>
                </p>
                <p>Ou copie e cole o link abaixo em seu navegador:</p>
                <p style='background-color: #e9e9e9; padding: 10px; word-break: break-all;'>$link</p>
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Este link expira em 1 hora</li>
                    <li>Se você não solicitou esta redefinição, ignore este email</li>
                    <li>Não compartilhe este link com ninguém</li>
                </ul>
            </div>
        </div>
    </body>
    </html>";

    $mail->AltBody = "Olá " . $usuario['nome'] . "!\n\nVocê solicitou a redefinição de sua senha.\n\nAcesse o link abaixo para criar uma nova senha:\n$link\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.\n\nSistema SENAI";

    $mail->send();

    $emailMascarado = substr($usuario['email'], 0, 3) . '***@' . substr(strrchr($usuario['email'], '@'), 1);

    enviarResposta(200, [
        'sucesso' => 'Email de redefinição enviado com sucesso!',
        'email' => $emailMascarado
    ]);
} catch (Throwable $e) {
    enviarResposta(500, ['erro' => 'Erro interno: ' . $e->getMessage()]);
}
