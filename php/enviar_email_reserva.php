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
    $logFile = __DIR__ . '/logs/email_reserva_debug.log';
    if (!is_dir(dirname($logFile))) mkdir(dirname($logFile), 0755, true);
    file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $mensagem . "\n", FILE_APPEND | LOCK_EX);
    error_log($mensagem);
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
    responder(false, 'Dados inválidos');
}

// Log dos dados recebidos
logDebug("=== DADOS RECEBIDOS ===");
logDebug("Dados completos: " . json_encode($dados, JSON_UNESCAPED_UNICODE));

// Função principal para enviar email de reserva
function enviarEmailReserva($dados) {
    logDebug("=== INICIANDO ENVIO DE EMAIL DE RESERVA ===");
    
    $destinatario = $dados['email'] ?? '';
    $nomeUsuario = $dados['nomeUsuario'] ?? '';
    $tituloLivro = $dados['tituloLivro'] ?? '';
    $autorLivro = $dados['autorLivro'] ?? '';
    $dataReserva = $dados['dataReserva'] ?? '';
    $dataExpiracao = $dados['dataExpiracao'] ?? '';
    $posicaoFila = $dados['posicaoFila'] ?? '';
    $tipoReserva = $dados['tipoReserva'] ?? '';
    
    logDebug("Destinatário: {$destinatario}");
    logDebug("Nome: {$nomeUsuario}");
    logDebug("Livro: {$tituloLivro}");
    logDebug("Tipo: {$tipoReserva}");
    
    $tipoNome = ($tipoReserva === 'pre_reserva') ? 'Pré-reserva' : 'Reserva';
    $assunto = "Confirmação de {$tipoNome} - {$tituloLivro}";
    
    // HTML do email
    $mensagemHtml = "
    <html>
    <head><meta charset='UTF-8'><title>{$tipoNome} Confirmada</title></head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='background-color: #0066cc; color: white; padding: 20px; text-align: center;'>
                <h2>Biblioteca SENAI</h2>
                <p>{$tipoNome} Confirmada</p>
            </div>
            <div style='padding: 20px; background-color: #f9f9f9;'>
                <p>Olá, <strong>" . htmlspecialchars($nomeUsuario) . "</strong>!</p>
                <p>Sua {$tipoReserva} foi confirmada com sucesso na Biblioteca SENAI.</p>
                <div style='background-color: #e9e9e9; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                    <h3 style='margin-top: 0; color: #0066cc;'>📚 Detalhes do Livro</h3>
                    <p><strong>Título:</strong> " . htmlspecialchars($tituloLivro) . "</p>
                    <p><strong>Autor:</strong> " . htmlspecialchars($autorLivro) . "</p>
                </div>
                <p><strong>Informações da {$tipoNome}:</strong></p>
                <ul>
                    <li><strong>Posição na fila:</strong> {$posicaoFila}º</li>
                    <li><strong>Data da reserva:</strong> {$dataReserva}</li>
                    <li><strong>Válida até:</strong> {$dataExpiracao}</li>
                </ul>
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Você será notificado por email quando o livro estiver disponível</li>
                    <li>Mantenha seus dados de contato atualizados</li>
                    <li>A reserva expira na data indicada acima</li>
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

        $mail->isHTML(true);
        $mail->Subject = $assunto;
        $mail->Body = $mensagemHtml;
        
        $mail->AltBody = "Olá " . $nomeUsuario . "!\n\nSua {$tipoReserva} foi confirmada com sucesso na Biblioteca SENAI.\n\nDetalhes do Livro:\nTítulo: " . $tituloLivro . "\nAutor: " . $autorLivro . "\n\nInformações da {$tipoNome}:\nPosição na fila: " . $posicaoFila . "º\nData da reserva: " . $dataReserva . "\nVálida até: " . $dataExpiracao . "\n\nVocê será notificado por email quando o livro estiver disponível.";

        $mail->send();
        logDebug("Email de reserva enviado com sucesso!");

        return true;

    } catch (Exception $e) {
        logDebug("ERRO no envio: " . $mail->ErrorInfo);
        return $mail->ErrorInfo;
    }
}

$resultado = enviarEmailReserva($dados);

if ($resultado === true) {
    responder(true, 'Email de confirmação de reserva enviado com sucesso!');
} else {
    responder(false, 'Falha ao enviar email: ' . $resultado);
}
?>