import { 
    initializeApp 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { 
    getStorage, ref, uploadBytesResumable, getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { 
    getFirestore, doc, getDoc, collection, getDocs, addDoc, updateDoc 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { 
    getAuth 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

// Firebase Initialization
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

// Default Cover Image URL
const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/mukekajasko.appspot.com/o/covers%2Fdefault.jpg?alt=media';

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", async () => {
    const musicList = document.getElementById('music-list');
    const musicDataModal = document.getElementById("musicDataModal");
    const uploadModal = document.getElementById("myModal");
    const perfilModal = document.getElementById("perfilModal");
    const progressBar = document.getElementById('progress-bar');
    const coverPreview = document.getElementById('cover-preview');
    const bpmValueDisplay = document.getElementById('bpm-value');
    const bpmInput = document.getElementById('bpm-input');

    // Autenticação do Usuário
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Redireciona para a página de login se o usuário não estiver autenticado
            window.location.href = '../home/index.html';
        } else {
            console.log(`Usuário autenticado: ${user.email}`);
        }
    });

    // Modal Setup
    const setupModals = () => {
        const closeModal = (modal) => modal.classList.remove("show");
        const openModal = (modal) => modal.classList.add("show");

        document.getElementById("openModalBtn").addEventListener("click", () => openModal(uploadModal));
        uploadModal.querySelector(".close").addEventListener("click", () => closeModal(uploadModal));
        musicDataModal.querySelector(".close").addEventListener("click", () => closeModal(musicDataModal));

        // Configuração do modal de perfil
        const openPerfilBtn = document.getElementById("openPerfil");
        openPerfilBtn.addEventListener("click", () => {
            openModal(perfilModal);
            fetchPerfilInfo(); // Função para carregar dados do perfil
        });

        perfilModal.querySelector(".close").addEventListener("click", () => closeModal(perfilModal));

        window.addEventListener("click", (event) => {
            if (event.target === musicDataModal) closeModal(musicDataModal);
            if (event.target === perfilModal) closeModal(perfilModal);
        });
    };

    // Função para buscar informações do perfil
    const fetchPerfilInfo = async () => {
        const user = auth.currentUser;
        if (!user) {
            document.getElementById("perfil-info").textContent = "Usuário não autenticado.";
            return;
        }

        try {
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById("perfil-name").textContent = userData.name || "N/A";
                document.getElementById("perfil-email").textContent = user.email || "N/A";
            } else {
                document.getElementById("perfil-info").textContent = "Informações de perfil não encontradas.";
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            document.getElementById("perfil-info").textContent = "Erro ao carregar informações do perfil.";
        }
    };

    // Fetch and Display Music
    const fetchAndDisplayMusic = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'uploads'));
            querySnapshot.forEach((docSnapshot) => appendMusicItem(docSnapshot.data(), docSnapshot.id));
        } catch (error) {
            console.error('Erro ao buscar músicas:', error);
        }
    };

    // Append Music Item to List
    const appendMusicItem = (data, id) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.dataset.id = id;

        const coverImage = document.createElement('img');
        coverImage.src = data.coverUrl || defaultCoverUrl;
        coverImage.className = 'cover-image';
        coverImage.dataset.audioUrl = data.mp3Url || data.wavUrl;
        coverImage.addEventListener('click', () => displayMusicDetails(data));

        musicItem.appendChild(coverImage);
        musicList.appendChild(musicItem);
    };

    // Display Music Details in Modal
    const displayMusicDetails = (data) => {
        document.getElementById('music-title').textContent = data.title;
        document.getElementById('music-type').textContent = data.type;
        document.getElementById('music-bpm').textContent = data.bpm;
        document.getElementById('music-note').textContent = data.note;
        document.getElementById('music-scale').textContent = data.scale;
        document.getElementById('music-price').textContent = data.price;
        document.getElementById('music-pix-key').textContent = data.pixKey;
        document.getElementById('music-cover').src = data.coverUrl || defaultCoverUrl;

        fetchUserName(data.userId).then((userName) => {
            document.getElementById('music-username').textContent = `Por: ${userName}`;
        });

        musicDataModal.classList.add("show");
    };

    // Fetch User Name by ID
    const fetchUserName = async (userId) => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            return userDoc.exists() ? userDoc.data().name || "Usuário Desconhecido" : "Usuário Desconhecido";
        } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
            return "Erro ao buscar usuário";
        }
    };

    // Cover Preview Setup
    const setupCoverPreview = () => {
        const coverInput = document.getElementById('cover-input');
        coverPreview.addEventListener('click', () => coverInput.click());
        coverInput.addEventListener('change', () => {
            const file = coverInput.files[0];
            const reader = new FileReader();
            if (file) {
                reader.onload = (e) => (coverPreview.src = e.target.result);
                reader.readAsDataURL(file);
            } else {
                coverPreview.src = defaultCoverUrl;
            }
        });
    };

    // Handle Upload Form Submission
    const uploadFormHandler = async (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        if (!user) return alert('Por favor, faça login antes de enviar.');

        const fileInput = document.getElementById('file-input');
        const coverInput = document.getElementById('cover-input');
        const title = document.getElementById('title-input').value;
        const type = document.getElementById('music-input').value;
        const bpm = document.getElementById('bpm-input').value;
        const note = document.getElementById('note-input').value;
        const scale = document.getElementById('scale-input').value;
        const price = document.getElementById('price-input').value;
        const pixKey = document.getElementById('pix-input').value;

        if (!fileInput.files[0] || !['audio/mpeg', 'audio/wav'].includes(fileInput.files[0].type)) {
            return alert('Por favor, selecione um arquivo de áudio válido.');
        }

        const uniqueId = Date.now().toString();
        const mp3Ref = ref(storage, `mp3/${uniqueId}.${fileInput.files[0].type === 'audio/mpeg' ? 'mp3' : 'wav'}`);
        const coverRef = ref(storage, `covers/${uniqueId}.jpg`);
        const coverFile = coverInput.files[0] || await fetch(defaultCoverUrl).then((res) => res.blob());

        try {
            const mp3Upload = uploadBytesResumable(mp3Ref, fileInput.files[0]);
            mp3Upload.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = `${progress}%`;
            });
            await mp3Upload;

            await uploadBytesResumable(coverRef, coverFile);

            const mp3Url = await getDownloadURL(mp3Ref);
            const coverUrl = await getDownloadURL(coverRef);

            await addDoc(collection(firestore, 'uploads'), {
                title,
                type,
                bpm,
                note,
                scale,
                price,
                pixKey,
                userId: user.uid,
                mp3Url,
                coverUrl,
            });

            alert('Música enviada com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error("Erro ao enviar música:", error);
            alert('Erro ao enviar a música.');
        }
    };

    // Ativar edição do perfil
    const enableEditMode = () => {
        document.getElementById("perfil-name").contentEditable = true;
        document.getElementById("perfil-email").contentEditable = true;
        document.getElementById("save-btn").style.display = "inline-block";
        document.getElementById("edit-btn").style.display = "none";
    };

    // Salvar alterações do perfil
    const saveProfileChanges = async () => {
        const user = auth.currentUser;
        const newName = document.getElementById("perfil-name").textContent;
        const newEmail = document.getElementById("perfil-email").textContent;

        if (!user) {
            alert("Usuário não autenticado.");
            return;
        }

        try {
            const userRef = doc(firestore, "users", user.uid);
            await updateDoc(userRef, {
                name: newName,
                email: newEmail
            });

            // Atualiza a UI
            document.getElementById("perfil-name").textContent = newName;
            document.getElementById("perfil-email").textContent = newEmail;

            // Finaliza edição
            document.getElementById("save-btn").style.display = "none";
            document.getElementById("edit-btn").style.display = "inline-block";

            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            alert("Erro ao salvar perfil.");
        }
    };

    // Inicialização
    setupModals();
    setupCoverPreview();
    document.getElementById('upload-form').addEventListener('submit', uploadFormHandler);
    document.getElementById("edit-btn").addEventListener("click", enableEditMode);
    document.getElementById("save-btn").addEventListener("click", saveProfileChanges);
    fetchAndDisplayMusic();
});
