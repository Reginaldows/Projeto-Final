<?php 

    $local = 'localhost';
    $user = 'root';
    $senha = '';
    $db = 'usuario';

    $conexao = mysqli_connect($local, $user, $senha, $db);

    if (!$conexao) {
         die("Erro na conexão com o banco de dados: " . mysqli_connect_error());
    } else {
        
    }

?>