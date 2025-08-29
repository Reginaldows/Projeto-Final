<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Access-Control-Allow-Origin: http://localhost:5173"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'conexao.php';

function responder($success, $mensagem, $nome = '', $tipo = '', $id = '') {
    echo json_encode([
        'success' => $success,
        'message' => $mensagem,
        'nome' => $nome,
        'tipo_usuario' => $tipo,
        'id' => $id
    ]);
    exit;
}

$login = trim($_POST['login'] ?? '');
$senha = trim($_POST['senha'] ?? '');

if (empty($login) || empty($senha)) {
    responder(false, "Login e senha são obrigatórios.");
}

$login_normalizado = preg_replace('/[\.\.\-]/', '', $login);

$stmt = $conexao->prepare("
    SELECT id, nome, senha, tipo_usuario, cpf, email 
    FROM usuarios 
    WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = ? OR email = ?
");
$stmt->bind_param("ss", $login_normalizado, $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    responder(false, "Usuário não encontrado.");
}

$usuario = $result->fetch_assoc();

if (!password_verify($senha, $usuario['senha'])) {
    responder(false, "Senha incorreta.");
}

$resposta_nome = $usuario['nome'];
$resposta_tipo = $usuario['tipo_usuario'];
$resposta_id = $usuario['id'];
responder(true, "Login bem-sucedido", $resposta_nome, $resposta_tipo, $resposta_id);
