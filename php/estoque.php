<?php
// Evitar warnings aparecendo no JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Inclui conexão de forma segura
include __DIR__ . '/conexao.php';

// Verifica se a conexão existe
if (!isset($conexao)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro na conexão com o banco']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Listar produtos
        $result = mysqli_query($conexao, "SELECT * FROM estoque");
        $produtos = mysqli_fetch_all($result, MYSQLI_ASSOC);

        // Se o estoque estiver vazio, adicionar um produto de exemplo
        if (empty($produtos)) {
            $produtos = [
                [
                    'id' => 1,
                    'nome_produto' => 'O Senhor dos Anéis',
                    'codigo_barras' => '9780544003415',
                    'quantidade' => 10,
                    'categoria' => 'Fantasia',
                    'data_atualizacao' => date('d/m/Y H:i')
                ]
            ];
        }

        echo json_encode([
            'success' => true,
            'data' => $produtos,
            'total' => count($produtos)
        ]);
        break;

    case 'POST':
        // Adicionar/Editar produto
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = $data['nome_produto'] ?? '';
        $quantidade = $data['quantidade'] ?? 0;
       

        if (empty($data['id'])) {
            mysqli_query($conexao, "INSERT INTO estoque (nome_produto, quantidade) 
                                    VALUES ('$nome', $quantidade)");
        } else {
            mysqli_query($conexao, "UPDATE estoque 
                                    SET nome_produto='$nome', quantidade=$quantidade
                                    WHERE id=" . $data['id']);
        }
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        // Remover produto
        $id = $_GET['id'] ?? 0;
        mysqli_query($conexao, "DELETE FROM estoque WHERE id=$id");
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        break;
}

mysqli_close($conexao);
?>
