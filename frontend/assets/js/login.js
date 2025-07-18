document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        errorMessage.textContent = ''; // Limpa mensagens de erro antigas

        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            // 1. Faz a requisição para a nossa rota de login no backend
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            // 2. Se a resposta não for 'OK' (ex: status 401), joga um erro com a mensagem da API
            if (!response.ok) {
                throw new Error(data.message || 'Falha no login.');
            }

            // 3. Se o login for bem-sucedido, o backend nos devolve um token.
            //    Guardamos o token no navegador para usar depois!
            localStorage.setItem('authToken', data.token);

            // 4. Redireciona o usuário para a página do painel de controle
            window.location.href = 'painel.html'; // Vamos criar esta página a seguir

        } catch (error) {
            // 5. Se der algum erro, mostra a mensagem para o usuário no parágrafo
            errorMessage.textContent = error.message;
        }
    });
});