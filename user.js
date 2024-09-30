import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

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

// Função para obter o UID do usuário da URL
function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid');
}

window.onload = async function() {
    const userId = getUserIdFromURL();
    
    if (!userId) {
        alert('ID do usuário não encontrado.');
        return;
    }

    try {
        // Obter informações do usuário
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('user-name').textContent = userData.name || 'Nome não disponível';
        } else {
            alert('Usuário não encontrado.');
            return;
        }

        // Obter músicas enviadas pelo usuário
        const musicQuery = query(collection(firestore, 'uploads'), where('userId', '==', userId));
        const musicSnapshot = await getDocs(musicQuery);
        const musicListDiv = document.getElementById('music-list');

        if (!musicSnapshot.empty) {
            musicSnapshot.forEach((doc) => {
                const musicData = doc.data();
                const musicItem = document.createElement('div');
                
                // Aqui é onde você constrói a estrutura HTML para cada música
                musicItem.innerHTML = `
                    <div class="music-item">
                        <img src="${musicData.coverUrl || 'https://via.placeholder.com/150'}" alt="Capa da música" class="music-cover" />
                        <h3>${musicData.title || 'Título não disponível'}</h3>
                        <p>BPM: ${musicData.bpm || 'BPM não disponível'}</p>
                        <p>Preço: ${musicData.price || 'Preço não disponível'}</p>
                        <audio controls>
                            <source src="${musicData.mp3Url || musicData.wavUrl || ''}" type="audio/mpeg">
                            Seu navegador não suporta o elemento de áudio.
                        </audio>
                    </div>
                `;
                musicListDiv.appendChild(musicItem);
            });
        } else {
            musicListDiv.innerHTML = '<p>Nenhuma música encontrada.</p>';
        }

    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
    }
};
