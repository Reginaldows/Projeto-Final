<?php
$token = $_GET['token'] ?? '';
if (!$token) {
    die("Token inválido ou ausente.");
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <script src="script.js" defer></script>
    <link rel="stylesheet" href="style.css">
    <title>Redefinir senha</title>
</head>
<body>
    <div class="topo">
    <div class="logo-senai">
      <img src="img/logoSenai.png" alt="Senai" width="200" height="100" />
    </div>
  </div>
  <p class="area-senha"><strong>Crie aqui sua nova senha e volte a aproveitar todos os recursos.</strong></p>
  <img src="img/redefinirsenha.png" alt="Recuperar senha" class="redefinir-senha">
   
  <form action="alterarsenha.php" method="POST" class="redefinir">
   <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>" />
  <div class="input-senha">
  <label for="senha" class="campos-obrig">Senha</label>
  <input type="password" name="senha" id="senha" placeholder="Digite sua nova senha" maxlength="14" required>
  <i class="fas fa-eye visibilidade" data-input="senha"></i>
  </div>

  <div class="input-senha">
  <label for="confirm-senha" class="campos-obrig">Confirme sua senha</label>
  <input type="password" name="confirm-senha" id="confirm-senha" placeholder="Confirme sua senha" required>
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
    
</body>
</html>