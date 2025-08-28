<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


function responder($success, $message, $data = null, $error_details = null) {
    if (!$success && $error_details) {
        error_log("Emprestimo Error: " . print_r($error_details, true));
    }
    
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data
    ];
    
    
    if (!$success && $error_details && $_ENV['APP_ENV'] !== 'production') {
        $response['debug'] = $error_details;
    }
    
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

try {
    require_once 'conexao.php';
    
    if (!isset($conexao) || !$conexao) {
        responder(false, 'Erro na conexão com banco de dados', null, 'Database connection not available');
    }
    $json_input = file_get_contents('php://input');
    if (empty($json_input)) {
        responder(false, 'Dados não fornecidos', null, 'Empty request body');
    }
    
    $input = json_decode($json_input, true);
   
    if (json_last_error() !== JSON_ERROR_NONE) {
        responder(false, 'Dados JSON inválidos: ' . json_last_error_msg(), null, 'JSON decode error');
    }
    
    $camposObrigatorios = ['livro_id', 'usuario_id', 'dias_emprestimo'];
    foreach ($camposObrigatorios as $campo) {
        if (!isset($input[$campo]) || $input[$campo] === '' || $input[$campo] === null) {
            responder(false, "Campo obrigatório não fornecido: $campo", null, [
                'missing_field' => $campo,
                'received_data' => $input
            ]);
        }
    }
    
    $livro_id = intval($input['livro_id']);
    $usuario_id = intval($input['usuario_id']);
    $dias_emprestimo = intval($input['dias_emprestimo']);
    
    if ($livro_id <= 0) {
        responder(false, 'ID do livro inválido', null, ['livro_id' => $input['livro_id']]);
    }
    
    if ($usuario_id <= 0) {
        responder(false, 'ID do usuário inválido', null, ['usuario_id' => $input['usuario_id']]);
    }
    
    if ($dias_emprestimo < 1 || $dias_emprestimo > 30) {
        responder(false, 'Dias de empréstimo deve ser entre 1 e 30 dias');
    }
    
    if (!$conexao->autocommit(false)) {
        responder(false, 'Erro ao iniciar transação', null, $conexao->error);
    }
    
    $stmt = $conexao->prepare("SELECT id, titulo, autor, capa FROM livros WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        responder(false, 'Erro na consulta do livro', null, $conexao->error);
    }
    
    $stmt->bind_param("i", $livro_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao consultar livro', null, $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Livro não encontrado');
    }
    $livro = $result->fetch_assoc();
    $stmt->close();
    
    $stmt = $conexao->prepare("SELECT id, nome, email FROM usuarios WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        responder(false, 'Erro na consulta do usuário', null, $conexao->error);
    }
    
    $stmt->bind_param("i", $usuario_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao consultar usuário', null, $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Usuário não encontrado');
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
        responder(false, 'Erro na consulta de cópias', null, $conexao->error);
    }
    
    $stmt->bind_param("i", $livro_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao consultar cópias disponíveis', null, $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Não há cópias disponíveis para empréstimo');
    }
    $copia = $result->fetch_assoc();
    $stmt->close();
    
    $stmt = $conexao->prepare("
        SELECT e.id 
        FROM emprestimos e
        JOIN copias c ON e.copia_id = c.id
        WHERE c.livro_id = ? AND e.usuario_id = ? AND e.status IN ('ativo', 'atrasado')
    ");
    if (!$stmt) {
        $conexao->rollback();
        responder(false, 'Erro na verificação de empréstimo ativo', null, $conexao->error);
    }
    
    $stmt->bind_param("ii", $livro_id, $usuario_id);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao verificar empréstimo ativo', null, $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $conexao->rollback();
        responder(false, 'Usuário já possui empréstimo ativo deste livro');
    }
    $stmt->close();
    
    $data_emprestimo = date('Y-m-d');
    $data_devolucao_prevista = date('Y-m-d', strtotime("+$dias_emprestimo days"));
    
    $stmt = $conexao->prepare("
        INSERT INTO emprestimos (usuario_id, copia_id, data_emprestimo, data_prevista_devolucao, status)
        VALUES (?, ?, ?, ?, 'ativo')
    ");
    if (!$stmt) {
        $conexao->rollback();
        responder(false, 'Erro ao preparar inserção do empréstimo', null, $conexao->error);
    }
    
    $stmt->bind_param("iiss", $usuario_id, $copia['id'], $data_emprestimo, $data_devolucao_prevista);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao criar empréstimo', null, $stmt->error);
    }
    $emprestimo_id = $conexao->insert_id;
    $stmt->close();
    $stmt = $conexao->prepare("UPDATE copias SET status = 'emprestado' WHERE id = ?");
    if (!$stmt) {
        $conexao->rollback();
        responder(false, 'Erro ao preparar atualização da cópia', null, $conexao->error);
    }
    
    $stmt->bind_param("i", $copia['id']);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao atualizar status da cópia', null, $stmt->error);
    }
    $stmt->close();
    
    $stmt = $conexao->prepare("
        SELECT r.id, r.usuario_id 
        FROM reservas r
        WHERE r.livro_id = ? AND r.status IN ('pendente', 'confirmada') AND r.usuario_id = ?
        ORDER BY r.data_reserva ASC
        LIMIT 1
    ");
    if ($stmt) {
        $stmt->bind_param("ii", $livro_id, $usuario_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $reserva = $result->fetch_assoc();
                $stmt2 = $conexao->prepare("UPDATE reservas SET status = 'atendida' WHERE id = ?");
                if ($stmt2) {
                    $stmt2->bind_param("i", $reserva['id']);
                    $stmt2->execute();
                    $stmt2->close();
                }
            }
        }
        $stmt->close();
    }
    
    if (!$conexao->commit()) {
        $conexao->rollback();
        responder(false, 'Erro ao finalizar empréstimo', null, $conexao->error);
    }
    $dados_emprestimo = [
        'emprestimo_id' => $emprestimo_id,
        'livro' => [
            'id' => $livro['id'],
            'titulo' => $livro['titulo'],
            'autor' => $livro['autor'],
            'capa' => $livro['capa'] ? 
                (strpos($livro['capa'], 'http') === 0 ? $livro['capa'] : 
                    "http://localhost:8000/uploads/" . basename($livro['capa'])) 
                : "https://via.placeholder.com/100x150/667eea/ffffff?text=Livro"
        ],
        'usuario' => [
            'id' => $usuario['id'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email']
        ],
        'copia' => [
            'id' => $copia['id'],
            'codigo' => $copia['codigo_copia']
        ],
        'datas' => [
            'emprestimo' => $data_emprestimo,
            'devolucao_prevista' => $data_devolucao_prevista,
            'dias_emprestimo' => $dias_emprestimo
        ],
        'email_data' => [
            'email' => $usuario['email'],
            'nomeUsuario' => $usuario['nome'],
            'tituloLivro' => $livro['titulo'],
            'autorLivro' => $livro['autor'],
            'dataEmprestimo' => date('d/m/Y', strtotime($data_emprestimo)),
            'dataDevolucao' => date('d/m/Y', strtotime($data_devolucao_prevista)),
            'diasEmprestimo' => $dias_emprestimo,
            'capaLivro' => $livro['capa'] ? 
                (strpos($livro['capa'], 'http') === 0 ? $livro['capa'] : 
                    "http://localhost:8000/uploads/" . basename($livro['capa'])) 
                : "https://via.placeholder.com/100x150/667eea/ffffff?text=Livro"
        ]
    ];
    
    responder(true, 'Empréstimo realizado com sucesso', $dados_emprestimo);
    
} catch (Exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }
    responder(false, 'Erro interno do servidor', null, [
        'exception' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} finally {
    if (isset($conexao)) {
        $conexao->close();
    }
}
?>