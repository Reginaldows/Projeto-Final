<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include('conexao.php');

// Função para responder em formato JSON
function responder($success, $mensagem, $dados = null) {
    echo json_encode([
        'success' => $success,
        'message' => $mensagem,
        'dados' => $dados
    ]);
    exit;
}

// Buscar todos os usuários
$query = "SELECT 
    nome,
    email,
    cpf,
    celular,
    data_nasc,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado
FROM usuarios ORDER By nome ASC ;
";
$result = mysqli_query($conexao, $query);

if (!$result) {
    responder(false, "Erro ao buscar usuários: " . mysqli_error($conexao));
}

$usuarios = [];
while ($row = mysqli_fetch_assoc($result)) {
    $usuarios[] = $row;
}

responder(true, "Usuários encontrados com sucesso", $usuarios);
?>