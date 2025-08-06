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
$dataNascimento = $_POST['dataNascimento'] ?? null;
$cep = $_POST['cep'] ?? null;
$rua = $_POST['rua'] ?? null;
$bairro = $_POST['bairro'] ?? null;
$estado = $_POST['estado'] ?? null;
$telefone = $_POST['telefone'] ?? null;

if (!$nome || !$cpf || !$email || !$senha || !$dataNascimento || !$cep || !$rua || !$bairro || !$estado || !$telefone) {
    http_response_code(400);
    echo "Dados incompletos.";
    exit;
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conexao, "INSERT INTO dados (nome, cpf, email, senha, data_nascimento, cep, rua, bairro, estado, telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, "ssssssssss", $nome, $cpf, $email, $senha_hash, $dataNascimento, $cep, $rua, $bairro, $estado, $telefone);

if (mysqli_stmt_execute($stmt)) {
    echo "Cadastrado com sucesso!";
} else {
    http_response_code(500);
    echo "Erro no cadastro: " . mysqli_error($conexao);
}

mysqli_stmt_close($stmt);
mysqli_close($conexao);
?>
