import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Função para obter o ID da música da URL
function getMusicIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

window.onload = async function() {
    const musicId = getMusicIdFromURL();
    
    if (!musicId) {
        alert('ID da música não encontrado.');
        return;
    }

    try {
        const musicDoc = await getDoc(doc(firestore, 'uploads', musicId));

        if (musicDoc.exists()) {
            const musicData = musicDoc.data();

            // Preenchendo os dados da música
            document.getElementById('music-title').textContent = musicData.title || 'Título não disponível';
            document.getElementById('music-cover').src = musicData.coverUrl || 'https://via.placeholder.com/150';
            document.getElementById('music-bpm').textContent = 'BPM: ' + (musicData.bpm || 'BPM não disponível');
            document.getElementById('music-note').textContent = 'Escala: ' + (musicData.note || 'Nota não disponível') + ' ' + (musicData.scale || 'Escala não disponível');
            document.getElementById('music-price').textContent = 'Preço: ' + (musicData.price || 'Preço não disponível');
            document.getElementById('music-pix').textContent = 'Pix: ' + (musicData.pixKey || 'Chave Pix não disponível');


            // Exibir o nome do criador
            const musicCreator = document.getElementById('music-creator');
            const creatorLink = document.getElementById('creator-link');

            if (musicData.userId) {
                // Busca o documento do usuário para obter o nome
                const userDoc = await getDoc(doc(firestore, 'users', musicData.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const creatorName = userData.name || 'Nome não disponível'; // Obter o nome do usuário
                    creatorLink.textContent = 'Criador: ' + creatorName; // Exibir o nome do criador
                    creatorLink.href = 'user.html?uid=' + musicData.userId; // Redireciona para a página do criador
                } else {
                    musicCreator.textContent = 'Criador: Não disponível'; // Mensagem caso o documento do usuário não exista
                }
            } else {
                musicCreator.textContent = 'Criador: Não disponível'; // Mensagem caso o userId não esteja disponível
            }

        } else {
            alert('Música não encontrada.');
        }
    } catch (error) {
        console.error('Erro ao buscar a música:', error);
    }
};
