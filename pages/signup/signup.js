const form = document.querySelector('#formulario-cadastro');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#senha');
const passwordToggle = document.querySelector('.mostrar-senha');
const submitButton = form.querySelector('[type="submit"]');
const feedback = document.querySelector('#aviso-cadastro');
let submitting = false;

try {
    const savedEmail = sessionStorage.getItem('nogueira.signupEmail');
    sessionStorage.removeItem('nogueira.signupEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        if (emailInput.validity.valid) {
            const notice = document.querySelector('#mensagem-cadastro');
            notice.textContent = 'Complete seus dados para criar sua conta com este e-mail.';
            notice.hidden = false;
        } else {
            emailInput.value = '';
        }
    }
} catch {
}

passwordToggle.addEventListener('click', () => {
    const visible = passwordInput.type === 'password';
    passwordInput.type = visible ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(visible));
    passwordToggle.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    nameInput.value = nameInput.value.trim();
    emailInput.value = emailInput.value.trim();
    if (!form.reportValidity()) return;

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Criando sua conta…';
    form.setAttribute('aria-busy', 'true');
    feedback.dataset.tone = 'info';
    feedback.textContent = 'Enviando seus dados…';

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name: nameInput.value, email: emailInput.value, password: passwordInput.value }),
            signal: AbortSignal.timeout(15000),
        });
        const data = await response.json().catch(() => null);

        if (response.ok && data?.authenticated === true) {
            window.location.assign('../../index.html');
            return;
        }

        feedback.dataset.tone = 'error';
        if (response.status === 409 && data?.code === 'EMAIL_ALREADY_EXISTS') {
            feedback.textContent = 'Este e-mail já tem uma conta. Use “Entrar na minha conta” abaixo.';
        } else if (response.status === 422) {
            feedback.textContent = 'Confira os dados preenchidos e use uma senha com pelo menos 8 caracteres.';
        } else if (response.status === 429) {
            feedback.textContent = 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
        } else {
            feedback.textContent = 'Não foi possível criar sua conta agora. Tente novamente mais tarde.';
        }
    } catch {
        feedback.dataset.tone = 'error';
        feedback.textContent = 'Não foi possível conectar. Confira sua conexão e tente novamente.';
    } finally {
        submitting = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Criar minha conta';
        form.removeAttribute('aria-busy');
    }
});
