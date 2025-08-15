<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include('conexao.php');

$nome = $_POST['nome'] ?? null;
$cpf = $_POST['cpf'] ?? null;
$email = $_POST['email'] ?? null;
$senha = $_POST['senha'] ?? null;

if (!$nome || !$cpf || !$email || !$senha) {
    http_response_code(400);
    echo "Dados incompletos.";
    exit;
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conexao, "INSERT INTO dados (nome, cpf, email, senha) VALUES (?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, "ssss", $nome, $cpf, $email, $senha_hash);

if (mysqli_stmt_execute($stmt)) {
    echo "Cadastrado com sucesso!";
} else {
    http_response_code(500);
    echo "Erro no cadastro: " . mysqli_error($conexao);
}

mysqli_stmt_close($stmt);
mysqli_close($conexao);
?>
