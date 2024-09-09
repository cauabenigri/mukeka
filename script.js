import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';
import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

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

window.onload = async function() {
    const musicList = document.getElementById('music-list');
    let currentAudio = null;
    let currentCoverImage = null;

    try {
        const querySnapshot = await getDocs(collection(firestore, 'uploads'));
        let coverUrls = [];
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.coverUrl) {
                coverUrls.push(data.coverUrl);
            }
        });

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

            const audio = document.createElement('audio');
            audio.src = audioUrl;
            audio.classList.add('audio-player');
            musicItem.appendChild(audio);

            coverImage.addEventListener('click', () => {
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentCoverImage.classList.remove('playing');
                }

                if (audio.paused) {
                    audio.play();
                    coverImage.classList.add('playing');
                    currentAudio = audio;
                    currentCoverImage = coverImage;
                } else {
                    audio.pause();
                    coverImage.classList.remove('playing');
                    currentAudio = null;
                    currentCoverImage = null;
                }
            });

            musicList.appendChild(musicItem);
        });
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
    }

    // Script para abrir e fechar o modal
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

    // Código de upload para o modal
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const coverInput = document.getElementById('cover-input');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        const cover = coverInput.files[0];
        const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/mukekajasko.appspot.com/o/covers%2Fdefault.jpg?alt=media';

        if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
            const uniqueId = Date.now().toString();

            const storageRefMP3 = ref(storage, 'mp3/' + uniqueId + (file.type === 'audio/mpeg' ? '.mp3' : '.wav'));
            const storageRefCover = ref(storage, 'covers/' + uniqueId + '.jpg');

            const uploadTaskMP3 = uploadBytesResumable(storageRefMP3, file);
            let uploadTaskCover;

            if (cover) {
                uploadTaskCover = uploadBytesResumable(storageRefCover, cover);
            } else {
                uploadTaskCover = uploadBytesResumable(storageRefCover, fetch(defaultCoverUrl).then(response => response.blob()));
            }

            uploadTaskMP3.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = progress + '%';
                    progressText.textContent = 'Progresso do upload: ' + Math.round(progress) + '%';
                }, 
                (error) => {
                    console.error('Erro no upload:', error);
                }, 
                async () => {
                    const downloadURLMP3 = await getDownloadURL(uploadTaskMP3.snapshot.ref);
                    const downloadURLCover = cover ? await getDownloadURL(uploadTaskCover.snapshot.ref) : defaultCoverUrl;

                    try {
                        await addDoc(collection(firestore, 'uploads'), {
                            mp3Url: downloadURLMP3,
                            coverUrl: downloadURLCover,
                            uniqueId: uniqueId,
                            timestamp: Date.now()
                        });
                        alert('Upload concluído!');
                    } catch (error) {
                        console.error('Erro ao salvar informações no Firestore:', error);
                    }
                }
            );
        } else {
            alert('Por favor, selecione um arquivo MP3 ou WAV e uma capa válida.');
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const player = new Plyr('#player');
    
        function showPlayer(audioUrl, title) {
            const playerElement = document.getElementById('player');
            playerElement.src = audioUrl;
            playerElement.play();
            document.getElementById('music-player').style.display = 'flex';
        }
    
        document.querySelectorAll('.cover-image').forEach(coverImage => {
            coverImage.addEventListener('click', function() {
                const audioUrl = this.dataset.audioUrl;
                showPlayer(audioUrl, 'Título da Música'); // Atualize com título real
            });
        });
    });
    
    
}
