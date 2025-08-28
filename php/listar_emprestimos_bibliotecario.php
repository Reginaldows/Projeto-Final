<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'conexao.php';

function responder($success, $message, $emprestimos = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'emprestimos' => $emprestimos
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método não permitido');
}

$input = json_decode(file_get_contents('php://input'), true);

$filtro = isset($input['filtro']) ? trim($input['filtro']) : '';
$tipo_filtro = isset($input['tipo_filtro']) ? $input['tipo_filtro'] : 'cpf';

try {
    $sql = "
        SELECT 
            e.id,
            e.usuario_id,
            e.copia_id,
            e.data_emprestimo,
            e.data_prevista_devolucao,
            e.status,
            u.nome as usuario_nome,
            u.email as usuario_email,
            u.cpf as usuario_cpf,
            l.id as livro_id,
            l.titulo,
            l.autor,
            l.isbn,
            l.capa,
            c.codigo_copia
        FROM emprestimos e
        JOIN usuarios u ON e.usuario_id = u.id
        JOIN copias c ON e.copia_id = c.id
        JOIN livros l ON c.livro_id = l.id
        WHERE e.status IN ('ativo', 'atrasado')
    ";
    
    $params = [];
    $types = '';
    
    if (!empty($filtro)) {
        switch ($tipo_filtro) {
            case 'cpf':
                $sql .= " AND u.cpf LIKE ?";
                $params[] = "%{$filtro}%";
                $types .= 's';
                break;
                
            case 'usuario':
                $sql .= " AND u.nome LIKE ?";
                $params[] = "%{$filtro}%";
                $types .= 's';
                break;
                
            case 'livro':
                $sql .= " AND (l.titulo LIKE ? OR l.autor LIKE ? OR l.isbn LIKE ?)";
                $params[] = "%{$filtro}%";
                $params[] = "%{$filtro}%";
                $params[] = "%{$filtro}%";
                $types .= 'sss';
                break;
        }
    }
    
    $sql .= " ORDER BY e.data_emprestimo ASC";
    
    $stmt = $conexao->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $emprestimos = [];
    
    while ($row = $result->fetch_assoc()) {
        $hoje = new DateTime();
        $data_prevista = new DateTime($row['data_prevista_devolucao']);
        $diff = $hoje->diff($data_prevista);
        
        $status_calculado = 'normal';
        $dias_diferenca = 0;
        
        if ($hoje > $data_prevista) {
            $status_calculado = 'atrasado';
            $dias_diferenca = $diff->days;
        } elseif ($diff->days <= 3) {
            $status_calculado = 'vencendo';
            $dias_diferenca = $diff->days;
        }
        
        $multa = 0;
        if ($status_calculado === 'atrasado') {
            $multa = $dias_diferenca * 2.00;
        }
        
        $capa_url = '';
        if (!empty($row['capa'])) {
            if (strpos($row['capa'], 'http') === 0) {
                $capa_url = $row['capa'];
            } else {
                $capa_url = '/php/uploads/' . $row['capa'];
            }
        }
        
        $emprestimos[] = [
            'id' => (int)$row['id'],
            'usuario_id' => (int)$row['usuario_id'],
            'usuario_nome' => $row['usuario_nome'],
            'usuario_email' => $row['usuario_email'],
            'usuario_cpf' => $row['usuario_cpf'],
            'livro_id' => (int)$row['livro_id'],
            'titulo' => $row['titulo'],
            'autor' => $row['autor'],
            'isbn' => $row['isbn'],
            'capa_url' => $capa_url,
            'codigo_copia' => $row['codigo_copia'],
            'data_emprestimo' => $row['data_emprestimo'],
            'data_prevista_devolucao' => $row['data_prevista_devolucao'],
            'status' => $row['status'],
            'status_calculado' => $status_calculado,
            'dias_diferenca' => $dias_diferenca,
            'multa' => $multa
        ];
    }
    
    $total_emprestimos = count($emprestimos);
    $message = '';
    
    if (!empty($filtro)) {
        $tipo_busca = [
            'cpf' => 'CPF',
            'usuario' => 'usuário',
            'livro' => 'livro'
        ];
        
        $message = "Encontrados {$total_emprestimos} empréstimos para {$tipo_busca[$tipo_filtro]}: '{$filtro}'";
    } else {
        $message = "Total de {$total_emprestimos} empréstimos em aberto";
    }
    
    responder(true, $message, $emprestimos);
    
} catch (Exception $e) {
    responder(false, 'Erro ao buscar empréstimos: ' . $e->getMessage());
}

$conexao->close();
?>