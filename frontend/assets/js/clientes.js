const searchInput = document.getElementById('search-input');
let clientesCache = []; // Adicione um cache para guardar a lista completa de clientes

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

            clientesCache = clientes; // << SALVA A LISTA COMPLETA AQUI

            renderTable(clientesCache); // Renderiza a tabela com a lista completa

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="3" style="color: red;">${error.message}</td></tr>`;
        }
    };

    function renderTable(clientes, searchTerm = '') {
    const tableBody = document.getElementById('client-list-body');
    tableBody.innerHTML = '';

    // Filtra a lista com base no termo de busca (ignorando maiúsculas/minúsculas)
    const clientesFiltrados = clientes.filter(cliente => 
        cliente.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (clientesFiltrados.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    clientesFiltrados.forEach(cliente => {
        const row = document.createElement('tr');
        const dataFormatada = new Date(cliente.ultima_visita).toLocaleDateString('pt-BR');
        row.innerHTML = `
            <td>${cliente.nome_cliente}</td>
            <td>${cliente.telefone_cliente}</td>
            <td>${dataFormatada}</td>
        `;
        tableBody.appendChild(row);
    });
}

searchInput.addEventListener('input', () => {
    // A cada letra digitada, chama a função de renderizar novamente,
    // passando a lista completa do cache e o novo termo de busca.
    renderTable(clientesCache, searchInput.value);
});

    // --- 3. INICIALIZAÇÃO ---
    fetchAndRenderClientes();
});