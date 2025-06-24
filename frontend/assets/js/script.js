// Espera o documento HTML ser totalmente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DOS ELEMENTOS DO HTML ---
    // Selecionamos todos os elementos do formulário com os quais vamos interagir.
    const form = document.querySelector('.booking_options form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const servicoSelect = document.getElementById('servico'); // O <select> original
    const dataInput = document.getElementById('data');
    const horariosContainer = document.getElementById('horarios-container');

    // Variável para guardar o horário que o cliente clicar.
    let horarioSelecionado = null;

    // --- 2. LÓGICA PARA BUSCAR E RENDERIZAR OS HORÁRIOS ---

    // Função principal que busca e mostra os horários.
    const fetchAndRenderHorarios = async () => {
        const data = dataInput.value;
        const servico = servicoSelect.value;
        horarioSelecionado = null; // Reseta a seleção anterior

        // Só busca na API se o usuário já selecionou uma data E um serviço.
        if (!data || !servico) {
            horariosContainer.innerHTML = ''; // Limpa os horários se faltar informação
            return;
        }

        // Mostra um feedback para o usuário enquanto a API é chamada.
        horariosContainer.innerHTML = '<p>Verificando horários disponíveis...</p>';

        try {
            // Chama nossa API de disponibilidade, passando data e serviço na URL.
            const response = await fetch(`http://localhost:5000/disponibilidade?data=${data}&servico=${servico}`);
            if (!response.ok) {
                throw new Error('Não foi possível buscar os horários. Tente outra data.');
            }
            const horarios = await response.json();
            
            // Com a lista de horários em mãos, chama a função para criar os botões.
            renderizarHorarios(horarios);

        } catch (error) {
            horariosContainer.innerHTML = `<p style="color: #ff6b6b;">${error.message}</p>`;
        }
    };

    function renderizarHorarios(horarios) {
        horariosContainer.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (horarios.length === 0) {
            horariosContainer.innerHTML = '<p>Nenhum horário disponível para esta data e serviço.</p>';
            return;
        }

        horarios.forEach(horario => {
            const button = document.createElement('button');
            button.type = 'button'; // Importante para não submeter o formulário
            button.className = 'horario-btn';
            button.textContent = horario;

            button.addEventListener('click', () => {
                horarioSelecionado = horario; // Guarda o horário que o cliente clicou

                // Efeito visual para destacar o botão selecionado
                document.querySelectorAll('.horario-btn').forEach(btn => btn.classList.remove('selecionado'));
                button.classList.add('selecionado');
            });

            horariosContainer.appendChild(button);
        });
    }

    // Adiciona os "ouvintes" para disparar a busca sempre que a data ou o serviço mudar.
    dataInput.addEventListener('change', fetchAndRenderHorarios);
    servicoSelect.addEventListener('change', fetchAndRenderHorarios);


    // --- 3. LÓGICA PARA O ENVIO FINAL DO FORMULÁRIO ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o comportamento padrão de recarregar a página

        // Validação final antes do envio
        if (!horarioSelecionado || !dataInput.value || !servicoSelect.value || !nomeInput.value || !telefoneInput.value) {
            alert('Por favor, preencha todos os campos e selecione um horário.');
            return;
        }

        // Monta o objeto com todos os dados para enviar para a API
        const dadosAgendamento = {
            nome_cliente: nomeInput.value,
            telefone_cliente: telefoneInput.value,
            servico: servicoSelect.value,
            data_hora: `${dataInput.value} ${horarioSelecionado}:00` // Junta "AAAA-MM-DD" com "HH:MM"
        };
        
        try {
            // Faz a requisição POST final para a rota de criação de agendamentos
            const response = await fetch('http://localhost:5000/agendamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosAgendamento),
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Usa a mensagem de erro específica do backend (ex: "horário ocupado")
                throw new Error(responseData.message || 'Não foi possível realizar o agendamento.');
            }

            alert(`Agendamento realizado com sucesso! ID do agendamento: ${responseData.insertId}`);
            form.reset(); // Limpa o formulário
            horariosContainer.innerHTML = ''; // Limpa os botões de horário

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

});