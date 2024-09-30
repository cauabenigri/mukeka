import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';
import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

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
    
    try {
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));
        const coverUrls = querySnapshot.docs.map(doc => doc.data().coverUrl).filter(url => url);
        const defaultCover = coverUrls.length > 0 ? coverUrls[0] : 'https://via.placeholder.com/150';
        
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            const coverUrl = data.coverUrl || defaultCover;
            const audioUrl = data.mp3Url || data.wavUrl;

            const musicItem = document.createElement('div');
            musicItem.classList.add('music-item');

            const coverImage = document.createElement('img');
            coverImage.src = coverUrl;
            coverImage.classList.add('cover-image');
            coverImage.dataset.audioUrl = audioUrl;
            musicItem.appendChild(coverImage);

            // Adiciona o ID da música como atributo data-id
            musicItem.setAttribute('data-id', doc.id); // Obtém o ID do documento do Firestore

            musicItem.addEventListener('click', () => {
                // Redireciona para a página da música com o ID
                window.location.href = `music.html?id=${doc.id}`;
            });

            musicList.appendChild(musicItem);
        });
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
    }

    // Mostrar o botão de upload
    document.getElementById("openModalBtn").style.display = 'block';

    document.getElementById("openModalBtn").addEventListener("click", function() {
        const modal = document.getElementById("myModal");
        modal.classList.add("show");
        this.classList.add("disabled");
    });

    document.querySelector(".close").addEventListener("click", function() {
        const modal = document.getElementById("myModal");
        modal.classList.remove("show");
        document.getElementById("openModalBtn").classList.remove("disabled");
    });

    window.onclick = function(event) {
        const modal = document.getElementById("myModal");
        if (event.target === modal) {
            modal.classList.remove("show");
            document.getElementById("openModalBtn").classList.remove("disabled");
        }
    }

    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const coverInput = document.getElementById('cover-input');
    const coverPreview = document.getElementById('cover-preview');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // Adiciona o clique na capa para abrir o seletor de arquivos
    coverPreview.addEventListener('click', () => {
        coverInput.click();
    });

    coverInput.addEventListener('change', () => {
        const file = coverInput.files[0];
        const reader = new FileReader();
        if (file) {
            reader.onload = function(e) {
                coverPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            coverPreview.src = defaultCoverUrl; // Retorna para a capa padrão se não houver arquivo
        }
    });

    // Adiciona um ouvinte de eventos para o formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const file = fileInput.files[0];
        const cover = coverInput.files[0];
        const title = document.getElementById('title-input').value;
        const bpm = document.getElementById('bpm-input').value;
        const note = document.getElementById('note-input').value;
        const scale = document.getElementById('scale-input').value;
        const rawPrice = document.getElementById('price-input').value;
        const pixKey = document.getElementById('pix-input').value;

        const price = formatPrice(rawPrice);

        if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
            const uniqueId = Date.now().toString();
            const storageRefMP3 = ref(storage, 'mp3/' + uniqueId + (file.type === 'audio/mpeg' ? '.mp3' : '.wav'));
            const storageRefCover = ref(storage, 'covers/' + uniqueId + '.jpg');

            const uploadTaskMP3 = uploadBytesResumable(storageRefMP3, file);
            const uploadTaskCover = cover ? uploadBytesResumable(storageRefCover, cover) : uploadBytesResumable(storageRefCover, fetch(defaultCoverUrl).then(response => response.blob()));

            uploadTaskMP3.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = 'Progresso do upload: ' + Math.round(progress) + '%';
                }, 
                (error) => {
                    console.error('Erro no upload do MP3:', error);
                }, 
                async () => {
                    try {
                        const downloadURLMP3 = await getDownloadURL(uploadTaskMP3.snapshot.ref);
                        const downloadURLCover = cover ? await getDownloadURL(uploadTaskCover.snapshot.ref) : defaultCoverUrl;

                        await addDoc(collection(firestore, 'uploads'), {
                            mp3Url: downloadURLMP3,
                            coverUrl: downloadURLCover,
                            title: title,
                            bpm: bpm,
                            note: note,
                            scale: scale,
                            price: price,  // Preço formatado
                            pixKey: pixKey,
                            uniqueId: uniqueId,
                            userId: user.uid,  // Armazena o ID do usuário
                            timestamp: Date.now()
                        });

                        alert('Upload concluído!');
                        form.reset();
                        coverPreview.src = defaultCoverUrl; // Reseta para a capa padrão
                        progressBar.style.width = '0%';
                        progressText.textContent = 'Progresso do upload: 0%';
                    } catch (error) {
                        console.error('Erro ao salvar informações no Firestore:', error);
                    }
                }
            );

            uploadTaskCover.on('state_changed', 
                null, 
                (error) => {
                    console.error('Erro no upload da capa:', error);
                }
            );
        } else {
            alert('Por favor, selecione um arquivo de áudio válido.');
        }
    });

    const priceInput = document.getElementById('price-input');

    // Adiciona um ouvinte de eventos para o campo de preço
    priceInput.addEventListener('input', function(e) {
        let value = e.target.value;

        // Remove letras e formata o valor para R$
        value = value.replace(/[^0-9]/g, ''); // Remove tudo que não é número
        if (value) {
            value = (parseFloat(value) / 100).toFixed(2); // Converte para formato de moeda
            e.target.value = `R$ ${value.replace('.', ',')}`; // Atualiza o campo com a formatação
        } else {
            e.target.value = 'R$ 0,00'; // Valor padrão
        }
    });
};

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
