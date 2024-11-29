import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Carregando a biblioteca js-cookie
// Adicione a biblioteca js-cookie no seu HTML:
// <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>

const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Verificação de login ao carregar a página
window.onload = function () {
    if (Cookies.get('auth') === 'loggedIn') {
        window.location.href = '../homeautenticado/index.html'; // Redireciona se o usuário estiver autenticado
    }
};





// Função para carregar música aleatória
async function loadRandomMusic(container, audio) {
    try {
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));
        const musicDocs = querySnapshot.docs;

        if (musicDocs.length > 0) {
            const randomIndex = Math.floor(Math.random() * musicDocs.length);
            const randomMusic = musicDocs[randomIndex];
            const data = randomMusic.data();
            const coverUrl = data.coverUrl || 'https://via.placeholder.com/300';
            const audioUrl = data.mp3Url || data.wavUrl;

            // Faz a capa desaparecer com fade-out
            const image = container.querySelector('img');
            if (image) {
                image.classList.add('fade-out');
            }

            // Aguarda a transição de fade-out para depois atualizar a música
            setTimeout(() => {
                // Atualiza a capa da música
                container.innerHTML = `<img src="${coverUrl}" alt="Música Aleatória" class="cover-image fade-in">`;
                const newImage = container.querySelector('img');
                newImage.classList.add('fade-in'); // Aplica fade-in

                // Atualiza o áudio
                audio.src = audioUrl;
                audio.load();
            }, 1000); // Espera a animação de fade-out terminar antes de atualizar (duração maior para transição mais suave)

        } else {
            container.innerHTML = 'Nenhuma música encontrada.';
        }
    } catch (error) {
        console.error('Erro ao carregar música:', error);
        container.innerHTML = 'Erro ao carregar música.';
    }
}

// Função para alternar entre a música e pausar a outra
function toggleMusic(audio, otherAudio, container, otherContainer) {
    if (audio.paused) {
        otherAudio.pause();
        otherContainer.classList.remove('playing');
        audio.play();
        container.classList.add('playing');
    } else {
        audio.pause();
        container.classList.remove('playing');
    }
}

// Função para mudar a música automaticamente se a atual estiver pausada
function autoChangeMusic(audio, container) {
    if (audio.paused) {
        setTimeout(async () => {
            await loadRandomMusic(container, audio);
        }, 6000); // Troca a música após 6 segundos, para dar tempo da transição de fade
    }
}

// Eventos de clique nos contêineres
document.addEventListener('DOMContentLoaded', () => {
    const leftMusicContainer = document.getElementById('left-random-music');
    const rightMusicContainer = document.getElementById('right-random-music');
    const leftAudio = new Audio();
    const rightAudio = new Audio();

    leftMusicContainer.addEventListener('click', () => toggleMusic(leftAudio, rightAudio, leftMusicContainer, rightMusicContainer));
    rightMusicContainer.addEventListener('click', () => toggleMusic(rightAudio, leftAudio, rightMusicContainer, leftMusicContainer));

    // Carregar músicas iniciais
    loadRandomMusic(leftMusicContainer, leftAudio);
    loadRandomMusic(rightMusicContainer, rightAudio);

    // Trocar músicas automaticamente se estiverem pausadas
    setInterval(() => {
        autoChangeMusic(leftAudio, leftMusicContainer);
        autoChangeMusic(rightAudio, rightMusicContainer);
    }, 6000); // Verifica a cada 6 segundos

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const openLoginBtn = document.getElementById('open-login');
    const openRegisterBtn = document.getElementById('open-register');
    const closeLoginBtn = document.getElementById('close-login');
    const closeRegisterBtn = document.getElementById('close-register');

    // Abre o modal de login
    openLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    // Fecha o modal de login
    closeLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    // Abre o modal de registro
    openRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });

    // Fecha o modal de registro
    closeRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });

    // Fecha os modais ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Função de login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('login-name').value;
        const pass = document.getElementById('login-pass').value;

        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('name', '==', name));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showNotification('Usuário não encontrado.', 'error');
                return;
            }

            const email = querySnapshot.docs[0].data().email;
            await signInWithEmailAndPassword(auth, email, pass);
            showNotification('Login bem-sucedido!', 'success');
            loginModal.style.display = 'none';

            // Cria o cookie para manter o usuário autenticado
            Cookies.set('auth', 'loggedIn', { expires: 7 }); // Cookie expira em 7 dias

            // Redireciona para a página autenticada
            window.location.href = '../homeautenticado/index.html';
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showNotification('Falha no login. Verifique suas credenciais.', 'error');
        }
    });

    // Função de registro
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const name = document.getElementById('register-name').value;
        const pass = document.getElementById('register-pass').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            await setDoc(doc(firestore, 'users', user.uid), {
                email: email,
                name: name
            });

            showNotification('Registro bem-sucedido!', 'success');
        } catch (error) {
            console.error('Erro ao registrar:', error);
            showNotification('Falha no registro. Tente novamente.', 'error');

        }
    });


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

// Exemplo de uso no login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showNotification('Usuário não encontrado.', 'error');
            return;
        }

        const email = querySnapshot.docs[0].data().email;
        await signInWithEmailAndPassword(auth, email, pass);
        showNotification('Login bem-sucedido!', 'success');
        loginModal.style.display = 'none';

        Cookies.set('auth', 'loggedIn', { expires: 7 });
        window.location.href = '../homeautenticado/index.html';
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showNotification('Falha no login. Tente novamente.', 'error');
    }
});s



    
});
