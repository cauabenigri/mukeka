import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Defina a configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_3Uto71G3THDD3FZu_XOceGOanCz47sw",
    authDomain: "mukekajasko.firebaseapp.com",
    projectId: "mukekajasko",
    storageBucket: "mukekajasko.appspot.com",
    messagingSenderId: "436758047827",
    appId: "1:436758047827:web:6d794e8ff85f7c7bf46aa6"
};

// Inicializar o Firebase App
const app = initializeApp(firebaseConfig);  // Isso é essencial para inicializar o Firebase

// Função para criar cookies
export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

// Função para obter cookies
export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return '';
}

// Função de login
export const login = async (name, pass) => {
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Usuário não encontrado.');
        }

        const email = querySnapshot.docs[0].data().email;
        await signInWithEmailAndPassword(auth, email, pass);
        return { success: true, message: 'Login bem-sucedido!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
// Função de registro
export const register = async (email, name, pass) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Adicionando o campo 'contact' com o valor "contato"
        await setDoc(doc(firestore, 'users', user.uid), {
            email: email,
            name: name,
            contact: 'contato'  // Campo contact com o valor fixo
        });

        return { success: true, message: 'Registro bem-sucedido!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
