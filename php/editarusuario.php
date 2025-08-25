<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

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

// Se for uma requisição GET, busca os dados do usuário para edição
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        responder(false, "ID do usuário não fornecido");
    }
    
    $stmt = mysqli_prepare($conexao, "SELECT id, nome, data_nasc, cpf, celular, cep, rua, numero, complemento, bairro, cidade, estado, email, tipo_usuario FROM usuarios WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (mysqli_num_rows($result) === 0) {
        responder(false, "Usuário não encontrado");
    }
    
    $usuario = mysqli_fetch_assoc($result);
    responder(true, "Usuário encontrado", $usuario);
}

// Se for uma requisição POST, atualiza os dados do usuário
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $nome = $_POST['nome'] ?? null;
    $dataNascimento = $_POST['data_nasc'] ?? null;
    $cpf = $_POST['cpf'] ?? null;
    $celular = $_POST['celular'] ?? null;
    $cep = $_POST['cep'] ?? null;
    $endereco = $_POST['rua'] ?? null;
    $numero = $_POST['numero'] ?? null;
    $complemento = $_POST['complemento'] ?? null;
    $bairro = $_POST['bairro'] ?? null;
    $cidade = $_POST['cidade'] ?? null;
    $estado = $_POST['estado'] ?? null;
    $email = $_POST['email'] ?? null;
    $tipoUsuario = $_POST['tipo_usuario'] ?? null;
    
    // Verificar dados obrigatórios
    if (!$id || !$nome || !$cpf || !$email || !$celular) {
        responder(false, "Dados obrigatórios não fornecidos");
    }
    
    // Preparar a query para atualizar o usuário
    $stmt = mysqli_prepare(
        $conexao, 
        "UPDATE usuarios SET 
        nome = ?, data_nasc = ?, cpf = ?, celular = ?, cep = ?, 
        rua = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, 
        estado = ?, email = ?, tipo_usuario = ? 
        WHERE id = ?"
    );
    
    mysqli_stmt_bind_param(
        $stmt, 
        "sssssssssssssi", 
        $nome, 
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
        $tipoUsuario,
        $id
    );
    
    // Executar a query
    if (mysqli_stmt_execute($stmt)) {
        responder(true, "Usuário atualizado com sucesso");
    } else {
        responder(false, "Erro ao atualizar usuário: " . mysqli_error($conexao));
    }
    
    mysqli_stmt_close($stmt);
}

mysqli_close($conexao);
?>