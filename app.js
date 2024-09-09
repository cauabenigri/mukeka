// Configuração do Firebase

import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Sua configuração do Firebase
const firebaseConfig = {

    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",

    authDomain: "mukekajasko.firebaseapp.com",

    projectId: "mukekajasko",

    storageBucket: "mukekajasko.appspot.com",

    messagingSenderId: "436758047827",

    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"

  };


// Inicializar o Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const storageRef = storage.ref();

// Função para realizar o upload do arquivo MP3
document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevenir a página de recarregar ao submeter o formulário

    const file = document.getElementById('file-input').files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo MP3.");
        return;
    }

    const fileRef = storageRef.child('mp3s/' + file.name); // Caminho para armazenar o arquivo

    // Iniciar o upload do arquivo
    fileRef.put(file).then((snapshot) => {
        alert('Upload concluído com sucesso!');
        
        // Após o upload, pegar a URL de download
        snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log('URL do arquivo:', downloadURL);
        });
    }).catch((error) => {
        console.error('Erro no upload:', error);
    });
});