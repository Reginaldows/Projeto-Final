import { useEffect, useState } from "react";

export default function Acessibilidade({ leituraAtiva: leituraPai, setLeituraAtiva: setLeituraPai }) {
  const [fonte, setFonte] = useState(16);
  const [leituraAtiva, setLeituraAtiva] = useState(leituraPai ?? false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [contrasteDaltonismo, setContrasteDaltonismo] = useState(0);

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    const conteudo = document.body;
    if (conteudo) {
      const elementos = conteudo.querySelectorAll("[data-leitura], p, label, li, h1, h2, h3, span, button, strong, b, a");
      elementos.forEach(el => {
        el.style.fontSize = `${fonte}px`;
      });
    }
  }, [fonte]);

  useEffect(() => {
    const modoSalvo = sessionStorage.getItem('modoEscuro');
    if (modoSalvo === 'true') {
      setModoEscuro(true);
      aplicarModoEscuro();
    }
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      console.warn("API de fala não suportada.");
      return;
    }

    const elementos = document.querySelectorAll("[data-leitura], p, label, li, h1, h2, h3, span, button, strong, b, a, input[placeholder], textarea[placeholder], img[alt]");

    function falar(texto) {
      if (leituraAtiva && texto.trim() !== "") {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = "pt-BR";
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    }

    elementos.forEach((el) => {
      const texto = el.getAttribute("data-leitura") || el.alt || el.placeholder || el.textContent;
      const handler = () => falar(texto);
      el.addEventListener("mouseenter", handler);
      el._speechHandler = handler;
    });

    return () => {
      elementos.forEach((el) => {
        if (el._speechHandler) {
          el.removeEventListener("mouseenter", el._speechHandler);
          delete el._speechHandler;
        }
      });
    };
  }, [leituraAtiva]);

  function aplicarModoEscuro() {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
  }

  function removerModoEscuro() {
    document.documentElement.classList.remove("dark-mode");
    document.body.classList.remove("dark-mode");
  }

  function toggleModoEscuro() {
    const novoModo = !modoEscuro;
    setModoEscuro(novoModo);

    if (novoModo) {
      aplicarModoEscuro();
      sessionStorage.setItem('modoEscuro', 'true');
    } else {
      removerModoEscuro();
      sessionStorage.setItem('modoEscuro', 'false');
    }
  }

  function toggleContrasteDaltonismo() {
    const novoValor = (contrasteDaltonismo + 1) % 3;
    setContrasteDaltonismo(novoValor);
    document.body.classList.remove('contraste-rosa', 'contraste-verde');

    if (novoValor === 1) {
      document.body.classList.add('contraste-rosa');
    } else if (novoValor === 2) {
      document.body.classList.add('contraste-verde');
    }
  }

  const aumentarFonte = () => {
    const limite = isMobile() ? 20 : 24;
    setFonte((prev) => Math.min(prev + 2, limite));
  };

  const diminuirFonte = () => {
    setFonte((prev) => Math.max(prev - 2, 10));
  };

  const abrirMenu = () => setMenuAberto(true);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <div>
      {!menuAberto && (
        <button
          className="icone-acessibilidade"
          onClick={abrirMenu}
          aria-label="Abrir menu de acessibilidade"
          data-leitura="Abrir menu de acessibilidade"
          title="Abrir menu de acessibilidade"
        >
          <img src="img/acessibilidade.png" alt="Acessibilidade" />
        </button>
      )}

      <aside className={`menu-lateral ${menuAberto ? "ativo" : ""}`}>
        <button
          className="fechar-menu"
          onClick={fecharMenu}
          aria-label="Fechar menu de acessibilidade"
          data-leitura="Fechar menu de acessibilidade"
          title="Fechar menu de acessibilidade"
        >
          ×
        </button>

        <h2 data-leitura="Menu de acessibilidade">Acessibilidade</h2>

        <div className="modo-escuro">
          <button
            onClick={toggleModoEscuro}
            aria-label={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className={`btn-modo-escuro ${modoEscuro ? 'ativo' : ''}`}
            data-leitura="Alternar modo escuro"
            
          >
            <div className="icone">
              <img src="img/imagenoite.png" alt="escuro" />
            </div>
            <span>{modoEscuro ? "Modo Claro" : "Modo Escuro"}</span>
          </button>
        </div>

        <div className="controles-fonte">
          <p data-leitura="Tamanho da fonte">Tamanho da Fonte</p>
          <div className="botoes-fonte">
            <button
              onClick={aumentarFonte}
              className="btn-fonte btn-aumentar"
              aria-label="Aumentar fonte"
              data-leitura="Aumentar fonte"
              title="Aumentar fonte"
            >
              A+
            </button>
            <button
              onClick={diminuirFonte}
              className="btn-fonte btn-diminuir"
              aria-label="Diminuir fonte"
              data-leitura="Diminuir fonte"
              title="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={toggleContrasteDaltonismo}
              aria-label="Alternar contraste para daltonismo"
              className={`btn-fonte btn-contraste ${contrasteDaltonismo === 1 ? 'rosa' : contrasteDaltonismo === 2 ? 'verde' : ''}`}
              data-leitura="Alternar contraste"
              title="Alterar contraste"
            >
              A
            </button>
          </div>
          <p className="tamanho-atual">Tamanho atual: {fonte}px</p>
        </div>

        <div className="leitura-voz">
          <button
            onClick={() => {
              const novoEstado = !leituraAtiva;
              setLeituraAtiva(novoEstado);
              if (setLeituraPai) setLeituraPai(novoEstado);
            }}
            aria-label="Alternar leitura em voz alta"
            className={`btn-leitura ${leituraAtiva ? 'ativo' : ''}`}
            data-leitura={leituraAtiva ? "Desativar leitura em voz alta" : "Ativar leitura em voz alta"}
          >
            <div className="icone">🔊</div>
            <span>{leituraAtiva ? "Desativar Leitura" : "Ativar Leitura"}</span>
          </button>

          {leituraAtiva && (
            <p className="instrucao-leitura" data-leitura="Passe o mouse sobre os elementos para ouvi-los">
              Passe o mouse sobre os elementos para ouvi-los
            </p>
          )}
        </div>
      </aside>

      {menuAberto && (
        <div className="overlay-menu ativo" onClick={fecharMenu} />
      )}
    </div>
  );
}
