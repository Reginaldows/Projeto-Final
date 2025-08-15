<?php
require 'conexao.php';

$token = $_GET['token'] ?? '';
$tokenValido = false;
$usuario = null;

if ($token) {
    try {
        $stmt = $conexao->prepare("
            SELECT d.nome, t.expira 
            FROM tokens t 
            JOIN dados d ON t.dados_id = d.id 
            WHERE t.token = ? AND t.usado = 0 AND t.expira > NOW()
        ");
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $tokenValido = true;
            $usuario = $result->fetch_assoc();
        }
    } catch (Exception $e) {
        error_log("Erro ao verificar token: " . $e->getMessage());
    }
}

if (!$tokenValido) {
    echo "
    <!DOCTYPE html>
    <html lang='pt-br'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Token Inválido</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #d32f2f; }
        </style>
    </head>
    <body>
        <h1 class='error'>Token inválido ou expirado</h1>
        <p>O link de redefinição de senha não é válido ou já expirou.</p>
        <p>Solicite um novo link de redefinição.</p>
    </body>
    </html>
    ";
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <script src="script.js" defer></script>
    <link rel="stylesheet" href="css/style.css">
    <title>Redefinir senha</title>
</head>
<body>
   
    <div class="topo">
    <div class="logo-senai">
      <img src="img/logoSenai.png" alt="Senai" width="200" height="100" />
    </div>
  </div>
    
    <p class="area-senha">
        <strong>Olá <?php echo htmlspecialchars($usuario['nome']); ?>! Crie aqui sua nova senha.</strong>
    </p>
    
    <img src="img/redefinirsenha.png" alt="Recuperar senha" class="redefinir-senha">
    
    <form action="alterarsenha.php" method="POST" class="redefinir" id="form-redefinir">
        <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>" />
        
        <div class="input-senha">
            <label for="senha" class="campos-obrig">Nova Senha</label>
            <input type="password" name="senha" id="senha" placeholder="Digite sua nova senha" maxlength="50" required>
            <i class="fas fa-eye visibilidade" data-input="senha"></i>
        </div>

        <div class="input-senha">
            <label for="confirm-senha" class="campos-obrig">Confirme sua senha</label>
            <input type="password" name="confirm-senha" id="confirm-senha" placeholder="Confirme sua senha" maxlength="50" required>
            <i class="fas fa-eye visibilidade" data-input="confirm-senha"></i>
        </div>

        <div class="verificacao">
            <p>A <b>senha</b> deve conter:</p>
            <ul class="lista">
                <li id="min-caracteres">
                    <i class="fa-solid fa-circle"></i>
                    <span>No mínimo 8 caracteres</span>
                </li>
                <li id="letras">
                    <i class="fa-solid fa-circle"></i>
                    <span>Pelo menos uma letra maiúscula e minúscula</span>
                </li>
                <li id="numero">
                    <i class="fa-solid fa-circle"></i>
                    <span>Pelo menos um número</span>
                </li>
                <li id="especial">
                    <i class="fa-solid fa-circle"></i>
                    <span>Pelo menos um caractere especial</span>
                </li>
            </ul>
        </div>
        
        <button type="submit" id="btn-criar" disabled>Criar nova senha</button>
    </form>
    
    <div id="mensagem" style="display: none; margin-top: 20px; padding: 10px; border-radius: 5px;"></div>
</body>
</html>
