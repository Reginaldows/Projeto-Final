<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Access-Control-Allow-Origin: *"); // ajuste conforme necessário
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'conexao.php';

function responder($success, $mensagem, $nome = '', $tipo = '') {
    echo json_encode([
        'success' => $success,
        'message' => $mensagem,
        'nome' => $nome,
        'tipo_usuario' => $tipo
    ]);
    exit;
}

$login = $_POST['login'] ?? '';
$senha = $_POST['senha'] ?? '';

if (!$login || !$senha) {
    responder(false, "Login e senha são obrigatórios.");
}

// Normaliza o CPF removendo pontos e traços
$login_normalizado = preg_replace('/[\.\-]/', '', $login);

$stmt = $conexao->prepare("
    SELECT nome, senha, tipo, cpf, email 
    FROM dados 
    WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = ? OR email = ?
");
$stmt->bind_param("ss", $login_normalizado, $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    responder(false, "Usuário não encontrado.");
}

$usuario = $result->fetch_assoc();

// Verifica a senha hash
if (!password_verify($senha, $usuario['senha'])) {
    responder(false, "Senha incorreta.");
}

// Login OK
$resposta_nome = $usuario['nome'];
$resposta_tipo = $usuario['tipo']; // bibliotecario ou aluno
responder(true, "Login bem-sucedido", $resposta_nome, $resposta_tipo);
