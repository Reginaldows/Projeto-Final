export function iniciarScript() {
  const senhaInput = document.querySelector("#senha");
  const btnCriar = document.querySelector("#btn-criar");
  const reqMin = document.querySelector("#min-caracteres");
  const reqLetra = document.querySelector("#letras");
  const reqNumero = document.querySelector("#numero");
  const reqEspecial = document.querySelector("#especial");

  if (senhaInput && btnCriar && reqMin && reqLetra && reqNumero && reqEspecial) {
    senhaInput.addEventListener("input", () => {
      const senha = senhaInput.value;

      const tem8 = senha.length >= 8;
      const temMaiMin = /[a-z]/.test(senha) && /[A-Z]/.test(senha);
      const temNumero = /\d/.test(senha);
      const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

      atualizarStatus(reqMin, tem8);
      atualizarStatus(reqLetra, temMaiMin);
      atualizarStatus(reqNumero, temNumero);
      atualizarStatus(reqEspecial, temEspecial);

      btnCriar.disabled = !(tem8 && temMaiMin && temNumero && temEspecial);
    });
  }

  function atualizarStatus(elemento, valido) {
    if (valido) {
      elemento.classList.add("validado");
    } else {
      elemento.classList.remove("validado");
    }
  }

  const cpfInput = document.getElementById("cpf");
  const msg = document.getElementById("cpf-erro");

  if (cpfInput && msg) {
    cpfInput.addEventListener("input", () => {
      let cpf = cpfInput.value.replace(/\D/g, "");

      if (cpf.length > 3 && cpf.length <= 6) {
        cpf = cpf.replace(/(\d{3})(\d+)/, "$1.$2");
      } else if (cpf.length > 6 && cpf.length <= 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
      } else if (cpf.length > 9) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
      }

      cpfInput.value = cpf;
      const cpfcorr = cpf.replace(/\D/g, "");
      if (cpfcorr.length === 11) {
        if (validaCPF(cpfcorr)) {
          msg.textContent = "";
          cpfInput.classList.remove("invalido");
          cpfInput.classList.add("valido");
        } else {
          msg.textContent = "CPF inválido.";
          cpfInput.classList.remove("valido");
          cpfInput.classList.add("invalido");
        }
      } else {
        msg.textContent = "";
        cpfInput.classList.remove("valido", "invalido");
      }
    });
  }

  function validaCPF(cpf) {
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += +cpf[i] * (10 - i);
    let dig1 = (soma * 10) % 11;
    if (dig1 === 10) dig1 = 0;
    if (dig1 !== +cpf[9]) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += +cpf[i] * (11 - i);
    let dig2 = (soma * 10) % 11;
    if (dig2 === 10) dig2 = 0;

    return dig2 === +cpf[10];
  }

  const formRecuperar = document.getElementById('formRecuperar');
  if (formRecuperar) {
    formRecuperar.addEventListener('submit', function(e) {
      e.preventDefault();
      enviarFormulario();
    });
  }

  function enviarFormulario() {
    const formData = new FormData(document.getElementById('formRecuperar'));
    mostrarMensagem('📧 Enviando e-mail, aguarde...', 'carregando');

    fetch('enviar.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text().then(text => ({
      status: response.status,
      text: text
    })))
    .then(result => {
      if (result.status === 200) {
        mostrarMensagem(result.text, 'sucesso');
      } else {
        mostrarMensagem(result.text, 'erro');
      }
    })
    .catch(error => {
      mostrarMensagem('Erro de conexão: ' + error.message, 'erro');
    });
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById('mensagem');

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.style.display = 'block';
    mensagem.style.position = 'fixed';
    mensagem.style.top = '20px';
    mensagem.style.left = '50%';
    mensagem.style.transform = 'translateX(-50%)';
    mensagem.style.zIndex = '9999';
    mensagem.style.maxWidth = '90%';
    mensagem.style.width = 'auto';
    mensagem.style.textAlign = 'center';

    if (tipo === 'sucesso') {
      mensagem.style.color = '#155724';
      mensagem.style.backgroundColor = '#d4edda';
      mensagem.style.border = '2px solid #c3e6cb';
      setTimeout(() => {
        mensagem.style.display = 'none';
      }, 5000);
    } else if (tipo === 'carregando') {
      mensagem.style.color = '#004085';
      mensagem.style.backgroundColor = '#cce7ff';
      mensagem.style.border = '2px solid #7bb3ff';
    } else {
      mensagem.style.color = '#721c24';
      mensagem.style.backgroundColor = '#f8d7da';
      mensagem.style.border = '2px solid #f5c6cb';
      setTimeout(() => {
        mensagem.style.display = 'none';
      }, 8000);
    }

    mensagem.style.padding = '15px 25px';
    mensagem.style.borderRadius = '8px';
    mensagem.style.fontWeight = 'bold';
    mensagem.style.fontSize = '16px';
    mensagem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  }
}

export function formatarCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +cpf[i] * (10 - i);
  let dig1 = (soma * 10) % 11;
  if (dig1 === 10) dig1 = 0;
  if (dig1 !== +cpf[9]) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += +cpf[i] * (11 - i);
  let dig2 = (soma * 10) % 11;
  if (dig2 === 10) dig2 = 0;

  return dig2 === +cpf[10];
}

