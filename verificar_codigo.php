<?php
$codigo = '3N51NYOV';

echo "=== VERIFICANDO CÓDIGO DE PRÉ-RESERVA: {$codigo} ===\n";

try {
    $conexao = new mysqli('localhost', 'root', '', 'biblioteca_senai');
    
    // Buscar pré-reserva pelo código
    $sql = "SELECT pr.*, u.nome as usuario_nome, l.titulo as livro_titulo 
            FROM pre_reservas pr 
            LEFT JOIN usuarios u ON pr.usuario_id = u.id 
            LEFT JOIN livros l ON pr.livro_id = l.id 
            WHERE pr.codigo_reserva = ?";
    
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('s', $codigo);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {
        $pre_reserva = $resultado->fetch_assoc();
        echo "PRÉ-RESERVA ENCONTRADA:\n";
        echo "ID: " . $pre_reserva['id'] . "\n";
        echo "Código: " . $pre_reserva['codigo_reserva'] . "\n";
        echo "Status: " . $pre_reserva['status'] . "\n";
        echo "Usuário: " . $pre_reserva['usuario_nome'] . "\n";
        echo "Livro: " . $pre_reserva['livro_titulo'] . "\n";
        echo "Data: " . $pre_reserva['data_reserva'] . "\n";
        
        // Verificar se já foi convertida
        if ($pre_reserva['status'] === 'convertida') {
            echo "\n=== VERIFICANDO RESERVA CONVERTIDA ===\n";
            $sql_reserva = "SELECT * FROM reservas WHERE pre_reserva_id = ?";
            $stmt_reserva = $conexao->prepare($sql_reserva);
            $stmt_reserva->bind_param('i', $pre_reserva['id']);
            $stmt_reserva->execute();
            $resultado_reserva = $stmt_reserva->get_result();
            
            if ($resultado_reserva->num_rows > 0) {
                $reserva = $resultado_reserva->fetch_assoc();
                echo "RESERVA ENCONTRADA:\n";
                echo "ID: " . $reserva['id'] . "\n";
                echo "Status: " . $reserva['status'] . "\n";
                echo "Posição na fila: " . $reserva['posicao_fila'] . "\n";
            } else {
                echo "ERRO: Pré-reserva marcada como convertida mas reserva não encontrada!\n";
            }
        }
    } else {
        echo "PRÉ-RESERVA NÃO ENCONTRADA!\n";
        
        // Listar todas as pré-reservas para debug
        echo "\n=== TODAS AS PRÉ-RESERVAS ===\n";
        $sql_todas = "SELECT codigo_reserva, status FROM pre_reservas ORDER BY id DESC LIMIT 10";
        $resultado_todas = $conexao->query($sql_todas);
        
        while ($row = $resultado_todas->fetch_assoc()) {
            echo "Código: " . $row['codigo_reserva'] . " - Status: " . $row['status'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
?>