<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/vendor/autoload.php';
require 'conexao.php';

function logDebug($mensagem) {
    $logFile = __DIR__ . '/logs/email_debug.log';
    if (!is_dir(dirname($logFile))) mkdir(dirname($logFile), 0755, true);
    file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $mensagem . "\n", FILE_APPEND | LOCK_EX);
    error_log($mensagem);
}

function responder($sucesso, $mensagem, $dados = null) {
    $resposta = [
        'sucesso' => $sucesso,
        'mensagem' => $mensagem
    ];
    
    if ($dados !== null) {
        $resposta['dados'] = $dados;
    }
    
    echo json_encode($resposta, JSON_UNESCAPED_UNICODE);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

$input = file_get_contents('php://input');
$dados = json_decode($input, true);

if (!$dados) {
    responder(false, 'Dados inválidos');
}

logDebug("=== DADOS RECEBIDOS ===");
logDebug("Dados completos: " . json_encode($dados, JSON_UNESCAPED_UNICODE));
logDebug("URL da capa recebida: " . ($dados['capaLivro'] ?? 'VAZIO'));

function processarUrlOpenLibrary($url) {
    if (empty($url)) {
        logDebug("URL vazia recebida para processar");
        return $url;
    }
    
    logDebug("URL original: {$url}");
    
    if (strpos($url, 'covers.openlibrary.org') !== false) {
        $url = str_replace('-S.jpg', '-M.jpg', $url);
        $url = str_replace('-S.png', '-M.png', $url);
        
        $url = str_replace('http://', 'https://', $url);
        logDebug("URL processada Open Library: {$url}");
    }
    
    return $url;
}

function enviarEmailEmprestimo($dados) {
    logDebug("=== INICIANDO ENVIO DE EMAIL ===");
    
    $destinatario = $dados['email'] ?? '';
    $nomeUsuario = $dados['nomeUsuario'] ?? '';
    $tituloLivro = $dados['tituloLivro'] ?? '';
    $autorLivro = $dados['autorLivro'] ?? '';
    $dataEmprestimo = $dados['dataEmprestimo'] ?? '';
    $dataDevolucao = $dados['dataDevolucao'] ?? '';
    $diasEmprestimo = $dados['diasEmprestimo'] ?? '';
    $capaLivro = $dados['capaLivro'] ?? '';
    
    logDebug("Destinatário: {$destinatario}");
    logDebug("Nome: {$nomeUsuario}");
    logDebug("Livro: {$tituloLivro}");
    logDebug("URL Capa: {$capaLivro}");
    
    $assunto = "Confirmação de Empréstimo - {$tituloLivro}";
    
    $mensagemHtml = "
    <html>
    <head><meta charset='UTF-8'><title>Empréstimo Confirmado</title></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background-color: #0066cc; color: white; padding: 20px; text-align: center;'>
                <h2>Biblioteca SENAI</h2>
                <p>Empréstimo Confirmado</p>
            </div>
            <div style='padding: 20px; background-color: #f9f9f9;'>
                <p>Olá, <strong>" . htmlspecialchars($nomeUsuario) . "</strong>!</p>
                <p>Seu empréstimo foi confirmado com sucesso na Biblioteca SENAI.</p>
                <div style='background-color: #e9e9e9; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                    <h3 style='margin-top: 0; color: #0066cc;'>📚 Detalhes do Livro</h3>
                    <p><strong>Título:</strong> " . htmlspecialchars($tituloLivro) . "</p>
                    <p><strong>Autor:</strong> " . htmlspecialchars($autorLivro) . "</p>
                </div>
                <p><strong>Informações do Empréstimo:</strong></p>
                <ul>
                    <li><strong>Data de Devolução:</strong> {$dataDevolucao}</li>
                    <li><strong>Período:</strong> {$diasEmprestimo} dias</li>
                </ul>
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Lembre-se de devolver o livro na data indicada</li>
                    <li>Renovações podem ser feitas através do sistema</li>
                    <li>Em caso de dúvidas, entre em contato conosco</li>
                </ul>
            </div>
        </div>
    </body>
    </html>";

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'juniorfb98@gmail.com';
        $mail->Password = 'pgyz zcgj oxft jisv';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom('juniorfb98@gmail.com', 'Sistema Biblioteca SENAI');
        $mail->addAddress($destinatario, $nomeUsuario);

        logDebug("Email sem anexos de imagem");

        $mail->isHTML(true);
        $mail->Subject = $assunto;
        $mail->Body = $mensagemHtml;
        
        $mail->AltBody = "Olá " . $nomeUsuario . "!\n\nSeu empréstimo foi confirmado com sucesso na Biblioteca SENAI.\n\nDetalhes do Livro:\nTítulo: " . $tituloLivro . "\nAutor: " . $autorLivro . "\n\nInformações do Empréstimo:\nData de Devolução: " . $dataDevolucao . "\nPeríodo: " . $diasEmprestimo . " dias\n\nLembre-se de devolver o livro na data indicada.\n\nBiblioteca SENAI";

        $mail->send();
        logDebug("Email enviado com sucesso!");

        return true;

    } catch (Exception $e) {
        logDebug("ERRO no envio: " . $mail->ErrorInfo);
        
        return $mail->ErrorInfo;
    }
}

$resultado = enviarEmailEmprestimo($dados);

if ($resultado === true) {
    responder(true, 'Email de confirmação enviado com sucesso! Verifique o log de debug para detalhes.');
} else {
    responder(false, 'Falha ao enviar email: ' . $resultado . ' - Verifique o log de debug.');
}
?>