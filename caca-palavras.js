const PALAVRAS = [
    { termo: 'CPU', dica: 'Executa instruções e coordena operações de processamento de dados.' },
    { termo: 'ULA', dica: 'Realiza operações aritméticas e comparações lógicas.' },
    { termo: 'UC', dica: 'Coordena a execução de instruções e controla os componentes do processador.' },
    { termo: 'REGISTRADORES', dica: 'Armazenam temporariamente dados e instruções dentro do processador, com alta velocidade de acesso.' },
    { termo: 'RAM', dica: 'Armazena dados e programas em uso, mas perde seu conteúdo quando desligada.' },
    { termo: 'ROM', dica: 'Armazena instruções essenciais ao funcionamento, preservando seu conteúdo sem energia.' },
    { termo: 'EEPROM', dica: 'Permite apagar e regravar dados eletricamente, mantendo-os mesmo sem energia.' },
    { termo: 'FLASH', dica: 'Memória não volátil que grava e apaga dados em blocos, comum em SSDs e pendrives.' },
    { termo: 'CACHE', dica: 'Guarda dados frequentemente acessados para reduzir o tempo de espera do processador.' },
    { termo: 'MEMORIADEMASSA', dica: 'Armazena arquivos e programas permanentemente, mesmo após o desligamento.' },
    { termo: 'DMA', dica: 'Permite transferências de dados entre dispositivos e memória sem intervenção constante do processador.' },
    { termo: 'ADDRESSBUS', dica: 'Transporta informações que indicam a localização de dados ou instruções na memória.' }
];

const TAMANHO_GRADE = 15;
const TEMPO_TOTAL = 300;
const QUANTIDADE_LAYOUTS = 5;
const CHAVE_HISTORICO = 'cacaPalavrasHistorico';
const DIRECOES = [
    [0, 1], [1, 0], [1, 1], [1, -1]
];

function criarAleatorio(semente) {
    let estado = semente >>> 0;
    return function () {
        estado = (estado + 0x6D2B79F5) | 0;
        let valor = Math.imul(estado ^ (estado >>> 15), 1 | estado);
        valor = (valor + Math.imul(valor ^ (valor >>> 7), 61 | valor)) ^ valor;
        return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
    };
}

function embaralhar(lista, aleatorio) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(aleatorio() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

function montarGrade(aleatorio) {
    const grade = Array.from({ length: TAMANHO_GRADE }, () => Array(TAMANHO_GRADE).fill(''));
    const posicoes = new Map();
    const termos = embaralhar(PALAVRAS.map(palavra => palavra.termo), aleatorio);

    for (const termo of termos) {
        let colocada = false;

        for (const [linhaDir, colunaDir] of embaralhar([...DIRECOES], aleatorio)) {
            const linhaMin = linhaDir < 0 ? termo.length - 1 : 0;
            const linhaMax = linhaDir > 0 ? TAMANHO_GRADE - termo.length : TAMANHO_GRADE - 1;
            const colunaMin = colunaDir < 0 ? termo.length - 1 : 0;
            const colunaMax = colunaDir > 0 ? TAMANHO_GRADE - termo.length : TAMANHO_GRADE - 1;

            for (let tentativa = 0; tentativa < 60 && !colocada; tentativa++) {
                const linha = linhaMin + Math.floor(aleatorio() * (linhaMax - linhaMin + 1));
                const coluna = colunaMin + Math.floor(aleatorio() * (colunaMax - colunaMin + 1));
                let cabe = true;

                for (let i = 0; i < termo.length; i++) {
                    const atual = grade[linha + linhaDir * i][coluna + colunaDir * i];
                    if (atual !== '' && atual !== termo[i]) {
                        cabe = false;
                        break;
                    }
                }

                if (!cabe) continue;

                const celulas = [];
                for (let i = 0; i < termo.length; i++) {
                    const linhaPalavra = linha + linhaDir * i;
                    const colunaPalavra = coluna + colunaDir * i;
                    grade[linhaPalavra][colunaPalavra] = termo[i];
                    celulas.push({ linha: linhaPalavra, coluna: colunaPalavra });
                }
                posicoes.set(termo, celulas);
                colocada = true;
            }

            if (colocada) break;
        }

        if (!colocada) return null;
    }

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let linha = 0; linha < TAMANHO_GRADE; linha++) {
        for (let coluna = 0; coluna < TAMANHO_GRADE; coluna++) {
            if (grade[linha][coluna] === '') {
                grade[linha][coluna] = letras[Math.floor(aleatorio() * letras.length)];
            }
        }
    }

    return { grade, posicoes };
}

function criarLayout(semente) {
    const aleatorio = criarAleatorio(semente);
    for (let tentativa = 0; tentativa < 100; tentativa++) {
        const layout = montarGrade(aleatorio);
        if (layout) return layout;
    }
    throw new Error('Não foi possível gerar o caça-palavras.');
}

const LAYOUTS = Array.from(
    { length: QUANTIDADE_LAYOUTS },
    (_, indice) => criarLayout(20261122 + indice * 7919)
);

const areaDicas = document.getElementById('dicas');
const areaGrade = document.getElementById('tabuleiro');
const painel = document.getElementById('painel');

