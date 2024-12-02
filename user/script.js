import { 
    getFirestore, 
    collection, 
    getDocs,
    getDoc,
    doc,
    addDoc  // Adicionando a função addDoc
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';



import { storage, firestore, auth } from './firebase-config.js';

// Importando os métodos necessários do Firebase Storage
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';


import { checkAuth, fetchPerfilInfo, enableEditMode, saveProfileChanges } from './auth-profile.js';
import { fetchAndDisplayMusic, uploadMusicToFirestore } from './music.js';
import { setupModals } from './modals.js';  // Importe a função de setup dos modais
import './search.js';




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

    const fileInput = document.getElementById('file-input');
const fileInputLabel = document.getElementById('file-input-label');

// Evento para quando o arquivo for selecionado
fileInput.addEventListener('change', function() {
    if (fileInput.files && fileInput.files[0]) {
        const fileName = fileInput.files[0].name;
        fileInputLabel.textContent = fileName; // Atualiza o label para o nome do arquivo
    } else {
        fileInputLabel.textContent = "Áudio"; // Retorna ao nome original caso não haja arquivo
    }
});

// Função para exibir notificações (para facilitar no futuro)
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;

    notification.classList.remove('success', 'error');

    if (type === 'success') {
        notification.classList.add('success');
    } else if (type === 'error') {
        notification.classList.add('error');
    }

    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000); // Duração de 5 segundos
}

    // Handle Upload Form Submission
    const uploadFormHandler = async (event) => {
        event.preventDefault();

        const user = auth.currentUser;
        if (!user) return showNotification('Por favor, faça login antes de enviar.', 'error');

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
            return showNotification('Por favor, selecione um arquivo de áudio válido.', 'error');
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

            showNotification('Música enviada com sucesso!', 'sucess');
            window.location.reload();
        } catch (error) {
            console.error("Erro ao enviar música:", error);
            showNotification('Erro ao enviar a música.', 'error');
        }
    };














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




    
// Passa os modais para a função de configuração
setupModals(uploadModal, musicDataModal, perfilModal, fetchPerfilInfo);

    setupCoverPreview();
    document.getElementById('upload-form').addEventListener('submit', uploadFormHandler);
    document.getElementById("edit-btn").addEventListener("click", enableEditMode);
    document.getElementById("save-btn").addEventListener("click", saveProfileChanges);
    fetchAndDisplayMusic();




    
        
});


