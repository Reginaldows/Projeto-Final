<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: text/plain");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método não permitido');
}

include 'conexao.php';

try {
    $senha = $_POST['senha'] ?? '';
    $confirmSenha = $_POST['confirm-senha'] ?? '';
    $token = $_POST['token'] ?? '';

    if (!$token) {
        http_response_code(400);
        exit("Token inválido.");
    }

    if (empty($senha) || empty($confirmSenha)) {
        http_response_code(400);
        exit("Preencha todos os campos.");
    }

    if ($senha !== $confirmSenha) {
        http_response_code(400);
        exit("As senhas não coincidem.");
    }

    if (strlen($senha) < 8) {
        http_response_code(400);
        exit("A senha deve ter pelo menos 8 caracteres.");
    }

    if (!preg_match('/[A-Z]/', $senha) || !preg_match('/[a-z]/', $senha)) {
        http_response_code(400);
        exit("A senha deve conter pelo menos uma letra maiúscula e uma minúscula.");
    }

    if (!preg_match('/[0-9]/', $senha)) {
        http_response_code(400);
        exit("A senha deve conter pelo menos um número.");
    }

    if (!preg_match('/[^A-Za-z0-9]/', $senha)) {
        http_response_code(400);
        exit("A senha deve conter pelo menos um caractere especial.");
    }

    $stmt = $conexao->prepare("SELECT dados_id, usado, expira FROM tokens WHERE token = ? AND usado = 0 AND expira > NOW()");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(400);
        exit("Token inválido ou expirado.");
    }

    $tokenData = $result->fetch_assoc();
    $dados_id = $tokenData['dados_id'];

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $conexao->prepare("UPDATE dados SET senha = ? WHERE id = ?");
    $stmt->bind_param('si', $senhaHash, $dados_id);
    $senhaAtualizada = $stmt->execute();

    if (!$senhaAtualizada) {
        http_response_code(500);
        exit("Erro ao atualizar a senha.");
    }
    $stmt = $conexao->prepare("UPDATE tokens SET usado = 1 WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();

    http_response_code(200);
    echo "Senha atualizada com sucesso!";

} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo "Erro no banco de dados: " . $e->getMessage();
} catch (Exception $e) {
    http_response_code(500);
    echo "Erro interno: " . $e->getMessage();
}
?>