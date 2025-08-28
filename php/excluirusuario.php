<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include('conexao.php');

function responder($success, $mensagem) {
    echo json_encode([
        'success' => $success,
        'message' => $mensagem
    ]);
    exit;
}

$id = $_POST['id'] ?? null;

if (!$id) {
    responder(false, "ID do usuário não fornecido");
}

$stmt = mysqli_prepare($conexao, "DELETE FROM usuarios WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);

if (mysqli_stmt_execute($stmt)) {
    responder(true, "Usuário excluído com sucesso");
} else {
    responder(false, "Erro ao excluir usuário: " . mysqli_error($conexao));
}

mysqli_stmt_close($stmt);
mysqli_close($conexao);
?>