<?php
require_once 'php/conexao.php';

// Verificar se há livros
echo "=== VERIFICANDO LIVROS ===\n";
$sql = "SELECT COUNT(*) as total FROM livros";
$result = $conexao->query($sql);
$row = $result->fetch_assoc();
echo "Total de livros: " . $row['total'] . "\n\n";

if ($row['total'] > 0) {
    $sql = "SELECT id, titulo FROM livros LIMIT 3";
    $result = $conexao->query($sql);
    echo "Primeiros livros:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " - Título: " . $row['titulo'] . "\n";
    }
}

// Verificar se há usuários
echo "\n=== VERIFICANDO USUÁRIOS ===\n";
$sql = "SELECT COUNT(*) as total FROM usuarios";
$result = $conexao->query($sql);
$row = $result->fetch_assoc();
echo "Total de usuários: " . $row['total'] . "\n\n";

if ($row['total'] > 0) {
    $sql = "SELECT id, nome FROM usuarios LIMIT 3";
    $result = $conexao->query($sql);
    echo "Primeiros usuários:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " - Nome: " . $row['nome'] . "\n";
    }
}

// Verificar pré-reservas existentes
echo "\n=== VERIFICANDO PRÉ-RESERVAS ===\n";
$sql = "SELECT COUNT(*) as total FROM pre_reservas";
$result = $conexao->query($sql);
$row = $result->fetch_assoc();
echo "Total de pré-reservas: " . $row['total'] . "\n\n";

if ($row['total'] > 0) {
    $sql = "SELECT id, codigo_reserva, status FROM pre_reservas LIMIT 3";
    $result = $conexao->query($sql);
    echo "Pré-reservas existentes:\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " - Código: " . $row['codigo_reserva'] . " - Status: " . $row['status'] . "\n";
    }
}

$conexao->close();
?>