painel.innerHTML = `
    <div class="painel-conteudo">
        <div>
            <span class="painel-titulo">TEMPO RESTANTE</span>
            <span class="tempo" id="tempo">05:00</span>
            <button class="botao" id="iniciar">Iniciar</button>
            <p class="status" id="status">Pressione Iniciar para começar.</p>
        </div>
        <div>
            <span class="painel-titulo">ACERTOS</span>
            <span class="acertos" id="acertos">0 / 12</span>
            <div class="barra"><div class="barra-preenchida" id="barra"></div></div>
        </div>
        <div class="historico-bloco">
            <span class="painel-titulo">ÚLTIMAS PARTIDAS</span>
            <ol class="historico" id="historico"></ol>
        </div>
    </div>`;

const modal = document.createElement('div');
modal.className = 'modal oculto';
modal.innerHTML = `
    <div class="modal-caixa" role="dialog" aria-modal="true">
        <h2 id="modal-titulo"></h2>
        <p id="modal-texto"></p>
        <button class="botao" id="tente-novamente">Tente novamente</button>
        <button class="botao botao-secundario" id="ver-tabuleiro">Ver tabuleiro</button>
    </div>`;
document.body.appendChild(modal);

const tempoEl = document.getElementById('tempo');
const acertosEl = document.getElementById('acertos');
const barraEl = document.getElementById('barra');
const statusEl = document.getElementById('status');
const historicoEl = document.getElementById('historico');
const iniciarBtn = document.getElementById('iniciar');
const modalTitulo = document.getElementById('modal-titulo');
const modalTexto = document.getElementById('modal-texto');
const novamenteBtn = document.getElementById('tente-novamente');
const verTabuleiroBtn = document.getElementById('ver-tabuleiro');

let gradeAtual = LAYOUTS[0];
let celulasEl = [];
let indiceLayout = -1;
let tempoRestante = TEMPO_TOTAL;
let timerId = null;
let jogoAtivo = false;
let acertos = 0;
let encontradas = new Set();
let selecionando = false;
let inicioSelecao = null;
let celulasSelecionadas = [];

function formatarTempo(segundos) {
    const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
    const segundosRestantes = String(segundos % 60).padStart(2, '0');
    return `${minutos}:${segundosRestantes}`;
}

function carregarHistorico() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_HISTORICO) || '[]');
        return Array.isArray(dados) ? dados.slice(0, 5) : [];
    } catch (erro) {
        return [];
    }
}

function renderizarHistorico(historico = carregarHistorico()) {
    historicoEl.innerHTML = historico.length
        ? historico.map((partida, indice) => `
            <li>
                <span class="posicao">${indice + 1}º</span>
                <span>${partida.acertos}/12 · ${formatarTempo(partida.tempoUsado)}${partida.vitoria ? ' · completo' : ''}</span>
            </li>`).join('')
        : '<li class="vazio">Nenhuma partida ainda.</li>';
}

function salvarHistorico(partida) {
    const historico = [partida, ...carregarHistorico()].slice(0, 5);
    try {
        localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    } catch (erro) {
        historicoEl.dataset.temporario = 'true';
    }
    renderizarHistorico(historico);
}

function renderizarDicas() {
    areaDicas.innerHTML = `
        <h3>Dicas</h3>
        <ol class="lista-dicas">
            ${PALAVRAS.map((palavra, indice) => `
                <li class="dica" data-termo="${palavra.termo}">
                    <span class="numero">${indice + 1}</span>
                    <span class="texto-dica">${palavra.dica}</span>
                </li>`).join('')}
        </ol>`;
}

function renderizarGrade() {
    const fragmento = document.createDocumentFragment();
    celulasEl = [];

    gradeAtual.grade.forEach((linha, indiceLinha) => {
        const linhaDeCelulas = [];
        linha.forEach((letra, indiceColuna) => {
            const celula = document.createElement('div');
            celula.className = 'celula';
            celula.dataset.linha = indiceLinha;
            celula.dataset.coluna = indiceColuna;
            celula.textContent = letra;
            linhaDeCelulas.push(celula);
            fragmento.appendChild(celula);
        });
        celulasEl.push(linhaDeCelulas);
    });

    areaGrade.replaceChildren(fragmento);
}

function atualizarTimer() {
    tempoEl.textContent = formatarTempo(tempoRestante);
}

function atualizarProgresso() {
    acertosEl.textContent = `${acertos} / ${PALAVRAS.length}`;
    barraEl.style.width = `${(acertos / PALAVRAS.length) * 100}%`;
}

function destacarNaoEncontradas() {
    PALAVRAS.filter(palavra => !encontradas.has(palavra.termo)).forEach(palavra => {
        gradeAtual.posicoes.get(palavra.termo)?.forEach(posicao => {
            celulasEl[posicao.linha]?.[posicao.coluna]?.classList.add('nao-encontrada');
        });
    });
}

function limparSelecao() {
    celulasSelecionadas.forEach(celula => celula.classList.remove('selecionada'));
    celulasSelecionadas = [];
}

