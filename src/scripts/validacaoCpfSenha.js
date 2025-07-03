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
