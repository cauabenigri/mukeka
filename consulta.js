import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Elementos da interface
const userIdInput = document.getElementById('userId-input');
const searchButton = document.getElementById('search-btn');
const userDataDiv = document.getElementById('user-data');
const userNameSpan = document.getElementById('user-name');

// Função para consultar os dados do usuário
const getUserData = async (userId) => {
    try {
        // Referência ao documento do usuário
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            // Dados do usuário encontrados, exibe o nome na tela
            const data = userDoc.data();
            userNameSpan.textContent = data.name || 'Não disponível';
            userDataDiv.style.display = 'block'; // Exibe a div com o nome
        } else {
            alert('Usuário não encontrado!');
            userDataDiv.style.display = 'none'; // Esconde se não encontrar
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        alert('Erro ao buscar dados do usuário!');
    }
};

// Adiciona evento ao botão de consulta
searchButton.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (userId) {
        getUserData(userId); // Faz a consulta
    } else {
        alert('Por favor, insira um User ID.');
    }
});
