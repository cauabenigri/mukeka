import { clearSearch, fetchAndDisplayMusic } from './music.js'; // Ajuste o caminho conforme necessário

// Função para manipular a pesquisa
const handleSearch = () => {
    const searchTerm = document.getElementById('search-input').value;

    if (searchTerm.trim() === '') {
        clearSearch(); // Limpa a pesquisa e permite o embaralhamento aleatório
    } else {
        fetchAndDisplayMusic(searchTerm); // Pesquisa enquanto digita
    }
};

// Adiciona o evento de pesquisa ao campo de entrada
document.getElementById('search-input').addEventListener('input', handleSearch);
