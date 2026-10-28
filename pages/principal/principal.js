const painelCarrinho = document.querySelector('#painel-carrinho');
const painelProduto = document.querySelector('#detalhes-produto');
const painelEndereco = document.querySelector('#painel-endereco');
const formularioEndereco = document.querySelector('#formulario-endereco');
const avisoEndereco = document.querySelector('.aviso-endereco');
const listaCarrinho = document.querySelector('[data-cart-items]');
const totalCarrinho = document.querySelector('[data-cart-total]');
const contadorCarrinho = document.querySelector('[data-cart-count]');
const avisoCarrinho = document.querySelector('[data-cart-status]');
const botaoCarrinho = document.querySelector('.botao-carrinho');
const chaveCarrinho = 'nogueira-coffe-cart';
const chaveEndereco = 'nogueira-coffe-address';
const produtos = {};
const carrinho = {};
let botaoOrigem;
let posicaoPagina;

document.querySelectorAll('.produto').forEach(function (card) {
    const id = card.dataset.productId;
    produtos[id] = {
        nome: card.querySelector('[data-product-name]').textContent.trim(),
        preco: Math.round(Number(card.querySelector('[data-product-price]').value) * 100),
        imagem: card.querySelector('.imagem-produto').getAttribute('src'),
        descricao: card.querySelector('[data-product-description]')?.textContent.trim()
            || produtos[id]?.descricao || '',
    };
});

function mostrarPreco(elemento, centavos) {
    elemento.value = (centavos / 100).toFixed(2);
    elemento.textContent = (centavos / 100).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL',
    });
}

function abrirPainel(painel, botao) {
    const painelAtual = document.querySelector('dialog[open]');
    if (painelAtual === painel) return;

    if (painelAtual) {
        painelAtual.close();
    } else {
        botaoOrigem = botao;
        posicaoPagina = { left: window.scrollX, top: window.scrollY, behavior: 'instant' };
    }

    if (painel === painelEndereco) {
        formularioEndereco.reset();
        avisoEndereco.textContent = '';
    }
    painel.showModal();
    window.scrollTo(posicaoPagina);
}

function clicouFora(evento, painel) {
    const area = painel.getBoundingClientRect();
    return evento.target === painel && (
        evento.clientX < area.left || evento.clientX > area.right
        || evento.clientY < area.top || evento.clientY > area.bottom
    );
}

document.querySelectorAll('dialog').forEach(function (painel) {
    let cliqueComecouFora = false;

    painel.addEventListener('pointerdown', function (evento) {
        cliqueComecouFora = clicouFora(evento, painel);
    });
    painel.addEventListener('click', function (evento) {
        if (cliqueComecouFora && clicouFora(evento, painel)) painel.close();
        cliqueComecouFora = false;
    });
    painel.addEventListener('close', function () {
        if (document.querySelector('dialog[open]')) return;
        botaoOrigem?.focus({ preventScroll: true });
        window.scrollTo(posicaoPagina);
    });
});

function mostrarProduto(id, botao) {
    const produto = produtos[id];
    painelProduto.querySelector('[data-dialog-name]').textContent = produto.nome;
    painelProduto.querySelector('[data-dialog-description]').textContent = produto.descricao;
    mostrarPreco(painelProduto.querySelector('[data-dialog-price]'), produto.preco);
    const imagem = painelProduto.querySelector('[data-dialog-image]');
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    painelProduto.querySelector('[data-dialog-add]').dataset.productId = id;
    abrirPainel(painelProduto, botao);
}

function mostrarEndereco(endereco) {
    document.querySelector('[data-address-street]').textContent = endereco.rua;
    document.querySelector('[data-address-city]').textContent = endereco.cidade;
    for (const campo of ['rua', 'cidade']) {
        const input = formularioEndereco.elements[campo];
        input.value = input.defaultValue = endereco[campo];
    }
}

formularioEndereco.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const rua = formularioEndereco.elements.rua;
    const cidade = formularioEndereco.elements.cidade;
    rua.value = rua.value.trim();
    cidade.value = cidade.value.trim();
    if (!formularioEndereco.reportValidity()) return;

    const endereco = { rua: rua.value, cidade: cidade.value };
    try {
        sessionStorage.setItem(chaveEndereco, JSON.stringify(endereco));
        mostrarEndereco(endereco);
        painelEndereco.close();
    } catch {
        avisoEndereco.textContent = 'Não foi possível salvar o endereço. Permita o armazenamento neste navegador e tente novamente.';
    }
});

try {
    const endereco = JSON.parse(sessionStorage.getItem(chaveEndereco));
    if (typeof endereco?.rua === 'string' && typeof endereco?.cidade === 'string'
        && endereco.rua.trim() && endereco.cidade.trim()) {
        mostrarEndereco(endereco);
    }
} catch {
    // Sem um endereço válido nesta aba, as áreas de endereço continuam vazias.
}

