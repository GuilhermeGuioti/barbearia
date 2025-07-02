document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DOS ELEMENTOS DA PÁGINA ---
    const form = document.querySelector('.booking_options form');
    const nomeInput = document.getElementById('nome');
    const telefoneInput = document.getElementById('telefone');
    const dataInput = document.getElementById('data');
    const horariosContainer = document.getElementById('horarios-container');
    
    // Elementos que serão manipulados, mas cuja lógica está no selectCustom.js
    const servicoSelect = document.getElementById('servico');
    const customOptionsContainer = document.querySelector('.custom-options');

    let horarioSelecionado = null;

    // --- 2. LÓGICA DE DADOS DA PÁGINA ---

    /**
     * Busca os serviços na API e cria as opções no HTML.
     */
    const popularServicos = async () => {
        try {
            const response = await fetch('http://localhost:5000/servicos');
            if (!response.ok) throw new Error('Não foi possível carregar os serviços.');
            
            const servicos = await response.json();
            
            servicoSelect.innerHTML = '<option value="">Selecione o serviço</option>';
            customOptionsContainer.innerHTML = '';

            servicos.forEach(servico => {
                // Popula o <select> escondido
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = servico.nome;
                servicoSelect.appendChild(option);

                // Popula os <div> visíveis
                const customOption = document.createElement('div');
                customOption.className = 'custom-option';
                customOption.textContent = servico.nome;
                customOption.dataset.value = servico.id;
                customOptionsContainer.appendChild(customOption);
            });
        } catch (error) {
            console.error(error);
            // Poderíamos adicionar uma mensagem de erro visual aqui
        }
    };

    /**
     * Busca e renderiza os horários disponíveis com base na data e serviço.
     */
    const fetchAndRenderHorarios = async () => {
        const data = dataInput.value;
        const servicoId = servicoSelect.value;
        horarioSelecionado = null;

        if (!data || !servicoId) {
            horariosContainer.innerHTML = '';
            return;
        }

        horariosContainer.innerHTML = '<p>Verificando horários disponíveis...</p>';

        try {
            // Usa o servico_id para a busca, como ajustamos no backend
            const response = await fetch(`http://localhost:5000/disponibilidade?data=${data}&servico_id=${servicoId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Não foi possível buscar os horários.');
            }
            const horarios = await response.json();
            renderizarHorarios(horarios);
        } catch (error) {
            horariosContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    };

    /**
     * Cria os botões de horário na tela.
     */
    function renderizarHorarios(horarios) {
        horariosContainer.innerHTML = '';
        if (horarios.length === 0) {
            horariosContainer.innerHTML = '<p>Nenhum horário disponível para esta data.</p>';
            return;
        }
        horarios.forEach(horario => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'horario-btn';
            button.textContent = horario;
            button.addEventListener('click', () => {
                horarioSelecionado = horario;
                document.querySelectorAll('.horario-btn').forEach(btn => btn.classList.remove('selecionado'));
                button.classList.add('selecionado');
            });
            horariosContainer.appendChild(button);
        });
    }

    // --- 3. EVENT LISTENERS DA PÁGINA ---

    // Ouve as mudanças que o `selectCustom.js` dispara no <select> escondido
    servicoSelect.addEventListener('change', fetchAndRenderHorarios);
    dataInput.addEventListener('change', fetchAndRenderHorarios);

    // Ouve o envio do formulário para criar o agendamento
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!horarioSelecionado || !dataInput.value || !servicoSelect.value || !nomeInput.value || !telefoneInput.value) {
            alert('Por favor, preencha todos os campos e selecione um horário.');
            return;
        }

        const dadosAgendamento = {
            nome_cliente: nomeInput.value,
            telefone_cliente: telefoneInput.value,
            servico_id: servicoSelect.value,
            data_hora: `${dataInput.value} ${horarioSelecionado}:00`,
            status: "Confirmado"
        };
        
        try {
            const response = await fetch('http://localhost:5000/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAgendamento),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Não foi possível realizar o agendamento.');
            }
            alert(`Agendamento realizado com sucesso! ID: ${responseData.insertId}`);
            form.reset();
            horariosContainer.innerHTML = '';
            document.querySelector('.select-text').textContent = 'Selecione o serviço';
            document.querySelector('.select-text').classList.add('placeholder');
        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    });

    // --- 4. INICIALIZAÇÃO ---
    // Inicia tudo carregando os serviços da API.
    popularServicos();
});