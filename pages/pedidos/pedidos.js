const modalRecibo = document.querySelector('#recibo-pedido');
const impressora = modalRecibo.querySelector('.impressora');
const papelRecibo = modalRecibo.querySelector('.papel-recibo');
const estadoImpressora = modalRecibo.querySelector('[data-printer-status]');
const botaoImprimir = modalRecibo.querySelector('[data-action="print-receipt"]');
const avisoPedidos = document.querySelector('[data-order-status]');
const chaveCarrinho = 'nogueira-coffe-cart';
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
let botaoOrigem;
let temporizadorImpressao;
let cliqueComecouFora = false;

// A borda serrilhada acompanha a largura do papel, inclusive no celular.
const dentesRecibo = Array.from({ length: 80 }, function (_, indice) {
    const posicao = 100 - ((indice + 1) * 100 / 80);
    return `${posicao}% ${indice % 2 === 0 ? '100%' : 'calc(100% - 5px)'}`;
});
papelRecibo.style.setProperty('--dentes-recibo', dentesRecibo.join(', '));

function formatarPreco(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function lerPedido(elemento) {
    return {
        id: elemento.dataset.orderId,
        data: elemento.querySelector('[data-order-date]').textContent.trim(),
        itens: Array.from(elemento.querySelectorAll('.item-pedido'), function (item) {
            return {
                id: item.dataset.productId,
                nome: item.querySelector('[data-product-name]').textContent.trim(),
                preco: Math.round(Number(item.querySelector('[data-product-price]').value) * 100),
                quantidade: Number(item.dataset.quantity),
            };
        }),
    };
}

function concluirImpressao() {
    clearTimeout(temporizadorImpressao);
    impressora.dataset.stage = 'complete';
    papelRecibo.setAttribute('aria-hidden', 'false');
    estadoImpressora.textContent = 'Seu recibo está pronto';
    botaoImprimir.disabled = false;
}

function imprimirRecibo() {
    clearTimeout(temporizadorImpressao);
    impressora.dataset.stage = 'processing';
    papelRecibo.setAttribute('aria-hidden', 'true');
    estadoImpressora.textContent = 'Preparando seu recibo';
    botaoImprimir.disabled = true;

    if (movimentoReduzido.matches) {
        concluirImpressao();
        return;
    }

    temporizadorImpressao = setTimeout(function () {
        impressora.dataset.stage = 'printing';
        estadoImpressora.textContent = 'Imprimindo seu recibo';
        // Garante a conclusão também se a animação for interrompida pelo navegador.
        temporizadorImpressao = setTimeout(concluirImpressao, 1900);
    }, 350);
}

function abrirRecibo(pedido, botao) {
    botaoOrigem = botao;
    modalRecibo.querySelectorAll('[data-receipt-id]').forEach(function (elemento) {
        elemento.textContent = `#${pedido.id}`;
    });
    modalRecibo.querySelector('[data-receipt-date]').textContent = pedido.data;
    const total = pedido.itens.reduce(function (soma, item) {
        return soma + item.preco * item.quantidade;
    }, 0);
    modalRecibo.querySelectorAll('[data-receipt-total]').forEach(function (elemento) {
        elemento.textContent = formatarPreco(total);
    });
    const lista = modalRecibo.querySelector('[data-receipt-items]');
    lista.replaceChildren();
    pedido.itens.forEach(function (item) {
        const linha = document.createElement('li');
        const nome = document.createElement('span');
        const preco = document.createElement('span');
        nome.textContent = `${item.quantidade}× ${item.nome}`;
        preco.textContent = formatarPreco(item.preco * item.quantidade);
        linha.append(nome, preco);
        lista.append(linha);
    });
    modalRecibo.showModal();
    modalRecibo.scrollTop = 0;
    imprimirRecibo();
}

function pedirDeNovo(pedido, botao) {
    try {
        const carrinho = new Map();
        let itensSalvos;
        try {
            itensSalvos = JSON.parse(localStorage.getItem(chaveCarrinho) || '[]');
        } catch (erro) {
            if (!(erro instanceof SyntaxError)) throw erro;
            itensSalvos = [];
        }
        if (Array.isArray(itensSalvos)) {
            itensSalvos.forEach(function (item) {
                if (!Array.isArray(item)) return;
                const [id, quantidade] = item;
                if (typeof id === 'string' && Number.isInteger(quantidade) && quantidade > 0) {
                    carrinho.set(id, Math.min(quantidade, 99));
                }
            });
        }
        pedido.itens.forEach(function (item) {
            carrinho.set(item.id, Math.min((carrinho.get(item.id) || 0) + item.quantidade, 99));
        });
        localStorage.setItem(chaveCarrinho, JSON.stringify(Array.from(carrinho)));
        botao.disabled = true;
        window.location.assign('../principal/principal.html?carrinho=aberto');
    } catch {
        avisoPedidos.textContent = 'Não foi possível adicionar os itens ao carrinho. Permita o armazenamento neste navegador e tente novamente.';
    }
}

document.querySelector('.lista-pedidos').addEventListener('click', function (evento) {
    const botao = evento.target.closest('button[data-action]');
    if (!botao) return;
    const pedido = lerPedido(botao.closest('.pedido'));
    if (botao.dataset.action === 'receipt') abrirRecibo(pedido, botao);
    if (botao.dataset.action === 'reorder') pedirDeNovo(pedido, botao);
});

modalRecibo.addEventListener('click', function (evento) {
    const acao = evento.target.closest('button')?.dataset.action;
    if (acao === 'close-receipt') modalRecibo.close();
    if (acao === 'replay-receipt') imprimirRecibo();
    if (acao === 'print-receipt') window.print();
    if (cliqueComecouFora && clicouFora(evento)) modalRecibo.close();
    cliqueComecouFora = false;
});

function clicouFora(evento) {
    const area = modalRecibo.getBoundingClientRect();
    return evento.target === modalRecibo && (
        evento.clientX < area.left || evento.clientX > area.right
        || evento.clientY < area.top || evento.clientY > area.bottom
    );
}

modalRecibo.addEventListener('pointerdown', function (evento) {
    cliqueComecouFora = clicouFora(evento);
});
modalRecibo.addEventListener('close', function () {
    clearTimeout(temporizadorImpressao);
    impressora.dataset.stage = 'processing';
    botaoOrigem?.focus({ preventScroll: true });
});
papelRecibo.addEventListener('animationend', function (evento) {
    if (evento.animationName === 'imprimir-papel') concluirImpressao();
});
movimentoReduzido.addEventListener('change', function () {
    if (movimentoReduzido.matches && modalRecibo.open) concluirImpressao();
});
window.addEventListener('pageshow', function () {
    document.querySelectorAll('[data-action="reorder"]').forEach(function (botao) {
        botao.disabled = false;
    });
});
