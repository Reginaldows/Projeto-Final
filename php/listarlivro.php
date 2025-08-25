<?php
ini_set('display_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require 'conexao.php';

    // Seleciona livros e calcula disponibilidade real considerando empréstimos
    $sql = "SELECT l.id, l.titulo, l.autor, l.ano, l.editora, l.genero, l.isbn, l.paginas, 
                   l.descricao, l.capa, l.cdd, l.localizacao,
                   COUNT(DISTINCT c.id) AS total_copias,
                   COUNT(DISTINCT CASE WHEN c.status = 'disponivel' THEN c.id END) AS copias_disponiveis_status,
                   COUNT(DISTINCT CASE WHEN c.status = 'emprestado' THEN c.id END) AS copias_emprestadas_status,
                   COUNT(DISTINCT CASE WHEN c.status = 'manutencao' THEN c.id END) AS copias_manutencao,
                   COUNT(DISTINCT CASE WHEN c.status = 'perdido' THEN c.id END) AS copias_perdidas,
                   COALESCE(emp_count.emprestimos_ativos, 0) AS emprestimos_ativos
            FROM livros l
            LEFT JOIN copias c ON l.id = c.livro_id
            LEFT JOIN (
                SELECT c2.livro_id, COUNT(e.id) AS emprestimos_ativos
                FROM copias c2
                JOIN emprestimos e ON c2.id = e.copia_id AND e.status = 'ativo'
                GROUP BY c2.livro_id
            ) emp_count ON l.id = emp_count.livro_id
            GROUP BY l.id, l.titulo, l.autor, l.ano, l.editora, l.genero, l.isbn, l.paginas, 
                     l.descricao, l.capa, l.cdd, l.localizacao, emp_count.emprestimos_ativos
            ORDER BY l.id DESC";

    $result = $conexao->query($sql);

    $livros = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $row['categoria'] = $row['genero'];
            $row['descricao'] = $row['descricao'] ?: "Nenhuma descrição disponível para este livro.";
            $row['capa'] = $row['capa'] ? "/php/uploads/" . basename($row['capa']) : "/public/img/Biblioteca.png";

            $total_copias = intval($row['total_copias']);
            $copias_emprestadas = intval($row['emprestimos_ativos']);
            $copias_manutencao = intval($row['copias_manutencao']);
            $copias_perdidas = intval($row['copias_perdidas']);
            $copias_disponiveis = $total_copias - $copias_emprestadas - $copias_manutencao - $copias_perdidas;

            // Informações de disponibilidade calculadas dinamicamente
            $row['disponibilidade'] = [
                'total_copias' => $total_copias,
                'copias_cadastradas' => $total_copias,
                'copias_disponiveis' => max(0, $copias_disponiveis),
                'copias_emprestadas' => $copias_emprestadas,
                'copias_manutencao' => $copias_manutencao,
                'copias_perdidas' => $copias_perdidas,
                'disponivel_emprestimo' => $copias_disponiveis > 0,
                'disponivel_reserva' => $copias_disponiveis <= 0 && $total_copias > 0
            ];

            $livros[] = $row;
        }
    }

    echo json_encode($livros);
    $conexao->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno do servidor', 'detalhes' => $e->getMessage()]);
}
?>
