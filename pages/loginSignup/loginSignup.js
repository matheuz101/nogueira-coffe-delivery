const form = document.querySelector('#formulario-login');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#senha');
const passwordToggle = document.querySelector('.mostrar-senha');
const submitButton = document.querySelector('[type="submit"]');
const signupLink = document.querySelector('#link-cadastro');

let enviando = false;

passwordToggle.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.setAttribute('aria-pressed', 'true');
        passwordToggle.setAttribute('aria-label', 'Ocultar senha');
    } else {
        passwordInput.type = 'password';
        passwordToggle.setAttribute('aria-pressed', 'false');
        passwordToggle.setAttribute('aria-label', 'Mostrar senha');
    }
});

signupLink.addEventListener('click', function () {
    sessionStorage.setItem('signupEmail', emailInput.value);
});

form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (enviando === true) {
        return;
    }

    enviando = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    window.location.assign('../../index.html');
});