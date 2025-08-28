<?php
require_once 'php/conexao.php';

// Verificar estrutura da tabela reservas
$sql = "DESCRIBE reservas";
$result = $conexao->query($sql);

echo "Estrutura da tabela reservas:\n";
while ($row = $result->fetch_assoc()) {
    echo "Campo: " . $row['Field'] . " | Tipo: " . $row['Type'] . " | Null: " . $row['Null'] . " | Key: " . $row['Key'] . " | Default: " . $row['Default'] . " | Extra: " . $row['Extra'] . "\n";
}

echo "\n\nVerificar se pre_reserva_id existe:\n";
$sql_check = "SHOW COLUMNS FROM reservas LIKE 'pre_reserva_id'";
$result_check = $conexao->query($sql_check);

if ($result_check->num_rows > 0) {
    echo "Coluna pre_reserva_id EXISTE na tabela reservas\n";
} else {
    echo "Coluna pre_reserva_id NÃO EXISTE na tabela reservas\n";
    echo "\nCriando coluna pre_reserva_id...\n";
    
    $sql_alter = "ALTER TABLE reservas ADD COLUMN pre_reserva_id INT NULL AFTER usuario_id";
    if ($conexao->query($sql_alter)) {
        echo "Coluna pre_reserva_id criada com sucesso!\n";
        
        // Adicionar foreign key
        $sql_fk = "ALTER TABLE reservas ADD FOREIGN KEY (pre_reserva_id) REFERENCES pre_reservas(id)";
        if ($conexao->query($sql_fk)) {
            echo "Foreign key adicionada com sucesso!\n";
        } else {
            echo "Erro ao adicionar foreign key: " . $conexao->error . "\n";
        }
    } else {
        echo "Erro ao criar coluna: " . $conexao->error . "\n";
    }
}

$conexao->close();
?>