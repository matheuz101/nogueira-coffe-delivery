// 1. Pegar os elementos da página
const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');
const submitButton = document.querySelector('[type="submit"]');
const signupLink = document.querySelector('#signup-link');

// 2. Variável que controla se o login já foi enviado
let enviando = false;

// 3. Botão de mostrar/ocultar senha
passwordToggle.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';                            // mostra a senha
        passwordToggle.setAttribute('aria-pressed', 'true');    // ativa o ícone
        passwordToggle.setAttribute('aria-label', 'Ocultar senha');
    } else {
        passwordInput.type = 'password';                        // esconde a senha
        passwordToggle.setAttribute('aria-pressed', 'false');   // desativa o ícone
        passwordToggle.setAttribute('aria-label', 'Mostrar senha');
    }
});

// 4. Levar o e-mail para a tela de cadastro
signupLink.addEventListener('click', function () {
    sessionStorage.setItem('signupEmail', emailInput.value);
});

// 5. Enviar o formulário
form.addEventListener('submit', function (event) {
    event.preventDefault(); // impede a página de recarregar

    // Proteção contra duplo clique
    if (enviando === true) {
        return; // já está enviando, então não faz nada
    }

    enviando = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    // Redireciona para a página inicial
    window.location.assign('../../index.html');
});