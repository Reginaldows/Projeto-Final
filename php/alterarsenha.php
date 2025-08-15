<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['erro' => 'Método não permitido']));
}

require 'conexao.php';

try {
    $senha = $_POST['senha'] ?? '';
    $confirmSenha = $_POST['confirm-senha'] ?? '';
    $token = $_POST['token'] ?? '';

    if (!$token) {
        http_response_code(400);
        exit(json_encode(['erro' => 'Token inválido']));
    }

    if (empty($senha) || empty($confirmSenha)) {
        http_response_code(400);
        exit(json_encode(['erro' => 'Preencha todos os campos']));
    }

    if ($senha !== $confirmSenha) {
        http_response_code(400);
        exit(json_encode(['erro' => 'As senhas não coincidem']));
    }

    if (strlen($senha) < 8 || 
        !preg_match('/[A-Z]/', $senha) || 
        !preg_match('/[a-z]/', $senha) || 
        !preg_match('/[0-9]/', $senha) || 
        !preg_match('/[^A-Za-z0-9]/', $senha)) {
        http_response_code(400);
        exit(json_encode(['erro' => 'A senha não atende aos requisitos de segurança']));
    }

    $stmt = $conexao->prepare("
        SELECT dados_id FROM tokens 
        WHERE token = ? AND usado = 0 AND expira > NOW()
    ");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(400);
        exit(json_encode(['erro' => 'Token inválido ou expirado']));
    }

    $dados_id = $result->fetch_assoc()['dados_id'];

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    
    $stmt = $conexao->prepare("UPDATE dados SET senha = ? WHERE id = ?");
    $stmt->bind_param('si', $senhaHash, $dados_id);
    $stmt->execute();

    $stmt = $conexao->prepare("UPDATE tokens SET usado = 1 WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(['sucesso' => 'Senha atualizada com sucesso!']);

} catch (Exception $e) {
    error_log("Erro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno no servidor']);
}
?>
