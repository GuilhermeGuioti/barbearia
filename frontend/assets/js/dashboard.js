const faturamentoSemanaEl = document.getElementById('faturamento-semana');

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Seleciona os elementos que vamos atualizar
    const totalSemanaEl = document.getElementById('total-semana');
    const mediaDiariaEl = document.getElementById('media-diaria');
    const diaPicoEl = document.getElementById('dia-pico');
    const chartContainer = document.querySelector('.chart-container');

    /**
     * Função principal: busca os dados e chama as funções de renderização.
     */
    // Encontre e substitua esta função no seu dashboard.js
const fetchAndRenderDashboard = async () => {
    try {
        const response = await fetch('http://localhost:5000/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar dados do dashboard.');
        
        const stats = await response.json();
        
        // --- LÓGICA CORRIGIDA PARA MONTAR A SEMANA DE DOMINGO A SÁBADO ---
        const weekData = new Map();
        const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Encontra o último Domingo

        // 1. Cria o mapa para a semana inteira (Dom a Sáb)
        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(day.getDate() + i);
            
            const formattedDate = day.toISOString().slice(0, 10); // Formato AAAA-MM-DD
            const dayName = diasDaSemana[i];
            weekData.set(formattedDate, { count: 0, dayName: dayName });
        }
        
        // 2. Preenche o mapa com os dados da API
        stats.forEach(stat => {
            const formattedDate = stat.dia.slice(0, 10);
            if (weekData.has(formattedDate)) {
                weekData.get(formattedDate).count = stat.total;
            }
        });

        const labels = Array.from(weekData.values()).map(d => d.dayName);
        const dataPoints = Array.from(weekData.values()).map(d => d.count);

        // Chama as funções para renderizar
        updateDashboardSummary(dataPoints, labels);
        renderChart(labels, dataPoints);

    } catch (error) {
        console.error("Erro no dashboard:", error);
        if (chartContainer) chartContainer.innerHTML = `<p style="color: var(--text-error);">${error.message}</p>`;
    }
};

    /**
     * Atualiza os cards de resumo com os dados calculados.
     */
    function updateDashboardSummary(dataPoints, labels) { // << CORREÇÃO: Recebe os labels
        // Calcula o total
        const total = dataPoints.reduce((sum, value) => sum + value, 0);
        totalSemanaEl.textContent = total;

        // Calcula a média
        const media = (total / dataPoints.length).toFixed(1).replace('.', ',');
        mediaDiariaEl.textContent = media;

        // Encontra o dia de pico
        const maxAgendamentos = Math.max(...dataPoints);
        if (maxAgendamentos > 0) {
            const indexPico = dataPoints.indexOf(maxAgendamentos);
            const diaPico = labels[indexPico]; // << CORREÇÃO: Usa o array de labels
            diaPicoEl.textContent = `${diaPico} (${maxAgendamentos})`;
        } else {
            diaPicoEl.textContent = 'Nenhum';
        }
    }

function renderChart(labels, data) {
    const ctx = document.getElementById('dailyAppointmentsChart').getContext('2d');

    // Limpa qualquer gráfico anterior que possa existir no canvas para evitar sobreposição
    if (window.myDailyChart instanceof Chart) {
        window.myDailyChart.destroy();
    }

    // --- A nova configuração do gráfico ---
    window.myDailyChart = new Chart(ctx, {
        type: 'bar', // Tipo do gráfico
        data: {
            labels: labels,
            datasets: [{
                label: 'Agendamentos',
                data: data,
                backgroundColor: 'rgba(44, 90, 77, 0.6)', // Cor verde do seu tema com transparência
                borderColor: 'rgba(44, 90, 77, 1)',     // Cor verde do seu tema sólida
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: 'rgba(44, 90, 77, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // Força os números do eixo Y a serem inteiros
                        color: '#b0b0b0' // Cor do texto dos números (eixo Y)
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)' // Cor das linhas de fundo (quase invisível)
                    }
                },
                x: {
                    ticks: {
                        color: '#b0b0b0' // Cor do texto dos dias (eixo X)
                    },
                    grid: {
                        display: false // Remove as linhas de fundo verticais
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Esconde a legenda "Agendamentos" no topo
                },
                tooltip: {
                    // Configurações para o balão que aparece ao passar o mouse
                    backgroundColor: '#121212',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#3a3a3a',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8
                }
            }
        }
    });
}

const fetchAndRenderPieChart = async () => {
    try {
        const response = await fetch('http://localhost:5000/dashboard/services', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar dados dos serviços.');

        const stats = await response.json();

        if (stats.length === 0) return; // Não desenha o gráfico se não houver dados

        const labels = stats.map(stat => stat.servico);
        const data = stats.map(stat => stat.total);

        renderPieChart(labels, data);

    } catch (error) {
        console.error("Erro no gráfico de pizza:", error);
    }
};

/**
 * Renderiza o gráfico de pizza/rosca na tela.
 */
function renderPieChart(labels, data) {
    const ctx = document.getElementById('servicesPieChart').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut', // 'doughnut' é um tipo de pizza com um buraco no meio, mais moderno.
        data: {
            labels: labels,
            datasets: [{
                label: 'Nº de Agendamentos',
                data: data,
                // Paleta de cores que combina com o site
                backgroundColor: [
                    'rgba(44, 90, 77, 0.7)',   // Nosso verde --accent-primary
                    'rgba(94, 94, 94, 0.7)',    // O cinza --bg-button-hover
                    'rgba(176, 176, 176, 0.7)', // O cinza --text-secondary
                    'rgba(58, 58, 58, 0.7)',     // O cinza --border-primary
                ],
                borderColor: '#1c1c1c', // Cor de fundo do painel para as bordas
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // Coloca a legenda embaixo
                    labels: {
                        color: '#b0b0b0' // Cor do texto da legenda
                    }
                }
            }
        }
    });
}

