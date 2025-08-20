<?php
// Forçar saída JSON e suprimir warnings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

error_reporting(0); // evita notices/warnings
ini_set('display_errors', 0);

require_once 'conexao.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id']) || empty($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID do livro não fornecido']);
        exit;
    }

    $id = (int)$data['id'];

    // Obter caminho da capa
    $stmt = $conexao->prepare("SELECT capa FROM livros WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Livro não encontrado']);
        exit;
    }

    $livro = $result->fetch_assoc();
    $capa_path = $livro['capa'] ?? '';

    $stmt->close();

    // Deletar livro
    $stmt = $conexao->prepare("DELETE FROM livros WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        // Excluir capa se existir
        if (!empty($capa_path) && file_exists($capa_path)) {
            @unlink($capa_path); // @ para suprimir warnings
        }
        echo json_encode(['success' => true, 'message' => 'Livro excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir livro']);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao excluir livro: ' . $e->getMessage()]);
}

$conexao->close();
exit;
?>
