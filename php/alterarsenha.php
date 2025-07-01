<?php
include 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $senha = $_POST['senha'] ?? '';
    $confirmSenha = $_POST['confirm-senha'] ?? '';
    $token = $_POST['token'] ?? '';

    if (!$token) {
        die("Token inválido.");
    }

    if ($senha !== $confirmSenha) {
        die("As senhas não coincidem.");
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $conexao->prepare("SELECT dados_id, usado, expira FROM tokens WHERE token = ? AND usado = 0 AND expira > NOW()");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        die("Token inválido ou expirado.");
    }

    $tokenData = $result->fetch_assoc();
    $dados_id = $tokenData['dados_id'];

    $stmt = $conexao->prepare("UPDATE dados SET senha = ? WHERE id = ?");
    $stmt->bind_param('si', $senhaHash, $dados_id);
    $senhaAtualizada = $stmt->execute();

    if ($senhaAtualizada) {
        $stmt = $conexao->prepare("UPDATE tokens SET usado = 1 WHERE token = ?");
        $stmt->bind_param('s', $token);
        $stmt->execute();

        header('Location: login.html?mensagem=' . urlencode('Senha atualizada com sucesso!'));
        exit;
    } else {
        die("Erro ao atualizar a senha.");
    }
}
?>