const fetchAndRenderStatusChart = async () => {
    try {
        const response = await fetch('http://localhost:5000/dashboard/status-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar estatísticas de status.');

        const stats = await response.json();

        if (stats.length === 0) {
            document.querySelector('#statusPieChart').parentElement.innerHTML = '<p style="text-align: center; color: #888; padding-top: 100px;">Sem dados de status para exibir.</p>';
            return;
        }

        const labels = stats.map(stat => stat.status);
        const data = stats.map(stat => stat.total);

        renderStatusChart(labels, data);

    } catch (error) {
        console.error("Erro no gráfico de status:", error);
    }
};

/**
 * Renderiza o gráfico de pizza de status.
 */
function renderStatusChart(labels, data) {
    const ctx = document.getElementById('statusPieChart').getContext('2d');

    if (window.myStatusChart instanceof Chart) {
        window.myStatusChart.destroy();
    }

    window.myStatusChart = new Chart(ctx, {
        type: 'pie', // Usaremos 'pie' para variar um pouco do 'doughnut'
        data: {
            labels: labels,
            datasets: [{
                label: 'Nº de Agendamentos',
                data: data,
                backgroundColor: [ // Paleta de cores para cada status
                    'rgba(44, 90, 77, 0.7)',   // Confirmado (Verde do tema)
                    'rgba(94, 94, 94, 0.7)',    // Concluído (Cinza)
                    'rgba(168, 50, 50, 0.7)',  // Cancelado (Vermelho do tema)
                ],
                borderColor: '#1c1c1c',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b0b0',
                        padding: 20,
                        font: { size: 14 }
                    }
                }
            }
        }
    });
}

/**
 * Busca o faturamento da semana e atualiza o card.
 */
const fetchAndRenderFaturamento = async () => {
    try {
        const response = await fetch('http://localhost:5000/dashboard/faturamento', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar faturamento.');

        const data = await response.json();

        // Formata o número para o padrão monetário brasileiro
        const faturamentoFormatado = parseFloat(data.faturamentoTotal).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        faturamentoSemanaEl.textContent = faturamentoFormatado;

    } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
        faturamentoSemanaEl.textContent = 'Erro';
    }
};

/**
 * Busca os dados de faturamento da semana e chama a função para renderizar o gráfico de linha.
 */
const fetchAndRenderRevenueChart = async () => {
    try {
        const response = await fetch('http://localhost:5000/dashboard/revenue-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar dados de faturamento.');

        const revenueStats = await response.json();

        // Prepara os dados para o gráfico, garantindo que todos os 7 dias da semana apareçam
        const weekData = new Map();
        const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

        for (let i = 0; i < 7; i++) {
            const day = new Date(firstDayOfWeek);
            day.setDate(day.getDate() + i);
            const formattedDate = day.toISOString().slice(0, 10);
            weekData.set(formattedDate, { total: 0, dayName: diasDaSemana[i] });
        }

        revenueStats.forEach(stat => {
            const formattedDate = stat.dia.slice(0, 10);
            if (weekData.has(formattedDate)) {
                weekData.get(formattedDate).total = parseFloat(stat.total);
            }
        });

        const labels = Array.from(weekData.values()).map(d => d.dayName);
        const dataPoints = Array.from(weekData.values()).map(d => d.total);

        renderRevenueChart(labels, dataPoints);

    } catch (error) {
        console.error("Erro no gráfico de faturamento:", error);
    }
};

//Renderiza o gráfico de linha de faturamento.
function renderRevenueChart(labels, data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    if (window.myRevenueChart instanceof Chart) {
        window.myRevenueChart.destroy();
    }

    window.myRevenueChart = new Chart(ctx, {
        type: 'line', // <<< O tipo agora é 'line'
        data: {
            labels: labels,
            datasets: [{
                label: 'Faturamento R$',
                data: data,
                backgroundColor: 'rgba(44, 90, 77, 0.2)',  // Verde do tema com mais transparência
                borderColor: 'rgba(44, 90, 77, 1)',      // Verde do tema sólido
                borderWidth: 2,
                fill: true, // Preenche a área abaixo da linha
                tension: 0.4 // Deixa a linha com curvas suaves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b0b0',
                        // Formata os números do eixo Y como moeda
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2).replace('.', ',');
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#b0b0b0' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#121212',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    callbacks: {
                        label: function(context) {
                            let label = 'Faturamento: ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

fetchAndRenderDashboard();   // Gráfico de barras
fetchAndRenderPieChart();      // Gráfico de serviços
fetchAndRenderStatusChart();   // Gráfico de status
fetchAndRenderFaturamento(); // Financeiro
fetchAndRenderRevenueChart();

});