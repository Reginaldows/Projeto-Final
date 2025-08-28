<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'conexao.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do livro não fornecido']);
    exit;
}

$id = $_GET['id'];

try {
    $stmt = $conexao->prepare("SELECT * FROM livros WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $livro = $result->fetch_assoc();
        echo json_encode($livro);
    } else {
        echo json_encode(['success' => false, 'message' => 'Livro não encontrado']);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar livro: ' . $e->getMessage()]);
}

$conexao->close();
?>