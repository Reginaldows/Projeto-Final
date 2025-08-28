<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function logDebug($message) {
    error_log("[EMAIL_DISPONIBILIDADE] " . date('Y-m-d H:i:s') . " - " . $message);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
    exit;
}

$input = file_get_contents('php://input');
logDebug("Dados recebidos: " . $input);

$dados = json_decode($input, true);

if (!$dados) {
    logDebug("Erro ao decodificar JSON");
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados inválidos']);
    exit;
}

$camposObrigatorios = ['email', 'nomeUsuario', 'tituloLivro', 'autorLivro'];
foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || empty($dados[$campo])) {
        logDebug("Campo obrigatório ausente: " . $campo);
        echo json_encode(['sucesso' => false, 'mensagem' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$email = $dados['email'];
$nomeUsuario = $dados['nomeUsuario'];
$tituloLivro = $dados['tituloLivro'];
$autorLivro = $dados['autorLivro'];
$dataReserva = $dados['dataReserva'] ?? date('d/m/Y H:i');
$dataDisponibilidade = $dados['dataDisponibilidade'] ?? date('d/m/Y H:i');
$tipoReserva = $dados['tipoReserva'] ?? 'reserva';

$tipoNome = ($tipoReserva === 'pre_reserva') ? 'Pré-reserva' : 'Reserva';

logDebug("Enviando email de disponibilidade para: $email");
logDebug("Livro: $tituloLivro - $autorLivro");

try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'bibliotecasenai464@gmail.com';
    $mail->Password = 'hjwf dwts kshy ywjc';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom('bibliotecasenai464@gmail.com', 'Biblioteca SENAI');
    $mail->addAddress($email, $nomeUsuario);
    $mail->addReplyTo('bibliotecasenai464@gmail.com', 'Biblioteca SENAI');

    $mail->isHTML(true);
    $mail->Subject = "📚 Livro Disponível - {$tipoNome} - Biblioteca SENAI";

    $mail->Body = "
    <!DOCTYPE html>
    <html lang='pt-BR'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Livro Disponível - Biblioteca SENAI</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
            <h1 style='color: white; margin: 0; font-size: 28px;'>📚 Biblioteca SENAI</h1>
            <p style='color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;'>Seu livro está disponível!</p>
        </div>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h2 style='color: #667eea; margin-bottom: 10px;'>Olá, " . htmlspecialchars($nomeUsuario) . "! 👋</h2>
                <p>Ótimas notícias! O livro que você reservou está disponível para empréstimo.</p>
                <div style='background-color: #e9e9e9; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                    <h3 style='margin-top: 0; color: #0066cc;'>📚 Detalhes do Livro</h3>
                    <p><strong>Título:</strong> " . htmlspecialchars($tituloLivro) . "</p>
                    <p><strong>Autor:</strong> " . htmlspecialchars($autorLivro) . "</p>
                </div>
                <p><strong>Informações da {$tipoNome}:</strong></p>
                <ul style='text-align: left; display: inline-block;'>
                    <li><strong>Data da reserva:</strong> {$dataReserva}</li>
                    <li><strong>Disponível desde:</strong> {$dataDisponibilidade}</li>
                    <li><strong>Status:</strong> Disponível para empréstimo</li>
                </ul>
                <div style='background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h4 style='margin-top: 0; color: #155724;'>🎉 Ação Necessária</h4>
                    <p><strong>Dirija-se à biblioteca o mais rápido possível para retirar seu livro!</strong></p>
                    <p>Sua reserva tem prioridade, mas pode expirar se não for retirada em tempo hábil.</p>
                </div>
                <p><strong>Importante:</strong></p>
                <ul style='text-align: left; display: inline-block;'>
                    <li>Você tem prioridade para retirar este livro</li>
                    <li>Dirija-se à biblioteca com um documento de identificação</li>
                    <li>Caso não possa retirar, entre em contato conosco</li>
                    <li>Sua reserva pode expirar se não for retirada em tempo hábil</li>
                </ul>
                <div style='margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;'>
                    <p style='margin: 0; font-size: 14px; color: #6c757d;'>
                        <strong>Biblioteca SENAI</strong><br>
                        📧 bibliotecasenai464@gmail.com<br>
                        🕒 Horário de funcionamento: Segunda a Sexta, 8h às 17h
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>";

    $mail->AltBody = "
    Biblioteca SENAI - Livro Disponível
    
    Olá, {$nomeUsuario}!
    
    Ótimas notícias! O livro que você reservou está disponível para empréstimo.
    
    Detalhes do Livro:
    - Título: {$tituloLivro}
    - Autor: {$autorLivro}
    
    Informações da {$tipoNome}:
    - Data da reserva: {$dataReserva}
    - Disponível desde: {$dataDisponibilidade}
    - Status: Disponível para empréstimo
    
    AÇÃO NECESSÁRIA:
    Dirija-se à biblioteca o mais rápido possível para retirar seu livro!
    
    Importante:
    - Você tem prioridade para retirar este livro
    - Dirija-se à biblioteca com um documento de identificação
    - Caso não possa retirar, entre em contato conosco
    - Sua reserva pode expirar se não for retirada em tempo hábil
    
    Biblioteca SENAI
    Email: bibliotecasenai464@gmail.com
    Horário: Segunda a Sexta, 8h às 17h
    ";

    $mail->send();
    
    logDebug("Email de disponibilidade enviado com sucesso para: $email");
    echo json_encode(['sucesso' => true, 'mensagem' => 'Email de disponibilidade enviado com sucesso']);

} catch (Exception $e) {
    logDebug("Erro ao enviar email: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao enviar email: ' . $e->getMessage()]);
}
?>