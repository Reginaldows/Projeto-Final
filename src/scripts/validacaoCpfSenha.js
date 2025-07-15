export function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf.charAt(10));
}

export function validarRequisitosSenha(senha) {
  const tem8 = senha.length >= 8;
  const temMaiMin = /[a-z]/.test(senha) && /[A-Z]/.test(senha);
  const temNumero = /\d/.test(senha);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

  return {
    min: tem8,
    letras: temMaiMin,
    numero: temNumero,
    especial: temEspecial,
    valido: tem8 && temMaiMin && temNumero && temEspecial,
  };
}

export function formatarCEP(valor) {
  valor = valor.replace(/\D/g, '');
  valor = valor.substring(0, 8);
  if (valor.length > 5) {
    valor = valor.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
  }
  return valor;
}

export async function buscarEnderecoPorCEP(cep, setRua, setBairro, setCidade, setEstado) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!response.ok) throw new Error('CEP não encontrado');

    const data = await response.json();
    if (data.erro) throw new Error('CEP inválido');

    setRua(data.logradouro || '');
    setBairro(data.bairro || '');
    setCidade(data.localidade || '');
    setEstado(data.uf || '');
  } catch (error) {
    console.error('Erro ao buscar CEP:', error.message);
    setRua('');
    setBairro('');
    setCidade('');
    setEstado('');
  }
}

export function formatarTelefone(valor) {
  valor = valor.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.substring(0, 11);

  if (valor.length <= 10) {
    valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  return valor.trim().replace(/-$/, '');
}
