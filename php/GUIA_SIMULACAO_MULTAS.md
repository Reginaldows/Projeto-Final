# 🧪 Guia para Simular Atraso em Empréstimos e Testar Multas

## 📋 Visão Geral

Este guia explica como simular atrasos em empréstimos para testar o sistema de multas da biblioteca. O sistema permite alterar as datas de empréstimo para simular situações de atraso sem precisar esperar o tempo real.

## 🛠️ Ferramentas Criadas

### 1. Script PHP de Simulação
**Arquivo:** `simular_atraso_emprestimo.php`

**Funcionalidades:**
- ✅ Listar empréstimos ativos
- ⏰ Simular atraso alterando datas
- 💰 Verificar multas geradas
- 🔄 Resetar empréstimo para estado original

### 2. Interface Web de Teste
**Arquivo:** `testar_multas.html`

**Acesso:** http://localhost/php/testar_multas.html

## 📝 Como Usar

### Passo 1: Acessar a Interface
1. Abra o navegador
2. Acesse: `http://localhost/php/testar_multas.html`
3. A página carregará automaticamente os empréstimos ativos

### Passo 2: Verificar Empréstimos Disponíveis
- A seção "📋 1. Listar Empréstimos Ativos" mostra todos os empréstimos em andamento
- Anote o **ID do empréstimo** que você quer testar
- Verifique se o status está como "ATIVO"

### Passo 3: Simular Atraso
1. Na seção "⏰ 2. Simular Atraso":
   - Digite o **ID do empréstimo**
   - Escolha quantos **dias de atraso** simular (1, 3, 7, 15 ou 30 dias)
   - Clique em "Simular Atraso"

2. **O que acontece:**
   - A data de empréstimo é alterada para o passado
   - A data de devolução prevista também é ajustada
   - O empréstimo fica "em atraso" artificialmente

### Passo 4: Verificar Multas
1. Na seção "💰 3. Verificar Multas":
   - Clique em "Verificar Multas"
   - Veja se alguma multa foi gerada automaticamente

### Passo 5: Testar Sistema de Pagamento
Após simular o atraso, você pode:
1. Acessar o sistema como usuário
2. Ver os empréstimos em atraso
3. Tentar gerar pagamento de multa
4. Testar o fluxo completo do Mercado Pago

### Passo 6: Resetar (Opcional)
1. Na seção "🔄 4. Resetar Empréstimo":
   - Digite o **ID do empréstimo**
   - Clique em "Resetar Empréstimo"
   - Isso restaura as datas originais e remove multas

## 🔧 Uso via Linha de Comando (Alternativo)

Se preferir usar comandos diretos:

```powershell
# Listar empréstimos ativos
Invoke-WebRequest -Uri "http://localhost/php/simular_atraso_emprestimo.php?acao=listar_emprestimos" -Method GET

# Simular 7 dias de atraso no empréstimo ID 61
$body = @{acao='simular_atraso'; emprestimo_id='61'; dias_atraso='7'}
Invoke-WebRequest -Uri 'http://localhost/php/simular_atraso_emprestimo.php' -Method POST -Body $body

# Verificar multas
$body = @{acao='verificar_multas'}
Invoke-WebRequest -Uri 'http://localhost/php/simular_atraso_emprestimo.php' -Method POST -Body $body

# Resetar empréstimo ID 61
$body = @{acao='resetar_emprestimo'; emprestimo_id='61'}
Invoke-WebRequest -Uri 'http://localhost/php/simular_atraso_emprestimo.php' -Method POST -Body $body
```

## 📊 Exemplo Prático

### Cenário: Testar Multa de 7 Dias

1. **Situação Inicial:**
   - Empréstimo ID: 61
   - Data empréstimo: 28/08/2025
   - Data devolução: 11/09/2025
   - Status: ATIVO (sem atraso)

2. **Após Simular 7 Dias de Atraso:**
   - Nova data empréstimo: 07/08/2025
   - Nova data devolução: 22/08/2025
   - Status: ATRASADO (7 dias)
   - Multa esperada: R$ 14,00 (7 dias × R$ 2,00/dia)

3. **Resultado:**
   - Sistema detecta atraso
   - Usuário pode gerar pagamento
   - Multa aparece no sistema

## ⚠️ Observações Importantes

### Cuidados
- ⚠️ **Use apenas em ambiente de desenvolvimento/teste**
- ⚠️ **Não use em produção** - pode afetar dados reais
- ⚠️ **Faça backup** do banco antes de testar

### Limitações
- ✅ Funciona apenas com empréstimos ativos
- ✅ Não afeta empréstimos já devolvidos
- ✅ Multas são calculadas automaticamente pelo sistema

### Dicas
- 💡 Teste com diferentes períodos de atraso
- 💡 Verifique se o cálculo de multa está correto (R$ 2,00/dia)
- 💡 Teste o fluxo completo: atraso → multa → pagamento
- 💡 Use o reset para limpar testes anteriores

## 🔄 Fluxo Completo de Teste

```
1. Listar Empréstimos → Escolher ID
2. Simular Atraso → Definir dias
3. Verificar Multas → Confirmar geração
4. Testar Pagamento → Usar sistema real
5. Resetar → Limpar teste
```

## 🆘 Solução de Problemas

### Erro: "Empréstimo não encontrado"
- ✅ Verifique se o ID existe
- ✅ Confirme se o status é "ativo"
- ✅ Liste empréstimos primeiro

### Erro: "Erro de conexão"
- ✅ Verifique se o XAMPP está rodando
- ✅ Confirme se o arquivo está em `C:\xampp\htdocs\php\`
- ✅ Teste a conexão com o banco

### Multas não aparecem
- ✅ Verifique se o atraso foi realmente simulado
- ✅ Confirme se o sistema de multas está ativo
- ✅ Teste com o usuário correto

---

**✨ Pronto! Agora você pode testar completamente o sistema de multas simulando atrasos de forma controlada.**