document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.custom-select-wrapper');
    // Previne erros se o elemento não for encontrado
    if (!wrapper) return; 

    const customSelect = wrapper.querySelector('.custom-select');
    const selectText = customSelect.querySelector('.select-text');
    const options = wrapper.querySelector('.custom-options');
    const customOptions = wrapper.querySelectorAll('.custom-option');
    const realSelect = wrapper.querySelector('select');

    // 1. Abrir/fechar o menu ao clicar
    customSelect.addEventListener('click', function() {
        wrapper.classList.toggle('open');
    });

    // 2. Lógica para quando uma opção é selecionada
    customOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove a cor de placeholder do texto
            selectText.classList.remove('placeholder');

            // Atualiza o texto visível no campo
            selectText.textContent = this.textContent;
            
            // Atualiza o valor do <select> original que está escondido
            realSelect.value = this.getAttribute('data-value');
            
            // Fecha o menu de opções
            wrapper.classList.remove('open');
        });
    });

    // 3. Fecha o menu se o usuário clicar fora dele
    window.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });
});