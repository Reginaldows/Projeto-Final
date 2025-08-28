<?php
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_log("=== INICIO DEBUG EMPRESTIMO ===");
error_log("Método: " . $_SERVER['REQUEST_METHOD']);
error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'indefinido'));

try {
    $rawInput = file_get_contents('php://input');
    error_log("Input bruto: '" . $rawInput . "'");
    error_log("Tamanho do input: " . strlen($rawInput));
    
    if (empty($rawInput)) {
        error_log("Input vazio!");
        echo json_encode([
            'success' => false, 
            'message' => 'Nenhum dado enviado',
            'debug' => 'Input vazio'
        ]);
        exit;
    }
    
    $data = json_decode($rawInput, true);
    $jsonError = json_last_error();
    
    if ($jsonError !== JSON_ERROR_NONE) {
        error_log("Erro JSON: " . json_last_error_msg());
        error_log("Código do erro: " . $jsonError);
        
        $inputClean = trim($rawInput);
        error_log("Input limpo: '" . $inputClean . "'");
        error_log("Primeiro char: '" . (strlen($inputClean) > 0 ? $inputClean[0] : 'VAZIO') . "'");
        error_log("Último char: '" . (strlen($inputClean) > 0 ? $inputClean[strlen($inputClean)-1] : 'VAZIO') . "'");
        
        echo json_encode([
            'success' => false,
            'message' => 'JSON inválido: ' . json_last_error_msg(),
            'debug' => [
                'raw_input' => $rawInput,
                'input_length' => strlen($rawInput),
                'json_error' => json_last_error_msg(),
                'json_error_code' => $jsonError
            ]
        ]);
        exit;
    }
    
    error_log("JSON decodificado com sucesso: " . print_r($data, true));
    
    if (!is_array($data)) {
        error_log("Dados não são um array");
        echo json_encode([
            'success' => false,
            'message' => 'Formato de dados inválido',
            'debug' => 'Dados não são array'
        ]);
        exit;
    }
    
    if (!isset($data['usuario_id']) || !isset($data['livro_id'])) {
        error_log("Campos obrigatórios ausentes");
        error_log("Keys disponíveis: " . implode(', ', array_keys($data)));
        
        echo json_encode([
            'success' => false,
            'message' => 'usuario_id ou livro_id não enviado',
            'debug' => [
                'received_keys' => array_keys($data),
                'has_usuario_id' => isset($data['usuario_id']),
                'has_livro_id' => isset($data['livro_id']),
                'data' => $data
            ]
        ]);
        exit;
    }
    
    $usuario_id = (int)$data['usuario_id'];
    $livro_id = (int)$data['livro_id'];
    
    error_log("IDs convertidos - usuario_id: $usuario_id, livro_id: $livro_id");
    
    if ($usuario_id <= 0 || $livro_id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'IDs inválidos',
            'debug' => [
                'usuario_id' => $usuario_id,
                'livro_id' => $livro_id
            ]
        ]);
        exit;
    }
    
    if (!file_exists('conexao.php')) {
        echo json_encode([
            'success' => false,
            'message' => 'Arquivo de conexão não encontrado'
        ]);
        exit;
    }
    
    require_once 'conexao.php';
    
    if (!isset($conexao) || !$conexao) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro na conexão com o banco de dados'
        ]);
        exit;
    }
    
    if (!$conexao->autocommit(false)) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao iniciar transação'
        ]);
        exit;
    }

    $stmt = $conexao->prepare("SELECT id, titulo, autor FROM livros WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro na consulta do livro'
        ]);
        exit;
    }

    $stmt->bind_param("i", $livro_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao consultar livro'
        ]);
        exit;
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Livro não encontrado'
        ]);
        exit;
    }
    $livro = $result->fetch_assoc();
    $stmt->close();

    $stmt = $conexao->prepare("SELECT id, nome, email FROM usuarios WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro na consulta do usuário'
        ]);
        exit;
    }

    $stmt->bind_param("i", $usuario_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao consultar usuário'
        ]);
        exit;
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Usuário não encontrado'
        ]);
        exit;
    }
    $usuario = $result->fetch_assoc();
    $stmt->close();

    $stmt = $conexao->prepare("
        SELECT id, codigo_copia 
        FROM copias 
        WHERE livro_id = ? AND status = 'disponivel' 
        LIMIT 1
    ");
    if (!$stmt) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro na consulta de cópias'
        ]);
        exit;
    }

    $stmt->bind_param("i", $livro_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao consultar cópias disponíveis'
        ]);
        exit;
    }

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Não há cópias disponíveis para empréstimo'
        ]);
        exit;
    }
    $copia = $result->fetch_assoc();
    $stmt->close();

    $data_emprestimo = date('Y-m-d');
    $data_devolucao_prevista = date('Y-m-d', strtotime("+14 days"));

    $stmt = $conexao->prepare("
        INSERT INTO emprestimos (usuario_id, copia_id, data_emprestimo, data_prevista_devolucao, status)
        VALUES (?, ?, ?, ?, 'ativo')
    ");
    if (!$stmt) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao preparar inserção do empréstimo'
        ]);
        exit;
    }

    $stmt->bind_param("iiss", $usuario_id, $copia['id'], $data_emprestimo, $data_devolucao_prevista);
    if (!$stmt->execute()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao criar empréstimo'
        ]);
        exit;
    }
    $emprestimo_id = $conexao->insert_id;
    $stmt->close();

    $stmt = $conexao->prepare("UPDATE copias SET status = 'emprestado' WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao preparar atualização da cópia'
        ]);
        exit;
    }

    $stmt->bind_param("i", $copia['id']);
    if (!$stmt->execute()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar status da cópia'
        ]);
        exit;
    }
    $stmt->close();

    if (!$conexao->commit()) {
        $conexao->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao finalizar empréstimo'
        ]);
        exit;
    }

    $emailData = [
        'email' => $usuario['email'],
        'nomeUsuario' => $usuario['nome'],
        'tituloLivro' => $livro['titulo'],
        'autorLivro' => $livro['autor'],
        'dataEmprestimo' => date('d/m/Y', strtotime($data_emprestimo)),
        'dataDevolucao' => date('d/m/Y', strtotime($data_devolucao_prevista)),
        'diasEmprestimo' => 14,
        'capaLivro' => 'https://via.placeholder.com/100x150/667eea/ffffff?text=Livro'
    ];

    $emailJson = json_encode($emailData);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/enviar_email_emprestimo_bibliotecario.php');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $emailJson);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($emailJson)
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $emailResponse = curl_exec($ch);
    $emailHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($emailHttpCode === 200) {
        error_log("Email de empréstimo enviado com sucesso para: " . $usuario['email']);
    } else {
        error_log("Falha ao enviar email de empréstimo para: " . $usuario['email'] . " - Response: " . $emailResponse);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Empréstimo realizado com sucesso!',
        'data' => [
            'emprestimo_id' => $emprestimo_id,
            'livro' => $livro['titulo'],
            'usuario' => $usuario['nome'],
            'data_emprestimo' => date('d/m/Y', strtotime($data_emprestimo)),
            'data_devolucao' => date('d/m/Y', strtotime($data_devolucao_prevista))
        ]
    ]);

    $conexao->close();
    
} catch (Exception $e) {
    error_log("Exceção: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno: ' . $e->getMessage(),
        'debug' => 'Exceção capturada'
    ]);
}

error_log("=== FIM DEBUG EMPRESTIMO ===");
?>