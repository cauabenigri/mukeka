import { getDocs, collection, doc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { storage, firestore } from './firebase-config.js';

const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/mukekajasko.appspot.com/o/covers%2Fdefault.jpg?alt=media';

let searchActive = false; // Flag para controlar se a pesquisa está ativa
let musicOffset = 0; // Controla o ponto de onde pegar as músicas

// Função para exibir a lista de músicas
export const displayMusicList = (musicData) => {
    const musicList = document.getElementById('music-list');
    musicList.innerHTML = ''; // Limpa a lista antes de adicionar as músicas

    musicData.forEach((data) => appendMusicItem(data, musicList));
};

// Função para adicionar item à lista de músicas
const appendMusicItem = (data, musicList) => {
    const musicItem = document.createElement('div');
    musicItem.className = 'music-item';
    musicItem.dataset.id = data.id;

    const coverImage = document.createElement('img');
    coverImage.src = data.coverUrl || defaultCoverUrl;
    coverImage.className = 'cover-image';
    coverImage.dataset.audioUrl = data.mp3Url || data.wavUrl;
    coverImage.addEventListener('click', () => displayMusicDetails(data));

    musicItem.appendChild(coverImage);
    musicList.appendChild(musicItem);
};

// Função para embaralhar a lista de músicas (algoritmo de Fisher-Yates)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
    return array;
};

// Função para buscar e exibir músicas com limite de 16 e alternando o conjunto de músicas
export const fetchAndDisplayMusic = async (searchTerm = '') => {
    try {
        // Marca que a pesquisa foi feita
        searchActive = true;

        // Converte o termo de pesquisa para minúsculas
        const searchTermLower = searchTerm.toLowerCase();

        // Busca as músicas que pertencem ao usuário encontrado
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));
        const musicData = [];

        querySnapshot.forEach((docSnapshot) => {
            const data = { id: docSnapshot.id, ...docSnapshot.data() };

            // Verifica se a música corresponde ao critério de pesquisa
            if (
                data.title.toLowerCase().includes(searchTermLower) ||  // Verifica se o título da música corresponde ao termo de pesquisa
                (data.type && data.type.toLowerCase().includes(searchTermLower))  // Verifica se o tipo da música corresponde ao termo de pesquisa
            ) {
                musicData.push(data);
            }
        });

        // Embaralha a lista de músicas antes de exibir
        const shuffledMusicData = shuffleArray(musicData);

        // Se o offset for maior que o número de músicas, reinicia
        if (musicOffset >= shuffledMusicData.length) {
            musicOffset = 0;
        }

        // Limita a 16 músicas a partir do offset
        const limitedMusicData = shuffledMusicData.slice(musicOffset, musicOffset + 16);

        // Atualiza o offset para o próximo conjunto de músicas
        musicOffset += 16;

        // Exibe as músicas
        displayMusicList(limitedMusicData);

    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
    }
};

// Modifique a função `displayMusicDetails` para usar o novo método que busca todos os detalhes do usuário
export const displayMusicDetails = (data) => {
    document.getElementById('music-title').textContent = data.title;
    document.getElementById('music-type').textContent = data.type;
    document.getElementById('music-bpm').textContent = data.bpm;
    document.getElementById('music-note').textContent = data.note;
    document.getElementById('music-scale').textContent = data.scale;
    document.getElementById('music-price').textContent = data.price;
    document.getElementById('music-pix-key').textContent = data.pixKey;
    document.getElementById('music-cover').src = data.coverUrl || defaultCoverUrl;

    // Buscar nome, contato e foto de perfil do usuário
    fetchUserDetails(data.userId).then(({ userName, userContact, userProfilePic }) => {
        // Criar um link com o userId do usuário
        const usernameElement = document.getElementById('music-username');
        usernameElement.textContent = `Por: `;
        
        const userLink = document.createElement('a');
        userLink.href = `../user/index.html?userId=${data.userId}`;  // URL com o userId como parâmetro
        userLink.textContent = userName;
        userLink.style.textDecoration = "none";  // Remover sublinhado, caso queira
        userLink.style.color = "#007bff";  // Cor de link, pode personalizar
        usernameElement.appendChild(userLink);

        document.getElementById('music-contact').textContent = `Contato: ${userContact}`;
        document.getElementById('music-profile-pic').src = userProfilePic;  // Adiciona a foto de perfil
    });

    document.getElementById("musicDataModal").classList.add("show");
};

// Função para buscar o nome, contato e foto de perfil do usuário
const fetchUserDetails = async (userId) => {
    try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const userName = userData.name || "Usuário Desconhecido";
            const userContact = userData.contact || "Contato não disponível";
            const userProfilePic = userData.profilePicture || 'default2.jpg';  // Foto padrão se não houver

            return { userName, userContact, userProfilePic };
        } else {
            return { userName: "Usuário Desconhecido", userContact: "Contato não encontrado", userProfilePic: 'default2.jpg' };
        }
    } catch (error) {
        console.error("Erro ao buscar detalhes do usuário:", error);
        return { userName: "Erro ao buscar usuário", userContact: "Erro ao buscar contato", userProfilePic: 'default2.jpg' };
    }
};

// Função para limpar o estado de pesquisa e permitir a exibição novamente sem filtros
export const clearSearch = () => {
    searchActive = false;
    // Chama novamente a função sem o filtro de pesquisa
    fetchAndDisplayMusic();
};

// Função para configurar os botões
const setupButtons = () => {
    // Obtém os botões de navegação
    const randomizeLeftButton = document.getElementById('randomize-left');
    const randomizeRightButton = document.getElementById('randomize-right');

    // Adiciona eventos aos botões
    randomizeLeftButton.addEventListener('click', () => {
        // Ao clicar, chama a função que exibe as músicas com o novo offset
        fetchAndDisplayMusic();
    });

    randomizeRightButton.addEventListener('click', () => {
        // Ao clicar, chama a função que exibe as músicas com o novo offset
        fetchAndDisplayMusic();
    });
};

// Chama a função de configuração dos botões quando a página estiver carregada
document.addEventListener('DOMContentLoaded', setupButtons);

// Função para adicionar música ao Firestore
export const uploadMusicToFirestore = async (musicData) => {
    try {
        await addDoc(collection(firestore, 'uploads'), musicData);
        console.log("Música enviada com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar música:", error);
    }
};
