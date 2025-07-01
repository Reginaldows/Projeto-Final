<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require 'conexao.php';

$cpf = isset($_POST['cpf']) ? preg_replace('/\D/', '', $_POST['cpf']) : '';
if (empty($cpf)) {
    http_response_code(400);
    exit('CPF inválido.');
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
    exit('Usuário não encontrado.');
}

$token = bin2hex(random_bytes(32));
$expira_em = date('Y-m-d H:i:s', strtotime('+1 hour'));

$stmt = $conexao->prepare(
    "INSERT INTO tokens (dados_id, token, expira, usado) VALUES (?, ?, ?, 0)"
);
$stmt->bind_param('iss', $usuario['id'], $token, $expira_em);
$stmt->execute();

$link = "http://localhost/ProjetoFinal/redefinirsenha.php?token=" . $token;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'juniorfb98@gmail.com';
    $mail->Password   = 'vajp qbto djir bdim';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    $mail->setFrom('exemplo@gmail.com', 'Sistema');
    $mail->addAddress($usuario['email'], $usuario['nome']);

    $mail->isHTML(true);
    $mail->Subject = 'Redefinição de senha';
    $mail->Body    = "Olá {$usuario['nome']}! Clique aqui para redefinir sua senha: <a href='$link'>$link</a>";
    $mail->AltBody = "Olá {$usuario['nome']}! Acesse o link para redefinir sua senha: $link";

    $mail->send();
    http_response_code(200);
    echo "E-mail de redefinição enviado com sucesso!";
} catch (Exception $e) {
    http_response_code(500);
    echo "Erro ao enviar o e-mail: {$mail->ErrorInfo}";
}
