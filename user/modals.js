// Função para abrir um modal
export const openModal = (modal, modals) => {
    // Fechar todos os outros modais
    modals.forEach(m => closeModal(m));

    // Abrir o modal selecionado
    if (modal) {
        modal.classList.add('show');
    }
};

// Função para fechar um modal
export const closeModal = (modal) => {
    if (modal) {
        modal.classList.remove('show');
    }
};

// Função para configurar os modais
export const setupModals = (uploadModal, musicDataModal, perfilModal, fetchPerfilInfo) => {
    if (!uploadModal || !musicDataModal || !perfilModal) {
        console.error("Alguns dos modais não foram encontrados.");
        return;
    }

    // Adiciona todos os modais em um array para facilitar o gerenciamento
    const modals = [uploadModal, musicDataModal, perfilModal];

    // Abre o modal de upload de música
    const openModalBtn = document.getElementById("openModalBtn");
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => openModal(uploadModal, modals));
    }

    // Fecha o modal de upload
    const uploadModalCloseBtn = uploadModal.querySelector(".close");
    if (uploadModalCloseBtn) {
        uploadModalCloseBtn.addEventListener("click", () => closeModal(uploadModal));
    }

    // Fecha o modal de dados da música
    const musicDataModalCloseBtn = musicDataModal.querySelector(".close");
    if (musicDataModalCloseBtn) {
        musicDataModalCloseBtn.addEventListener("click", () => closeModal(musicDataModal));
    }

    // Configuração do modal de perfil
    const openPerfilBtn = document.getElementById("openPerfil");
    if (openPerfilBtn) {
        openPerfilBtn.addEventListener("click", () => {
            openModal(perfilModal, modals);
            fetchPerfilInfo(); // Função para carregar dados do perfil
        });
    }

    // Fecha o modal de perfil
    const perfilModalCloseBtn = perfilModal.querySelector(".close");
    if (perfilModalCloseBtn) {
        perfilModalCloseBtn.addEventListener("click", () => closeModal(perfilModal));
    }

    // Fecha os modais se o usuário clicar fora deles
    window.addEventListener("click", (event) => {
        if (event.target === musicDataModal) closeModal(musicDataModal);
        if (event.target === perfilModal) closeModal(perfilModal);
    });
};
