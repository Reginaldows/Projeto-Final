<?php
require_once 'conexao.php';

try {
    echo "Criando tabela de pagamentos de multa...\n";
    
    $sql_pagamentos = "
        CREATE TABLE IF NOT EXISTS pagamentos_multa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            emprestimo_id INT NOT NULL,
            usuario_id INT NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            preference_id VARCHAR(255) NOT NULL,
            payment_id VARCHAR(255) NULL,
            payment_method_id VARCHAR(100) NULL,
            transaction_amount DECIMAL(10,2) NULL,
            status ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            
            INDEX idx_emprestimo_id (emprestimo_id),
            INDEX idx_usuario_id (usuario_id),
            INDEX idx_preference_id (preference_id),
            INDEX idx_payment_id (payment_id),
            INDEX idx_status (status)
        )
    ";
    
    $pdo->exec($sql_pagamentos);
    echo "✓ Tabela pagamentos_multa criada com sucesso!\n";
    
    echo "Adicionando colunas de multa na tabela emprestimos...\n";
    
    try {
        $pdo->exec("ALTER TABLE emprestimos ADD COLUMN multa_paga BOOLEAN DEFAULT FALSE");
        echo "✓ Coluna multa_paga adicionada!\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "- Coluna multa_paga já existe\n";
        } else {
            throw $e;
        }
    }
    
    try {
        $pdo->exec("ALTER TABLE emprestimos ADD COLUMN multa_valor DECIMAL(10,2) NULL");
        echo "✓ Coluna multa_valor adicionada!\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "- Coluna multa_valor já existe\n";
        } else {
            throw $e;
        }
    }
    
    try {
        $pdo->exec("ALTER TABLE emprestimos ADD COLUMN multa_data_pagamento TIMESTAMP NULL");
        echo "✓ Coluna multa_data_pagamento adicionada!\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "- Coluna multa_data_pagamento já existe\n";
        } else {
            throw $e;
        }
    }
    
    echo "Criando índices...\n";
    
    try {
        $pdo->exec("ALTER TABLE emprestimos ADD INDEX idx_multa_paga (multa_paga)");
        echo "✓ Índice idx_multa_paga criado!\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "- Índice idx_multa_paga já existe\n";
        } else {
            throw $e;
        }
    }
    
    try {
        $pdo->exec("ALTER TABLE emprestimos ADD INDEX idx_multa_data_pagamento (multa_data_pagamento)");
        echo "✓ Índice idx_multa_data_pagamento criado!\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "- Índice idx_multa_data_pagamento já existe\n";
        } else {
            throw $e;
        }
    }
    
    echo "\n🎉 Setup do banco de dados concluído com sucesso!\n";
    echo "\nEstrutura da tabela pagamentos_multa:\n";
    
    $stmt = $pdo->query("DESCRIBE pagamentos_multa");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Erro ao configurar banco de dados: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Erro geral: " . $e->getMessage() . "\n";
    exit(1);
}

?>