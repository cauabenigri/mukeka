// firebase-config.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

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

export { storage, firestore, auth };
