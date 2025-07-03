<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
include 'conexao.php';


$login = $_POST['login'] ?? '';
$senha = $_POST['senha'] ?? '';
$loginLimpo = preg_replace('/\D/', '', $login);

$sql = "SELECT * FROM dados WHERE email = ? OR REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ss", $login, $loginLimpo);
$stmt->execute();
$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

if ($usuario && password_verify($senha, $usuario['senha'])) {
    $_SESSION['usuario'] = $usuario['nome'];
    http_response_code(200);
    echo "Login realizado com sucesso";
    exit();
} else {
    http_response_code(401);
    echo "Usuário ou senha inválidos.";
    exit();
}
?>

