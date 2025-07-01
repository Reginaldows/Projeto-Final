<?php 
include('conexao.php');

$nome = $_POST['nome'];
$cpf = $_POST['cpf'];
$email = $_POST['email'];
$senha = $_POST['senha'];

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conexao, "INSERT INTO dados (nome, cpf, email, senha) VALUES (?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, "ssss", $nome, $cpf, $email, $senha_hash);

if (mysqli_stmt_execute($stmt)) {
    echo "Cadastrado com sucesso!";
} else {
    echo "Erro no cadastro: " . mysqli_error($conexao);
}

mysqli_stmt_close($stmt);
mysqli_close($conexao);
?>
