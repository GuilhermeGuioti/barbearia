document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS E VERIFICAÇÃO ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const tableBody = document.getElementById('services-table-body');
    const addServiceBtn = document.getElementById('add-service-btn');
    const serviceModal = document.getElementById('service-modal');
    const serviceForm = document.getElementById('service-form');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalTitle = document.getElementById('modal-title');
    const serviceIdInput = document.getElementById('service-id');
    const horariosForm = document.getElementById('horarios-form');
    const blockTimeBtn = document.getElementById('block-time-btn');
    const blockTimeModal = document.getElementById('block-time-modal');
    const blockTimeForm = document.getElementById('block-time-form');
    const blockCancelBtn = document.getElementById('block-cancel-btn');
    const blockedTimesTableBody = document.getElementById('blocked-times-body');

    let servicesCache = [];


    // --- 2. FUNÇÕES DE RENDERIZAÇÃO E MODAL ---

    const renderTable = (services) => {
        tableBody.innerHTML = '';
        if (services.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Nenhum serviço cadastrado.</td></tr>';
            return;
        }
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.nome}</td>
                <td>R$ ${parseFloat(service.preco).toFixed(2).replace('.', ',')}</td>
                <td>${service.duracao_minutos} min</td>
                <td>
                    <div class="action-buttons">
                      <button class="btn-edit" title="Editar Agendamento" data-id="${service.id}"><i class="fa-solid fa-pencil"></i></button>
                       <button class="btn-delete" title="Excluir Agendamento" data-id="${service.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const openModalForCreate = () => {
        modalTitle.textContent = 'Adicionar Novo Serviço';
        serviceForm.reset();
        serviceIdInput.value = '';
        serviceModal.style.display = 'flex';
    };

    const openModalForEdit = (id) => {
        const service = servicesCache.find(s => s.id == id);
        if (!service) return;

        modalTitle.textContent = 'Editar Serviço';
        serviceIdInput.value = service.id;
        document.getElementById('service-name').value = service.nome;
        document.getElementById('service-price').value = service.preco;
        document.getElementById('service-duration').value = service.duracao_minutos;
        serviceModal.style.display = 'flex';
    };


    // --- 3. FUNÇÕES DE API (CRUD) ---

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/servicos');
            if (!response.ok) throw new Error('Erro ao buscar serviços.');
            servicesCache = await response.json();
            renderTable(servicesCache);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const id = serviceIdInput.value;
        const serviceData = {
            nome: document.getElementById('service-name').value,
            preco: document.getElementById('service-price').value,
            duracao_minutos: document.getElementById('service-duration').value,
        };

        const isUpdating = !!id;
        const url = isUpdating ? `http://localhost:5000/servicos/${id}` : 'http://localhost:5000/servicos';
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(serviceData),
            });

            if (!response.ok) throw new Error('Falha ao salvar o serviço.');
            
            serviceModal.style.display = 'none';
            fetchServices(); // Atualiza a tabela
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
      const confirmed = await showConfirmationModal('Tem certeza que deseja excluir este serviço?');  
      
      if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/servicos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir o serviço.');
            fetchServices(); // Atualiza a tabela
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    const fetchAndPopulateHorarios = async () => {
      try {
        const response = await fetch("http://localhost:5000/configuracoes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao carregar horários.");

        const settings = await response.json();

        // Preenche cada campo com os valores vindos da API
        document.getElementById("horario-abertura").value =
          settings.horario_abertura;
        document.getElementById("horario-fechamento").value =
          settings.horario_fechamento;
        document.getElementById("almoco-inicio").value = settings.almoco_inicio;
        document.getElementById("almoco-fim").value = settings.almoco_fim;
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar as configurações de horário.");
      }
    };

    /**
     * Lida com o envio do formulário de horários, salvando as alterações.
     */
    const handleHorariosUpdate = async (event) => {
      event.preventDefault();

      const settingsData = {
        horario_abertura: document.getElementById("horario-abertura").value,
        horario_fechamento: document.getElementById("horario-fechamento").value,
        almoco_inicio: document.getElementById("almoco-inicio").value,
        almoco_fim: document.getElementById("almoco-fim").value,
      };

      try {
        const response = await fetch("http://localhost:5000/configuracoes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settingsData),
        });

        if (!response.ok) throw new Error("Falha ao salvar os horários.");

        await showAlertModal("Horarios Salvos com sucesso");
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    };

    const fetchAndRenderBloqueios = async () => {
      try {
        const response = await fetch("http://localhost:5000/bloqueios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error("Erro ao buscar horários bloqueados.");

        const bloqueios = await response.json();
        blockedTimesTableBody.innerHTML = ""; // Limpa a tabela

        if (bloqueios.length === 0) {
          blockedTimesTableBody.innerHTML =
            '<tr><td colspan="3" style="text-align:center;">Nenhum horário bloqueado encontrado.</td></tr>';
          return;
        }

        bloqueios.forEach((bloqueio) => {
          const row = document.createElement("tr");
          const dataHora = new Date(bloqueio.data_hora);
          const dataFormatada = dataHora.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          });

          row.innerHTML = `
                <td>${bloqueio.motivo}</td>
                <td>${dataFormatada}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-delete" data-id="${bloqueio.id}">Desbloquear</button>
                    </div>
                </td>
            `;
          blockedTimesTableBody.appendChild(row);
        });
      } catch (error) {
        console.error("Erro ao renderizar bloqueios:", error);
        blockedTimesTableBody.innerHTML = `<tr><td colspan="3" style="color:red;">${error.message}</td></tr>`;
      }
    };

    // --- 4. EVENT LISTENERS ---
    addServiceBtn.addEventListener('click', openModalForCreate);
    modalCancelBtn.addEventListener('click', () => serviceModal.style.display = 'none');
    serviceForm.addEventListener('submit', handleFormSubmit);
    horariosForm.addEventListener('submit', handleHorariosUpdate);

    tableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-edit')) {
            openModalForEdit(event.target.dataset.id);
        }
        if (event.target.classList.contains('btn-delete')) {
            handleDelete(event.target.dataset.id);
        }
    });

    blockTimeForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const dadosBloqueio = {
        motivo: document.getElementById("block-reason").value,
        data_hora: document.getElementById("block-datetime").value,
        duracao_minutos: document.getElementById("block-duration").value,
      };

      try {
        const response = await fetch("http://localhost:5000/bloqueios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dadosBloqueio),
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(
            responseData.message || "Não foi possível criar o bloqueio."
          );
        }

        alert("Horário bloqueado com sucesso!");
        blockTimeModal.style.display = "none"; // Fecha o modal
        window.location.href = 'painel.html';
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    });

    // Adiciona eventos para abrir e fechar o modal de bloqueio
    blockTimeBtn.addEventListener("click", () => {
      blockTimeForm.reset();
      blockTimeModal.style.display = "flex";
    });
    blockCancelBtn.addEventListener("click", () => {
      blockTimeModal.style.display = "none";
    });

    blockedTimesTableBody.addEventListener("click", async (event) => {
      // Verifica se o botão de deletar/desbloquear foi clicado
      if (event.target.classList.contains("btn-delete")) {
        const id = event.target.dataset.id;

        const confirmed = await showConfirmationModal(
          "Tem certeza que deseja desbloquear este horário?"
        );

        if (!confirmed) return;

        {
          try {
            // Reutilizamos a rota de deletar agendamentos, pois um bloqueio é um tipo de agendamento
            const response = await fetch(
              `http://localhost:5000/agendamentos/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!response.ok)
              throw new Error("Falha ao desbloquear o horário.");

            alert("Horário desbloqueado com sucesso!");
            fetchAndRenderBloqueios(); // Atualiza a lista de bloqueios na tela
          } catch (error) {
            alert(`Erro: ${error.message}`);
          }
        }
      }
    });

    function showConfirmationModal(message) {
      const modal = document.getElementById("confirmation-modal");
      const messageP = modal.querySelector("#modal-message");
      const confirmBtn = modal.querySelector("#modal-confirm-btn");
      const cancelBtn = modal.querySelector("#modal-cancel-btn-confirm");

      messageP.textContent = message;
      modal.style.display = "flex";

      return new Promise((resolve) => {
        cancelBtn.addEventListener(
          "click",
          () => {
            modal.style.display = "none";
            resolve(false);
          },
          { once: true }
        );

        confirmBtn.addEventListener(
          "click",
          () => {
            modal.style.display = "none";
            resolve(true);
          },
          { once: true }
        );
      });
    }

    function showAlertModal(message, title = "Aviso") {
      const modal = document.getElementById("alert-modal");
      const titleEl = document.getElementById("alert-modal-title");
      const messageP = document.getElementById("alert-modal-message");
      const okBtn = document.getElementById("alert-modal-ok-btn");

      titleEl.textContent = title;
      messageP.textContent = message;
      modal.style.display = "flex";

      return new Promise((resolve) => {
        okBtn.addEventListener(
          "click",
          () => {
            modal.style.display = "none";
            resolve(); // A promessa é resolvida quando o usuário clica em OK.
          },
          { once: true }
        );
      });
    }

    // --- 5. INICIALIZAÇÃO ---
    fetchServices();
    fetchAndPopulateHorarios();
    fetchAndRenderBloqueios();
});