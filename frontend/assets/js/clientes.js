document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VERIFICAÇÃO DE SEGURANÇA ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Acesso negado. Por favor, faça o login.');
        window.location.href = 'login.html';
        return;
    }

    // --- 2. FUNÇÃO PRINCIPAL ---
    const fetchAndRenderClientes = async () => {
        const tableBody = document.getElementById('client-list-body');
        tableBody.innerHTML = '<tr><td colspan="3">Carregando clientes...</td></tr>';

        try {
            const response = await fetch('http://localhost:5000/clientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar a lista de clientes.');
            }

            const clientes = await response.json();
            
            tableBody.innerHTML = ''; // Limpa a mensagem de "carregando"

            if (clientes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="3">Nenhum cliente encontrado.</td></tr>';
                return;
            }

            clientes.forEach(cliente => {
                const row = document.createElement('tr');
                
                // Formata a data da última visita
                const dataFormatada = new Date(cliente.ultima_visita).toLocaleDateString('pt-BR');

                row.innerHTML = `
                    <td>${cliente.nome_cliente}</td>
                    <td>${cliente.telefone_cliente}</td>
                    <td>${dataFormatada}</td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="3" style="color: red;">${error.message}</td></tr>`;
        }
    };

    // --- 3. INICIALIZAÇÃO ---
    fetchAndRenderClientes();
});