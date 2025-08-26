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

function responder($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

$input = json_decode(file_get_contents('php://input'), true);
$camposObrigatorios = ['livro_id', 'usuario_id', 'tipo'];
foreach ($camposObrigatorios as $campo) {
    if (!isset($input[$campo]) || empty($input[$campo])) {
        responder(false, "Campo obrigatório não fornecido: $campo");
    }
}

$livro_id = intval($input['livro_id']);
$usuario_id = intval($input['usuario_id']);
$tipo = trim($input['tipo']); // 'reserva' ou 'pre_reserva'

if (!in_array($tipo, ['reserva', 'pre_reserva'])) {
    responder(false, 'Tipo de reserva inválido. Use "reserva" ou "pre_reserva"');
}

try {
    $conexao->autocommit(false);

    // Verificar livro
    $stmt = $conexao->prepare("SELECT id, titulo, autor FROM livros WHERE id = ?");
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Livro não encontrado');
    }
    $livro = $result->fetch_assoc();

    // Verificar usuário
    $stmt = $conexao->prepare("SELECT id, nome, email FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        $conexao->rollback();
        responder(false, 'Usuário não encontrado');
    }
    $usuario = $result->fetch_assoc();

    // Verificar se usuário já possui reserva ativa deste livro
    $stmt = $conexao->prepare("
        SELECT id, tipo 
        FROM reservas 
        WHERE livro_id = ? AND usuario_id = ? AND status = 'ativa'
    ");
    $stmt->bind_param("ii", $livro_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $reserva_existente = $result->fetch_assoc();
        $conexao->rollback();
        responder(false, 'Usuário já possui ' . $reserva_existente['tipo'] . ' ativa para este livro');
    }

    // Verificar se usuário já tem empréstimo ativo deste livro
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

    // Para reserva normal, verificar se há cópias disponíveis
    if ($tipo === 'reserva') {
        $stmt = $conexao->prepare("
            SELECT COUNT(*) as copias_disponiveis 
            FROM copias 
            WHERE livro_id = ? AND status = 'disponivel'
        ");
        $stmt->bind_param("i", $livro_id);
        $stmt->execute();
        $disponibilidade = $stmt->get_result()->fetch_assoc();
        if ($disponibilidade['copias_disponiveis'] > 0) {
            $conexao->rollback();
            responder(false, 'Há cópias disponíveis. Use empréstimo direto ao invés de reserva');
        }
    }

    // Calcular posição na fila
    $stmt = $conexao->prepare("
        SELECT COUNT(*) + 1 as posicao_fila
        FROM reservas
        WHERE livro_id = ? AND status IN ('pendente', 'confirmada')
    ");
    $stmt->bind_param("i", $livro_id);
    $stmt->execute();
    $posicao_fila = $stmt->get_result()->fetch_assoc()['posicao_fila'];

    // Gerar código único para a reserva
    function gerarCodigoReserva() {
        $caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $codigo = '';
        for ($i = 0; $i < 8; $i++) {
            $codigo .= $caracteres[rand(0, strlen($caracteres) - 1)];
        }
        return $codigo;
    }
    
    $codigo_reserva = gerarCodigoReserva();
    
    // Definir timezone de Brasília
    date_default_timezone_set('America/Sao_Paulo');
    
    // Datas
    $data_reserva = date('Y-m-d H:i:s');
    $dias_expiracao = ($tipo === 'pre_reserva') ? 30 : 7;
    $data_expiracao = date('Y-m-d H:i:s', strtotime("+$dias_expiracao days"));

    // Criar reserva
    $stmt = $conexao->prepare("
        INSERT INTO reservas (usuario_id, livro_id, tipo, codigo_reserva, data_reserva, data_expiracao, posicao_fila, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')
    ");
    $stmt->bind_param("iissssi", $usuario_id, $livro_id, $tipo, $codigo_reserva, $data_reserva, $data_expiracao, $posicao_fila);
    if (!$stmt->execute()) {
        $conexao->rollback();
        responder(false, 'Erro ao criar reserva');
    }
    $reserva_id = $conexao->insert_id;

    $conexao->commit();

    // Preparar dados para email
    $dadosEmail = [
        'email' => $usuario['email'],
        'nomeUsuario' => $usuario['nome'],
        'tituloLivro' => $livro['titulo'],
        'autorLivro' => $livro['autor'],
        'dataReserva' => date('d/m/Y H:i', strtotime($data_reserva)),
        'dataExpiracao' => date('d/m/Y H:i', strtotime($data_expiracao)),
        'posicaoFila' => $posicao_fila,
        'tipoReserva' => $tipo,
        'codigoReserva' => $codigo_reserva
    ];

    $dados_reserva = [
        'reserva_id' => $reserva_id,
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
        'reserva' => [
            'tipo' => $tipo,
            'codigo_reserva' => $codigo_reserva,
            'posicao_fila' => $posicao_fila,
            'data_reserva' => $data_reserva,
            'data_expiracao' => $data_expiracao,
            'status' => 'pendente'
        ],
        'email_data' => $dadosEmail
    ];

    $tipo_nome = ($tipo === 'pre_reserva') ? 'Pré-reserva' : 'Reserva';
    responder(true, "$tipo_nome realizada com sucesso", $dados_reserva);

} catch (Exception $e) {
    $conexao->rollback();
    responder(false, 'Erro ao processar reserva: ' . $e->getMessage());
}

$conexao->close();
?>
