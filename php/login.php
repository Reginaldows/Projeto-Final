<?php
include 'conexao.php';

$login = $_POST['login'];
$senha = $_POST['senha'];
$loginLimpo = preg_replace('/\D/', '', $login);

$sql = "SELECT * FROM dados WHERE email = ? OR REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ss", $login, $loginLimpo);
$stmt->execute();
$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

if ($usuario && password_verify($senha, $usuario['senha'])) {
    session_start();
    $_SESSION['usuario'] = $usuario['nome'];
    header("Location: esquecisenha.html");
    exit();
} else {
    echo "Usuário ou senha inválidos.";
}
?>
