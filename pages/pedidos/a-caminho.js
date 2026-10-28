const modalRastreador = document.querySelector('#acompanhamento-entrega');
const botaoRastrear = document.querySelector('#rastrear-entrega');
let cliqueComecouFora = false;

botaoRastrear.addEventListener('click', function () {
    const rua = modalRastreador.querySelector('[data-address-street]');
    const cidade = modalRastreador.querySelector('[data-address-city]');
    rua.textContent = '';
    cidade.textContent = '';
    try {
        const endereco = JSON.parse(sessionStorage.getItem('nogueira-coffe-address'));
        if (typeof endereco?.rua === 'string' && typeof endereco?.cidade === 'string'
            && endereco.rua.trim() && endereco.cidade.trim()) {
            rua.textContent = endereco.rua;
            cidade.textContent = endereco.cidade;
        }
    } catch {
        // Sem um endereço válido nesta aba, o acompanhamento fica sem endereço.
    }
    modalRastreador.showModal();
    modalRastreador.scrollTop = 0;
});

modalRastreador.querySelector('.fechar-rastreador').addEventListener('click', function () {
    modalRastreador.close();
});
modalRastreador.addEventListener('close', function () {
    botaoRastrear.focus({ preventScroll: true });
});

function clicouFora(evento) {
    const area = modalRastreador.getBoundingClientRect();
    return evento.target === modalRastreador && (
        evento.clientX < area.left || evento.clientX > area.right
        || evento.clientY < area.top || evento.clientY > area.bottom
    );
}

modalRastreador.addEventListener('pointerdown', function (evento) {
    cliqueComecouFora = clicouFora(evento);
});
modalRastreador.addEventListener('click', function (evento) {
    if (cliqueComecouFora && clicouFora(evento)) modalRastreador.close();
    cliqueComecouFora = false;
});
