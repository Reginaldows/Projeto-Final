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

document.addEventListener('DOMContentLoaded', () => {
  const botaoTema = document.getElementById('darkmode');
  if (botaoTema) {
    botaoTema.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  const iconeMenu = document.getElementById('iconeMenu');
  const menuLateral = document.getElementById('menuLateral');
  const fecharMenu = document.getElementById('fecharMenu');

  if (iconeMenu && menuLateral) {
    iconeMenu.addEventListener('click', () => {
      menuLateral.classList.add('ativo');
    });
  }

  if (fecharMenu && menuLateral) {
    fecharMenu.addEventListener('click', () => {
      menuLateral.classList.remove('ativo');
    });
  }

  let tamanhoFonteAtual = 16;

  window.alterarFonte = function (delta) {
    tamanhoFonteAtual += delta;
    if (tamanhoFonteAtual < 10) tamanhoFonteAtual = 10;
    if (tamanhoFonteAtual > 20) tamanhoFonteAtual = 20;
    document.body.style.fontSize = tamanhoFonteAtual + "px";
  };

  window.resetarFonte = function () {
    tamanhoFonteAtual = 16;
    document.body.style.fontSize = tamanhoFonteAtual + "px";
  };

  window.toggleControles = function () {
    const controles = document.getElementById("mnr-fonte");
    if (!controles) return;
    if (controles.style.display === "none" || controles.style.display === "") {
      controles.style.display = "block";
    } else {
      controles.style.display = "none";
    }
  };

  if (!("speechSynthesis" in window)) {
    console.warn("API de fala não suportada neste navegador.");
    return;
  }

  let leituraAtiva = false;

  const botaoLeitura = document.getElementById("toggleLeitura");
  if (botaoLeitura) {
    botaoLeitura.addEventListener("click", () => {
      leituraAtiva = !leituraAtiva;
      botaoLeitura.innerHTML = leituraAtiva
        ? '<img src="img/som.png" class="search-nav" alt="Leitura ativa" /> Desativar leitura'
        : '<img src="img/som.png" class="search-nav" alt="Leitura desativada" /> Ler texto';
    });
  }

  function falar(texto) {
    if (leituraAtiva && texto.trim() !== "") {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = "pt-BR";
      window.speechSynthesis.speak(utterance);
    }
  }

  const elementosFrase = document.querySelectorAll("p, label, li, h1, h2, h3, span, button");

  elementosFrase.forEach(el => {
    el.addEventListener("mouseenter", () => {
      falar(el.textContent);
    });
  });

  document.querySelectorAll("img[alt]").forEach(img => {
    img.addEventListener("mouseenter", () => {
      falar(img.alt);
    });
  });

  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(input => {
    input.addEventListener("mouseenter", () => {
      falar(input.placeholder);
    });
  });
});

export function buscarEnderecoPorCEP(cep, setRua, setBairro, setCidade) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return;

  fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    .then(response => response.json())
    .then(data => {
      if (!data.erro) {
        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
      } else {
        setRua('');
        setBairro('');
        setCidade('');
      }
    })
    .catch(() => {
      setRua('');
      setBairro('');
      setCidade('');
    });
}

export function formatarTelefone(valor) {
  let tel = valor.replace(/\D/g, '');

  if (tel.length > 11) tel = tel.slice(0, 11);

  if (tel.length <= 10) {
    tel = tel.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else {
    tel = tel.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
  }

  return tel;
}