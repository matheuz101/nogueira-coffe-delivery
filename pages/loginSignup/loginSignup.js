const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');
const submitButton = document.querySelector('[type="submit"]');
const signupLink = document.querySelector('#signup-link');

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