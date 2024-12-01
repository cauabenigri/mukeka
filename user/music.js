import { getDocs, collection, doc, getDoc, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { storage, firestore } from './firebase-config.js';

const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/mukekajasko.appspot.com/o/covers%2Fdefault.jpg?alt=media';

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

// Função para buscar nome, contato e foto de perfil do usuário
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

// Função para exibir os detalhes da música
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
        const profilePicElement = document.getElementById('music-profile-pic'); // Elemento de imagem de perfil
        profilePicElement.src = userProfilePic || 'default2.jpg';  // Verifique o caminho da imagem
    });

    document.getElementById("musicDataModal").classList.add("show");
};

// Função para buscar e exibir as músicas do usuário específico
export const fetchAndDisplayMusic = async () => {
    try {
        // Obtém o userId da URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');  // Recupera o userId do link

        if (!userId) {
            console.error("userId não fornecido na URL.");
            return;
        }

        // Busca as músicas que pertencem ao usuário específico
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));
        const musicData = [];

        querySnapshot.forEach((docSnapshot) => {
            const data = { id: docSnapshot.id, ...docSnapshot.data() };
            
            // Adiciona apenas as músicas que pertencem ao userId da URL
            if (data.userId === userId) {
                musicData.push(data);
            }
        });

        // Limita a 16 músicas
        const limitedMusicData = musicData.slice(0, 16);
        displayMusicList(limitedMusicData);

    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
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
        // Ao clicar, chama a função que exibe as músicas sem filtro
        fetchAndDisplayMusic();
    });

    randomizeRightButton.addEventListener('click', () => {
        // Ao clicar, chama a função que exibe as músicas sem filtro
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
