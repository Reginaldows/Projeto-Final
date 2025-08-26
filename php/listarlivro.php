<?php
header("Access-Control-Allow-Origin: http://localhost:5174");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'conexao.php';

// Seleciona livros com informações de disponibilidade
$sql = "SELECT 
    l.id, l.titulo, l.autor, l.ano, l.editora, l.genero, l.isbn, l.paginas, 
    l.descricao, l.capa, l.cdd, l.localizacao,
    COUNT(c.id) AS total_copias,
    COUNT(CASE WHEN c.status = 'disponivel' THEN 1 END) AS copias_disponiveis_status,
    COUNT(CASE WHEN c.status = 'emprestado' THEN 1 END) AS copias_emprestadas_status,
    COUNT(CASE WHEN c.status = 'manutencao' THEN 1 END) AS copias_manutencao,
    COUNT(CASE WHEN c.status = 'perdido' THEN 1 END) AS copias_perdidas,
    COALESCE(emp_count.emprestimos_ativos, 0) AS emprestimos_ativos
FROM livros l
LEFT JOIN copias c ON l.id = c.livro_id
LEFT JOIN (
    SELECT 
        c.livro_id,
        COUNT(*) AS emprestimos_ativos
    FROM emprestimos e
    JOIN copias c ON e.copia_id = c.id
    WHERE e.status = 'ativo'
    GROUP BY c.livro_id
) emp_count ON l.id = emp_count.livro_id
GROUP BY l.id
ORDER BY l.id DESC";

$result = $conexao->query($sql);

$livros = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Categoria para front-end
        $row['categoria'] = $row['genero'];

        // Descrição padrão caso esteja vazia
        $row['descricao'] = $row['descricao'] ? $row['descricao'] : "Nenhuma descrição disponível para este livro.";

        // Capa do livro ou imagem padrão
        $row['capa'] = $row['capa'] 
            ? "/php/uploads/" . basename($row['capa']) 
            : "/public/img/Biblioteca.png";

        // Calcula disponibilidade real
        $total_copias = (int)$row['total_copias'];
        $copias_emprestadas = (int)$row['emprestimos_ativos'];
        $copias_manutencao = (int)$row['copias_manutencao'];
        $copias_perdidas = (int)$row['copias_perdidas'];
        $copias_disponiveis = $total_copias - $copias_emprestadas - $copias_manutencao - $copias_perdidas;
        
        // Informações de disponibilidade
        $row['disponibilidade'] = [
            'total_copias' => $total_copias,
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

// Retorna JSON
echo json_encode($livros);

$conexao->close();
?>
