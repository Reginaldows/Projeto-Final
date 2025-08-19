<?php
require 'conexao.php'; // ou include 'conexao.php'

// Verifica se o formulário foi enviado
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $titulo     = $_POST['titulo'];
    $autor      = $_POST['autor'];
    $ano        = $_POST['ano'];
    $editora    = $_POST['editora'];
    $isbn       = $_POST['isbn'];
    $categoria  = $_POST['categoria'];
    $preco      = $_POST['preco'];
    $descricao  = $_POST['descricao'];

    // Upload da capa do livro
    if (isset($_FILES['capa']) && $_FILES['capa']['error'] === 0) {
        $caminhoDestino = "uploads/" . basename($_FILES["capa"]["name"]);
        move_uploaded_file($_FILES["capa"]["tmp_name"], $caminhoDestino);
    } else {
        $caminhoDestino = null;
    }

    $sql = "INSERT INTO livros (titulo, autor, ano, editora, isbn, categoria, preco, descricao, capa) 
            VALUES ('$titulo', '$autor', '$ano', '$editora', '$isbn', '$categoria', '$preco', '$descricao', '$caminhoDestino')";

    if (mysqli_query($conexao, $sql)) {
        echo "Livro cadastrado com sucesso!";
    } else {
        echo "Erro: " . mysqli_error($conexao);
    }
}
?>