function celulasEntre(inicio, fim) {
    const passoLinha = Math.sign(fim.linha - inicio.linha);
    const passoColuna = Math.sign(fim.coluna - inicio.coluna);
    const passos = Math.max(Math.abs(fim.linha - inicio.linha), Math.abs(fim.coluna - inicio.coluna));
    const celulas = [];

    for (let i = 0; i <= passos; i++) {
        const celula = celulasEl[inicio.linha + passoLinha * i]?.[inicio.coluna + passoColuna * i];
        if (celula) celulas.push(celula);
    }

    return celulas;
}

function atualizarSelecao(fim) {
    limparSelecao();
    celulasSelecionadas = celulasEntre(inicioSelecao, fim);
    celulasSelecionadas.forEach(celula => celula.classList.add('selecionada'));
}

function verificarSelecao() {
    if (celulasSelecionadas.length === 0) return;

    const texto = celulasSelecionadas.map(celula => celula.textContent).join('');
    const invertido = texto.split('').reverse().join('');
    const palavra = PALAVRAS.find(item =>
        !encontradas.has(item.termo) && (item.termo === texto || item.termo === invertido)
    );

    if (palavra) {
        const selecionadas = [...celulasSelecionadas];
        selecionadas.forEach(celula => celula.classList.add('encontrada'));
        encontradas.add(palavra.termo);
        acertos++;
        areaDicas.querySelector(`[data-termo="${palavra.termo}"]`)?.classList.add('achada');
        statusEl.textContent = `Correto: ${palavra.termo}!`;
        atualizarProgresso();
        limparSelecao();

        if (acertos === PALAVRAS.length) finalizar(true);
        return;
    }

    const erradas = [...celulasSelecionadas];
    erradas.forEach(celula => celula.classList.add('errada'));
    statusEl.textContent = 'Sequência incorreta. Tente novamente!';
    setTimeout(() => erradas.forEach(celula => celula.classList.remove('errada')), 400);
    limparSelecao();
}

function finalizar(vitoria) {
    if (!jogoAtivo) return;

    clearInterval(timerId);
    jogoAtivo = false;
    selecionando = false;
    limparSelecao();
    destacarNaoEncontradas();
    iniciarBtn.disabled = false;

    const tempoUsado = TEMPO_TOTAL - tempoRestante;
    salvarHistorico({ acertos, tempoUsado, vitoria });

    modalTitulo.textContent = vitoria ? 'Parabéns!' : 'Tempo esgotado!';
    modalTexto.textContent = vitoria
        ? `Você encontrou todas as ${PALAVRAS.length} palavras em ${formatarTempo(tempoUsado)}.`
        : `Você acertou ${acertos} de ${PALAVRAS.length} palavras no tempo. As palavras não encontradas estão marcadas em amarelo no tabuleiro.`;
    modal.classList.remove('oculto');
    statusEl.textContent = vitoria ? 'Todas as palavras encontradas!' : 'Palavras não encontradas marcadas em amarelo.';
}

function iniciarJogo() {
    clearInterval(timerId);
    indiceLayout = (indiceLayout + 1) % LAYOUTS.length;
    gradeAtual = LAYOUTS[indiceLayout];
    tempoRestante = TEMPO_TOTAL;
    acertos = 0;
    encontradas = new Set();
    selecionando = false;
    celulasSelecionadas = [];
    jogoAtivo = true;

    modal.classList.add('oculto');
    iniciarBtn.disabled = true;
    renderizarDicas();
    renderizarGrade();
    atualizarTimer();
    atualizarProgresso();
    statusEl.textContent = 'Arraste o cursor sobre as letras para formar uma palavra.';

    timerId = setInterval(() => {
        tempoRestante--;
        atualizarTimer();
        if (tempoRestante <= 0) finalizar(false);
    }, 1000);
}

areaGrade.addEventListener('pointerdown', evento => {
    if (!jogoAtivo) return;

    const celula = evento.target.closest('.celula');
    if (!celula) return;

    evento.preventDefault();
    selecionando = true;
    inicioSelecao = {
        linha: Number(celula.dataset.linha),
        coluna: Number(celula.dataset.coluna)
    };
    atualizarSelecao(inicioSelecao);
});

window.addEventListener('pointermove', evento => {
    if (!selecionando) return;

    const elemento = document.elementFromPoint(evento.clientX, evento.clientY);
    const celula = elemento?.closest('.celula');
    if (!celula) return;

    atualizarSelecao({
        linha: Number(celula.dataset.linha),
        coluna: Number(celula.dataset.coluna)
    });
});

function encerrarArraste() {
    if (!selecionando) return;
    selecionando = false;
    verificarSelecao();
}

window.addEventListener('pointerup', encerrarArraste);
window.addEventListener('pointercancel', encerrarArraste);
window.addEventListener('blur', encerrarArraste);

iniciarBtn.addEventListener('click', iniciarJogo);
novamenteBtn.addEventListener('click', iniciarJogo);
verTabuleiroBtn.addEventListener('click', () => modal.classList.add('oculto'));

renderizarDicas();
renderizarGrade();
renderizarHistorico();
atualizarTimer();
atualizarProgresso();
