<?php 

    $local = 'localhost';
    $user = 'root';
    $senha = '';
    $db = 'biblioteca_senai';

    $conexao = mysqli_connect($local, $user, $senha, $db);

    if (!$conexao) {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code(500);
        echo json_encode(['erro' => 'Erro na conexão com o banco de dados: ' . mysqli_connect_error()]);
        exit();
    }

?>