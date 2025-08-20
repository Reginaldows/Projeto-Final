<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'conexao.php';

// Verificar se o ID foi fornecido
if (!isset($_POST['id']) || empty($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do livro não fornecido']);
    exit;
}

$id = $_POST['id'];
$titulo = $_POST['titulo'] ?? '';
$autor = $_POST['autor'] ?? '';
$isbn = $_POST['isbn'] ?? '';
$editora = $_POST['editora'] ?? '';
$ano = $_POST['ano'] ?? '';
$genero = $_POST['genero'] ?? '';
$paginas = $_POST['paginas'] ?? '';
$idioma = $_POST['idioma'] ?? '';
$descricao = $_POST['descricao'] ?? '';
$preco = $_POST['preco'] ?? '';

// Verificar se os campos obrigatórios foram preenchidos
if (empty($titulo) || empty($autor) || empty($isbn) || empty($editora) || empty($ano) || 
    empty($genero) || empty($paginas) || empty($idioma) || $preco === '') {
    echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos']);
    exit;
}

try {
    // Verificar se o livro existe
    $stmt = $conexao->prepare("SELECT id FROM livros WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Livro não encontrado']);
        exit;
    }
    
    $stmt->close();
    
    // Iniciar a consulta SQL de atualização
    $sql = "UPDATE livros SET titulo = ?, autor = ?, isbn = ?, editora = ?, ano = ?, 
            genero = ?, paginas = ?, idioma = ?, descricao = ?, preco = ?";
    $params = [$titulo, $autor, $isbn, $editora, $ano, $genero, $paginas, $idioma, $descricao, $preco];
    $types = "sssssssssd"; // string, string, ..., double (para o preço)
    
    // Verificar se há uma nova imagem de capa
    if (isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK) {
        $target_dir = "uploads/";
        
        // Criar o diretório se não existir
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        // Gerar um nome único para o arquivo
        $file_extension = pathinfo($_FILES["capa"]["name"], PATHINFO_EXTENSION);
        $new_filename = uniqid() . '.' . $file_extension;
        $target_file = $target_dir . $new_filename;
        
        // Verificar o tamanho do arquivo (máximo 5MB)
        if ($_FILES["capa"]["size"] > 5000000) {
            echo json_encode(['success' => false, 'message' => 'O arquivo é muito grande. Tamanho máximo: 5MB']);
            exit;
        }
        
        // Verificar se é uma imagem válida
        $check = getimagesize($_FILES["capa"]["tmp_name"]);
        if ($check === false) {
            echo json_encode(['success' => false, 'message' => 'O arquivo não é uma imagem válida']);
            exit;
        }
        
        // Verificar extensão do arquivo
        if ($file_extension != "jpg" && $file_extension != "png" && $file_extension != "jpeg" && $file_extension != "gif") {
            echo json_encode(['success' => false, 'message' => 'Apenas arquivos JPG, JPEG, PNG e GIF são permitidos']);
            exit;
        }
        
        // Tentar fazer o upload do arquivo
        if (move_uploaded_file($_FILES["capa"]["tmp_name"], $target_file)) {
            // Adicionar a capa à consulta SQL
            $sql .= ", capa = ?";
            $params[] = $target_file;
            $types .= "s";
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao fazer upload da imagem']);
            exit;
        }
    }
    
    // Finalizar a consulta SQL
    $sql .= " WHERE id = ?";
    $params[] = $id;
    $types .= "i";
    
    // Executar a consulta
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->errno === 0) {
        echo json_encode(['success' => true, 'message' => 'Livro atualizado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhuma alteração foi feita']);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar livro: ' . $e->getMessage()]);
}

$conexao->close();
?>