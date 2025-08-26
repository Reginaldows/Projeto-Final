<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Access-Control-Allow-Origin: http://localhost:5174');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/vendor/autoload.php';
require 'conexao.php';

// Função para log detalhado
function logDebug($mensagem) {
    $logFile = __DIR__ . '/logs/email_bibliotecario_debug.log';
    if (!is_dir(dirname($logFile))) mkdir(dirname($logFile), 0755, true);
    file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $mensagem . "\n", FILE_APPEND | LOCK_EX);
    error_log($mensagem); // Também no error_log do PHP
}

// Função para responder em JSON
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

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

// Receber dados
$input = file_get_contents('php://input');
$dados = json_decode($input, true);

if (!$dados) {
    logDebug('Erro ao decodificar JSON: ' . json_last_error_msg());
    responder(false, 'Dados inválidos');
}

logDebug('Dados recebidos: ' . json_encode($dados));

// Validar campos obrigatórios
$camposObrigatorios = ['email', 'nomeUsuario', 'tituloLivro', 'autorLivro', 'dataEmprestimo', 'dataDevolucao'];
foreach ($camposObrigatorios as $campo) {
    if (empty($dados[$campo])) {
        logDebug("Campo obrigatório ausente: $campo");
        responder(false, "Campo obrigatório ausente: $campo");
    }
}

try {
    // Configurar PHPMailer
    $mail = new PHPMailer(true);
    
    // Configurações do servidor SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'juniorfb98@@gmail.com';
    $mail->Password = 'pgyz zcgj oxft jisv'; // App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';
    
    // Configurações do email
    $mail->setFrom('bibliotecasenai2024@gmail.com', 'Biblioteca SENAI');
    $mail->addAddress($dados['email'], $dados['nomeUsuario']);
    
    $mail->isHTML(true);
    $mail->Subject = '📚 Empréstimo Realizado - Biblioteca SENAI';
    
    // Template HTML do email
    $htmlBody = '
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Empréstimo Realizado</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            .book-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }
            .dates {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
            }
            .date-box {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                flex: 1;
                margin: 0 10px;
            }
            .important {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Empréstimo Realizado</h1>
                <p>Biblioteca SENAI</p>
            </div>
            
            <p>Olá, <strong>' . htmlspecialchars($dados['nomeUsuario']) . '</strong>!</p>
            
            <p>Seu empréstimo foi realizado com sucesso pelo bibliotecário. Aqui estão os detalhes:</p>
            
            <div class="book-info">
                <h3>📖 Informações do Livro</h3>
                <p><strong>Título:</strong> ' . htmlspecialchars($dados['tituloLivro']) . '</p>
                <p><strong>Autor:</strong> ' . htmlspecialchars($dados['autorLivro']) . '</p>
            </div>
            
            <div class="dates">
                <div class="date-box">
                    <h4>📅 Data do Empréstimo</h4>
                    <p><strong>' . htmlspecialchars($dados['dataEmprestimo']) . '</strong></p>
                </div>
                <div class="date-box">
                    <h4>⏰ Data de Devolução</h4>
                    <p><strong>' . htmlspecialchars($dados['dataDevolucao']) . '</strong></p>
                </div>
            </div>
            
            <div class="important">
                <h4>⚠️ Importante</h4>
                <ul>
                    <li>Lembre-se de devolver o livro até a data prevista</li>
                    <li>Renovações podem ser solicitadas antes do vencimento</li>
                    <li>Atrasos podem resultar em multas</li>
                    <li>Mantenha o livro em bom estado</li>
                </ul>
            </div>
            
            <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
            
            <div class="footer">
                <p>Atenciosamente,<br>
                <strong>Equipe da Biblioteca SENAI</strong></p>
                <p><small>Este é um email automático, não responda.</small></p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    $mail->Body = $htmlBody;
    
    // Versão texto alternativa
    $mail->AltBody = "Olá, {$dados['nomeUsuario']}!\n\n";
    $mail->AltBody .= "Seu empréstimo foi realizado com sucesso pelo bibliotecário.\n\n";
    $mail->AltBody .= "Livro: {$dados['tituloLivro']}\n";
    $mail->AltBody .= "Autor: {$dados['autorLivro']}\n";
    $mail->AltBody .= "Data do Empréstimo: {$dados['dataEmprestimo']}\n";
    $mail->AltBody .= "Data de Devolução: {$dados['dataDevolucao']}\n\n";
    $mail->AltBody .= "Lembre-se de devolver o livro até a data prevista.\n\n";
    $mail->AltBody .= "Atenciosamente,\nEquipe da Biblioteca SENAI";
    
    logDebug('Tentando enviar email para: ' . $dados['email']);
    
    // Enviar email
    $mail->send();
    
    logDebug('Email enviado com sucesso para: ' . $dados['email']);
    responder(true, 'Email de empréstimo enviado com sucesso');
    
} catch (Exception $e) {
    logDebug('Erro ao enviar email: ' . $e->getMessage());
    responder(false, 'Erro ao enviar email: ' . $e->getMessage());
}
?>