document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS E VERIFICAÇÃO INICIAL ---
    const token = localStorage.getItem('authToken');
    const listaAgendamentosContainer = document.getElementById('lista-agendamentos');
    const dataFiltroInput = document.getElementById('data-filtro');
    const logoutButton = document.getElementById('logout-button');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editCancelBtn = document.getElementById('edit-cancel-btn');

    let agendamentosCache = []; // Guarda os agendamentos buscados para usar no preenchimento do formulário

    // Guarda de segurança: se não há token, redireciona para o login.
    if (!token) {
        alert('Acesso negado. Por favor, faça o login.');
        window.location.href = 'login.html';
        return;
    }


    // --- 2. FUNÇÕES PRINCIPAIS (BUSCA E RENDERIZAÇÃO DE DADOS) ---
    const fetchAgendamentos = async (data) => {
        listaAgendamentosContainer.innerHTML = '<p>Carregando agendamentos...</p>';
        try {
            const response = await fetch('http://localhost:5000/agendamentos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                alert('Sua sessão expirou. Faça o login novamente.');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Erro ao buscar agendamentos.');
            }

            agendamentosCache = await response.json(); // Salva a lista completa no cache
            const agendamentosFiltrados = agendamentosCache.filter(ag => ag.data_hora.startsWith(data));
            renderizarAgendamentos(agendamentosFiltrados);
            updateSummaryCards(agendamentosFiltrados); // <-- ADICIONE ESTA LINHA

        } catch (error) {
            listaAgendamentosContainer.innerHTML = `<p style="color: #ff6b6b;">${error.message}</p>`;
        }
    };

    function renderizarAgendamentos(agendamentos) {
        listaAgendamentosContainer.innerHTML = '';
        if (agendamentos.length === 0) {
            listaAgendamentosContainer.innerHTML = '<p style="color: #888; text-align: center;">Nenhum agendamento para esta data.</p>';
            return;
        }

        agendamentos.forEach(agendamento => {
            const dataHora = new Date(agendamento.data_hora);
            const horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const card = document.createElement('div');
            card.className = 'agendamento-card';
            card.dataset.id = agendamento.id;
            
            card.innerHTML = `
                <div class="card-info">
                    <strong>${horaFormatada}</strong> - ${agendamento.nome_cliente}
                    <span><i class="fa-solid fa-scissors"></i> ${agendamento.servico}</span>
                    <span><i class="fa-solid fa-phone"></i> ${agendamento.telefone_cliente}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" title="Editar Agendamento" data-id="${agendamento.id}">✏️</button>
                    <button class="btn-delete" title="Excluir Agendamento" data-id="${agendamento.id}">🗑️</button>
                </div>
            `;
            listaAgendamentosContainer.appendChild(card);
        });
    }

    function updateSummaryCards(agendamentosDoDia) {
      const totalAgendamentosEl = document.getElementById('total-agendamentos');
      const proximoClienteEl = document.getElementById('proximo-cliente');

      // Parte 1: Atualiza o total de agendamentos
      totalAgendamentosEl.textContent = agendamentosDoDia.length;

      // --- PARTE 2: LÓGICA DO PRÓXIMO CLIENTE ---
      const agora = new Date(); // Pega a hora atual do computador
      
      // Filtra para pegar apenas os agendamentos que ainda vão acontecer
      const proximosAgendamentos = agendamentosDoDia
          .filter(ag => new Date(ag.data_hora) > agora) // Compara a hora do agendamento com a hora atual
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora)); // Ordena para garantir que o primeiro é o mais próximo

      // Verifica se existe algum agendamento futuro
      if (proximosAgendamentos.length > 0) {
          // Pega o primeiro da lista ordenada
          const proximo = proximosAgendamentos[0];
          // Formata a hora para exibição (ex: 15:30)
          const horaFormatada = new Date(proximo.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          // Atualiza o texto do card
          proximoClienteEl.textContent = `${proximo.nome_cliente} (${horaFormatada})`;
      } else {
          // Se não houver mais agendamentos para hoje, exibe uma mensagem padrão
          proximoClienteEl.textContent = 'Nenhum próximo';
      }
    }

    function showAllAgendamentos() {
        // Limpa o campo de data para o usuário saber que está vendo todos os dias
        dataFiltroInput.value = '';

        // Usa os dados que já temos em cache para não fazer uma nova chamada desnecessária à API
        renderizarAgendamentos(agendamentosCache);
        updateSummaryCards(agendamentosCache);
    }   


    // --- 3. FUNÇÕES DE AÇÃO (MODAL E DELETE) ---
    function showConfirmationModal(message) {
        const modal = document.getElementById('confirmation-modal');
        const messageP = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        messageP.textContent = message;
        modal.style.display = 'flex';

        return new Promise((resolve) => {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(false);
            }, { once: true });

            confirmBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                resolve(true);
            }, { once: true });
        });
    }

    const handleDelete = async (id) => {
        const confirmed = await showConfirmationModal('Você tem certeza que deseja excluir este agendamento? A ação não pode ser desfeita.');

        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/agendamentos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir o agendamento.');
            }

            const cardParaRemover = document.querySelector(`.agendamento-card[data-id='${id}']`);
            if (cardParaRemover) cardParaRemover.remove();
            fetchAgendamentos(dataFiltroInput.value);

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    // Abre e preenche o modal com os dados do agendamento clicado
    function handleEdit(id) {
    // Encontra o agendamento completo no nosso cache pelo ID
    const agendamento = agendamentosCache.find(ag => ag.id == id);
    if (!agendamento) return;

    // Preenche os campos do formulário no modal
    document.getElementById('edit-agendamento-id').value = agendamento.id;
    document.getElementById('edit-nome').value = agendamento.nome_cliente;
    document.getElementById('edit-telefone').value = agendamento.telefone_cliente;
    document.getElementById('edit-servico').value = agendamento.servico;
    document.getElementById('edit-status').value = agendamento.status;
    
    // O input datetime-local precisa do formato AAAA-MM-DDTHH:MM
    // Este código converte a data do banco para este formato
    const dataParaInput = new Date(new Date(agendamento.data_hora) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('edit-data').value = dataParaInput;
    
    // Mostra o modal de edição
    editModal.style.display = 'flex';

    fetchAgendamentos(dataFiltroInput.value);
}

// Envia os dados atualizados para a API quando o formulário do modal é salvo
async function handleUpdate(event) {
    event.preventDefault();

    const id = document.getElementById('edit-agendamento-id').value;

    // Pega o valor do input de data
    const dataInputString = document.getElementById('edit-data').value;
    // Cria um objeto de data a partir do valor
    const dataObj = new Date(dataInputString);

    // Formata a data manualmente para o padrão do MySQL
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // getMonth() é 0-11, então somamos 1
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');
    
    // Monta a string no formato 'AAAA-MM-DD HH:MM:SS'
    const dataFormatadaParaMySQL = `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;

    const dadosAtualizados = {
        nome_cliente: document.getElementById('edit-nome').value,
        telefone_cliente: document.getElementById('edit-telefone').value,
        servico: document.getElementById('edit-servico').value,
        data_hora: dataFormatadaParaMySQL, // << USA A DATA FORMATADA
        status: document.getElementById('edit-status').value,
    };
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/agendamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dadosAtualizados),
        });

        if (!response.ok) throw new Error('Falha ao atualizar o agendamento.');
        
        editModal.style.display = 'none';
        fetchAgendamentos(dataFiltroInput.value);

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}


    // --- 4. OUVINTES DE EVENTOS ---
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('authToken');
        alert('Você saiu do painel.');
        window.location.href = 'login.html';
    });

    dataFiltroInput.addEventListener('change', () => {
        fetchAgendamentos(dataFiltroInput.value);
    });

    listaAgendamentosContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const id = event.target.dataset.id;
            handleDelete(id);
        }
        // Adiciona a verificação para o botão de editar
        if (event.target.classList.contains('btn-edit')) {
            const id = event.target.dataset.id;
            handleEdit(id);
        } 
    });

    // Ouve o envio do formulário de edição
    editForm.addEventListener('submit', handleUpdate);

    // Ouve o clique no botão de cancelar do modal de edição
    editCancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    const showAllBtn = document.getElementById('show-all-btn');
    // O evento de clique agora simplesmente chama a nossa nova função
    showAllBtn.addEventListener('click', () => {
        showAllAgendamentos();
    });


    // --- 5. INICIALIZAÇÃO DA PÁGINA ---
    const getHojeFormatado = () => {
        const hoje = new Date();
        const fuso = hoje.getTimezoneOffset() * 60000;
        const dataLocal = new Date(hoje - fuso);
        return dataLocal.toISOString().slice(0, 10);
    };
    
    // Define o valor do filtro de data para hoje e busca os primeiros agendamentos.
    const hoje = getHojeFormatado();
    dataFiltroInput.value = hoje;
    fetchAgendamentos(hoje);

});

// Seleciona o campo de data
const dataInput = document.getElementById('data-filtro');

// Adiciona um evento de clique para abrir o calendário ao clicar no campo de data
dataInput.addEventListener('click', function() {
    // Dispara o evento de foco para abrir o calendário
    this.showPicker();
});