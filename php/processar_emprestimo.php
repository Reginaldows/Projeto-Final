<?php
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Função para responder em JSON
function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obrigatórios
$camposObrigatorios = ['livro_id', 'usuario_id', 'dias_emprestimo'];
foreach ($camposObrigatorios as $campo) {
    if (!isset($input[$campo]) || empty($input[$campo])) {
        responder(false, "Campo obrigatório não fornecido: $campo");
    }
}

$livro_id = intval($input['livro_id']);
$usuario_id = intval($input['usuario_id']);
$dias_emprestimo = intval($input['dias_emprestimo']);

// Validar dias de empréstimo (entre 1 e 30 dias)
if ($dias_emprestimo < 1 || $dias_emprestimo > 30) {
    responder(false, 'Dias de empréstimo deve ser entre 1 e 30 dias');
}

try {
    // Iniciar transação
    $conexao->autocommit(false);

    // Verificar se o livro existe
    $stmt = $conexao->prepare("SELECT id, titulo, autor FROM livros WHERE id = ?");
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Livro não encontrado');
    }
    $livro = $result->fetch_assoc();

    // Verificar se o usuário existe
    $stmt = $conexao->prepare("SELECT id, nome, email FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Usuário não encontrado');
    }
    $usuario = $result->fetch_assoc();

    // Verificar se há cópia disponível
    $stmt = $conexao->prepare("
        SELECT id, codigo_copia 
        FROM copias 
        WHERE livro_id = ? AND status = 'disponivel' 
        LIMIT 1
    ");
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Não há cópias disponíveis para empréstimo');
    }
    $copia = $result->fetch_assoc();

    // Verificar se o usuário já tem empréstimo ativo deste livro
    $stmt = $conexao->prepare("
        SELECT e.id 
        FROM emprestimos e
        JOIN copias c ON e.copia_id = c.id
        WHERE c.livro_id = ? AND e.usuario_id = ? AND e.status IN ('ativo', 'atrasado')
    ");
    $stmt->bind_param("ii", $livro_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $conexao->rollback();
        responder(false, 'Usuário já possui empréstimo ativo deste livro');
    }

    // Calcular datas
    $data_emprestimo = date('Y-m-d');
    $data_devolucao_prevista = date('Y-m-d', strtotime("+$dias_emprestimo days"));

    // Criar empréstimo
    $stmt = $conexao->prepare("
        INSERT INTO emprestimos (usuario_id, copia_id, data_emprestimo, data_prevista_devolucao, status)
        VALUES (?, ?, ?, ?, 'ativo')
    ");
    $stmt->bind_param("iiss", $usuario_id, $copia['id'], $data_emprestimo, $data_devolucao_prevista);

    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao criar empréstimo');
    }
    $emprestimo_id = $conexao->insert_id;

    // Atualizar status da cópia para emprestado
    $stmt = $conexao->prepare("UPDATE copias SET status = 'emprestado' WHERE id = ?");
    $stmt->bind_param("i", $copia['id']);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao atualizar status da cópia');
    }

    // Verificar se há reservas ativas e atualizar a primeira para 'atendida'
    $stmt = $conexao->prepare("
        SELECT r.id, r.usuario_id 
        FROM reservas r
        WHERE r.livro_id = ? AND r.status IN ('pendente', 'confirmada') AND r.usuario_id = ?
        ORDER BY r.data_reserva ASC
        LIMIT 1
    ");
    $stmt->bind_param("ii", $livro_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $reserva = $result->fetch_assoc();
        $stmt = $conexao->prepare("UPDATE reservas SET status = 'atendida' WHERE id = ?");
        $stmt->bind_param("i", $reserva['id']);
        $stmt->execute();
    }

    // Confirmar transação
    $conexao->commit();

    $dados_emprestimo = [
        'emprestimo_id' => $emprestimo_id,
        'livro' => [
            'id' => $livro['id'],
            'titulo' => $livro['titulo'],
            'autor' => $livro['autor']
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
    ];

    responder(true, 'Empréstimo realizado com sucesso', $dados_emprestimo);

} catch (Exception $e) {
    $conexao->rollback();
    responder(false, 'Erro ao processar empréstimo: ' . $e->getMessage());
}

$conexao->close();
?>
