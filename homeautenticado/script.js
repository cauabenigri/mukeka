import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { getFirestore, doc, getDoc, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/mukekajasko.appspot.com/o/covers%2Fdefault.jpg?alt=media';

window.onload = async function() {
    const musicList = document.getElementById('music-list');
    const musicDataModal = document.getElementById("musicDataModal");
    const closeModalBtn = musicDataModal.querySelector(".close");

    try {
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));

        querySnapshot.forEach(async (docSnapshot) => {
            const data = docSnapshot.data(); // Pega os dados diretamente
            const coverUrl = data.coverUrl || 'https://via.placeholder.com/150';
            const audioUrl = data.mp3Url || data.wavUrl;

            const musicItem = document.createElement('div');
            musicItem.classList.add('music-item');

            const coverImage = document.createElement('img');
            coverImage.src = coverUrl;
            coverImage.classList.add('cover-image');
            coverImage.dataset.audioUrl = audioUrl;
            musicItem.appendChild(coverImage);

            // Adiciona o ID da música como atributo data-id
            musicItem.setAttribute('data-id', docSnapshot.id);  // Usando docSnapshot.id diretamente

            musicItem.addEventListener('click', () => {
                // Carregar os dados da música no modal
                const title = data.title;
                const type = data.type;  // Acesse o tipo de música
                const bpm = data.bpm;
                const note = data.note;
                const scale = data.scale;
                const price = data.price;
                const pixKey = data.pixKey;
                const cover = data.coverUrl || 'https://via.placeholder.com/150';
                const userId = data.userId;  // Obtém o userId da música

                // Preenche os dados no modal
                document.getElementById('music-title').textContent = title;
                document.getElementById('music-type').textContent = type;  // Exibe o tipo de música
                document.getElementById('music-bpm').textContent = bpm;
                document.getElementById('music-note').textContent = note;
                document.getElementById('music-scale').textContent = scale;
                document.getElementById('music-price').textContent = price;
                document.getElementById('music-pix-key').textContent = pixKey;
                document.getElementById('music-cover').src = cover;

                // Buscar o nome do usuário pelo userId
                fetchUserName(userId).then((userName) => {
                    document.getElementById('music-username').textContent = `Por: ${userName}`;
                });

                // Exibir o modal
                musicDataModal.classList.add("show");
            });

            musicList.appendChild(musicItem);
        });
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
    }
    
    // Fechar o modal de exibição de dados ao clicar no "X"
    closeModalBtn.addEventListener("click", () => {
        musicDataModal.classList.remove("show");
    });

    // Fechar o modal se o usuário clicar fora do modal
    window.onclick = function(event) {
        if (event.target === musicDataModal) {
            musicDataModal.classList.remove("show");
        }
    };
};

// Função para buscar o nome do usuário com base no userId
async function fetchUserName(userId) {
    try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.name || "Usuário Desconhecido";
        } else {
            return "Usuário Desconhecido"; // Se o usuário não for encontrado
        }
    } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
        return "Erro ao buscar usuário";
    }
}

// Função para exibir notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;

    // Limpar qualquer classe de tipo anterior
    notification.classList.remove('success', 'error');

    // Adicionar a classe correspondente ao tipo
    if (type === 'success') {
        notification.classList.add('success');
    } else if (type === 'error') {
        notification.classList.add('error');
    }

    notification.classList.remove('hidden'); // Mostra a notificação
    setTimeout(() => {
        notification.classList.add('hidden'); // Esconde após 3 segundos
    }, 1000);
}

const bpmInput = document.getElementById('bpm-input');
const bpmValueDisplay = document.getElementById('bpm-value');

bpmInput.addEventListener('input', function() {
    bpmValueDisplay.textContent = this.value; // Atualiza o texto do BPM exibido
});

function formatPrice(value) {
    value = value.replace(/[^0-9]/g, ''); // Remove tudo que não é número
    if (value) {
        value = (parseFloat(value) / 100).toFixed(2); // Converte para formato de moeda
        return `R$ ${value.replace('.', ',')}`; // Retorna o preço formatado
    } else {
        return 'R$ 0,00'; // Valor padrão
    }
}
