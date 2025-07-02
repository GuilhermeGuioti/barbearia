document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.custom-select-wrapper');
    if (!wrapper) return; // Se não houver select customizado na página, não faz nada.

    const customSelectTrigger = wrapper.querySelector('.custom-select');
    const selectText = wrapper.querySelector('.select-text');
    const customOptionsContainer = wrapper.querySelector('.custom-options');
    const realSelect = wrapper.querySelector('select'); // O <select> escondido

    // Lógica para abrir/fechar o menu de opções
    customSelectTrigger.addEventListener('click', () => {
        wrapper.classList.toggle('open');
    });

    // Lógica para selecionar uma opção (usando Delegação de Eventos)
    customOptionsContainer.addEventListener('click', (event) => {
        // Verifica se o que foi clicado foi realmente um .custom-option
        if (event.target.classList.contains('custom-option')) {
            const selectedOption = event.target;

            // Atualiza o texto visível
            selectText.textContent = selectedOption.textContent;
            selectText.classList.remove('placeholder');

            // Atualiza o valor do <select> escondido (o "cérebro")
            realSelect.value = selectedOption.dataset.value;

            // Dispara um evento 'change' no select escondido.
            // ISSO É CRUCIAL para que o outro script saiba que um serviço foi escolhido!
            realSelect.dispatchEvent(new Event('change'));

            // Fecha o menu
            wrapper.classList.remove('open');
        }
    });

    // Lógica para fechar o menu se o usuário clicar fora dele
    window.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });
});