function criarItemCarrinho(id, quantidade) {
    const produto = produtos[id];
    const item = document.createElement('article');
    item.className = 'item-carrinho';
    item.dataset.cartProductId = id;
    item.innerHTML = `
        <img class="imagem-item" alt="">
        <div class="informacoes-item">
            <h3 class="nome-item"></h3>
            <data class="preco-item"></data>
            <div class="controle-quantidade" role="group">
                <button type="button" data-action="decrease-quantity">−</button>
                <output aria-label="Quantidade"></output>
                <button type="button" data-action="increase-quantity">+</button>
            </div>
        </div>
        <button class="botao-icone remover-item" type="button" data-action="remove-from-cart">×</button>`;

    item.querySelector('img').src = produto.imagem;
    item.querySelector('h3').textContent = produto.nome;
    mostrarPreco(item.querySelector('data'), produto.preco);
    item.querySelector('output').value = quantidade;
    item.querySelector('[role="group"]').setAttribute('aria-label', `Quantidade de ${produto.nome}`);
    const diminuir = item.querySelector('[data-action="decrease-quantity"]');
    const aumentar = item.querySelector('[data-action="increase-quantity"]');
    const remover = item.querySelector('[data-action="remove-from-cart"]');
    diminuir.setAttribute('aria-label', `Diminuir quantidade de ${produto.nome}`);
    aumentar.setAttribute('aria-label', `Aumentar quantidade de ${produto.nome}`);
    aumentar.disabled = quantidade >= 99;
    remover.setAttribute('aria-label', `Remover ${produto.nome} do carrinho`);
    return item;
}

function atualizarCarrinho() {
    listaCarrinho.replaceChildren();
    let total = 0;
    let quantidadeTotal = 0;

    Object.entries(carrinho).forEach(function ([id, quantidade]) {
        listaCarrinho.append(criarItemCarrinho(id, quantidade));
        total += produtos[id].preco * quantidade;
        quantidadeTotal += quantidade;
    });

    if (quantidadeTotal === 0) {
        listaCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio. Escolha seus favoritos no cardápio.</p>';
    }
    mostrarPreco(totalCarrinho, total);
    contadorCarrinho.textContent = quantidadeTotal;
    contadorCarrinho.hidden = quantidadeTotal === 0;
    const rotulo = quantidadeTotal === 1 ? 'item' : 'itens';
    botaoCarrinho.setAttribute('aria-label', `Abrir carrinho, ${quantidadeTotal} ${rotulo}`);

    try {
        localStorage.setItem(chaveCarrinho, JSON.stringify(Object.entries(carrinho)));
    } catch {
    }
}

function alterarQuantidade(id, quantidade) {
    quantidade = Math.min(quantidade, 99);
    if (quantidade > 0) carrinho[id] = quantidade;
    else delete carrinho[id];

    atualizarCarrinho();
    avisoCarrinho.textContent = quantidade > 0
        ? `${produtos[id].nome}: ${quantidade} no carrinho.`
        : `${produtos[id].nome} removido do carrinho.`;
}

document.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;

    if (botao.dataset.openDialog) {
        abrirPainel(document.getElementById(botao.dataset.openDialog), botao);
    } else if (botao.hasAttribute('data-close-dialog')) {
        botao.closest('dialog').close();
    } else if (botao.dataset.action === 'open-product') {
        mostrarProduto(botao.dataset.productId, botao);
    } else if (botao.dataset.action === 'add-to-cart') {
        const id = botao.dataset.productId;
        alterarQuantidade(id, (carrinho[id] || 0) + 1);
        abrirPainel(painelCarrinho, botao);
    }
});

listaCarrinho.addEventListener('click', function (evento) {
    const botao = evento.target.closest('button');
    if (!botao) return;
    const item = botao.closest('.item-carrinho');
    const id = item.dataset.cartProductId;
    const acao = botao.dataset.action;
    const posicaoItem = [...listaCarrinho.children].indexOf(item);

    if (acao === 'increase-quantity') alterarQuantidade(id, carrinho[id] + 1);
    if (acao === 'decrease-quantity') alterarQuantidade(id, carrinho[id] - 1);
    if (acao === 'remove-from-cart') alterarQuantidade(id, 0);

    const itemAtual = listaCarrinho.querySelector(`[data-cart-product-id="${id}"]`);
    const proximoItem = listaCarrinho.children[Math.min(posicaoItem, listaCarrinho.children.length - 1)];
    const proximoBotao = itemAtual?.querySelector(`[data-action="${acao}"]:not(:disabled)`)
        || proximoItem?.querySelector('button')
        || painelCarrinho.querySelector('[data-close-dialog]');
    proximoBotao.focus({ preventScroll: true });
});

try {
    const itensSalvos = JSON.parse(localStorage.getItem(chaveCarrinho) || '[]');
    if (Array.isArray(itensSalvos)) {
        itensSalvos.forEach(function (item) {
            if (!Array.isArray(item)) return;
            const [id, quantidade] = item;
            if (Object.hasOwn(produtos, id) && Number.isInteger(quantidade) && quantidade > 0) {
                carrinho[id] = Math.min(quantidade, 99);
            }
        });
    }
} catch {
}
atualizarCarrinho();

if (new URLSearchParams(window.location.search).get('carrinho') === 'aberto') {
    abrirPainel(painelCarrinho, botaoCarrinho);
}
