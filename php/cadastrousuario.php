<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include('conexao.php');


$nomeCompleto   = $_POST['nome'] ?? null;
$dataNascimento = $_POST['data_nasc'] ?? null;
$cpf            = $_POST['cpf'] ?? null;
$celular        = $_POST['celular'] ?? null;
$cep            = $_POST['cep'] ?? null;
$endereco       = $_POST['rua'] ?? null;
$numero         = $_POST['numero'] ?? null;
$complemento    = $_POST['complemento'] ?? null;
$bairro         = $_POST['bairro'] ?? null;
$cidade         = $_POST['cidade'] ?? null;
$estado         = $_POST['estado'] ?? null;
$email          = $_POST['email'] ?? null;
$senha          = $_POST['senha'] ?? null;


$tipo = "usuario";


if (
    !$nomeCompleto || !$cpf || !$email || !$senha || !$cep || !$endereco || 
    !$numero || !$bairro || !$cidade || !$estado || !$celular
) {
    http_response_code(400);
    echo "Dados incompletos.";
    exit;
}


$senha_hash = password_hash($senha, PASSWORD_DEFAULT);


$stmt = mysqli_prepare(
    $conexao, 
    "INSERT INTO usuarios 
    (nome, data_nasc, cpf, celular, cep, rua, numero, complemento, bairro, cidade, estado, email, senha, tipo_usuario) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);


mysqli_stmt_bind_param(
    $stmt, 
    "ssssssssssssss", 
    $nomeCompleto, 
    $dataNascimento, 
    $cpf, 
    $celular, 
    $cep, 
    $endereco, 
    $numero, 
    $complemento, 
    $bairro, 
    $cidade, 
    $estado, 
    $email, 
    $senha_hash,
    $tipo
);

if (mysqli_stmt_execute($stmt)) {
    echo "Cadastrado com sucesso!";
} else {
    http_response_code(500);
    echo "Erro no cadastro: " . mysqli_error($conexao);
}

mysqli_stmt_close($stmt);
mysqli_close($conexao);
?>
