<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
include 'conexao.php';

// Recebe dados do login
$login = $_POST['login'] ?? '';
$senha = $_POST['senha'] ?? '';
$loginLimpo = preg_replace('/\D/', '', $login);

// Consulta o usuário pelo e-mail ou CPF
$sql = "SELECT * FROM dados WHERE email = ? OR REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ss", $login, $loginLimpo);
$stmt->execute();
$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

if ($usuario && password_verify($senha, $usuario['senha'])) {
    $_SESSION['usuario'] = $usuario['nome'];

    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'nome' => $usuario['nome']
    ]);
    exit();
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Usuário ou senha inválidos.'
    ]);
    exit();
}
?>

