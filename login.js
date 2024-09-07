import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

var name = document.getElementById("name").value
var senha =  document.getElementById("pass").value


// Import the functions you need from the SDKs you need

// Your web app's Firebase configuration
const firebaseConfig = {  
    apiKey: "AIzaSyBCfM87Voj3fm8hyZOTF65UogN0cLm9sNE",

    authDomain: "mukeka-log.firebaseapp.com",
  
    projectId: "mukeka-log",
  
    storageBucket: "mukeka-log.appspot.com",
  
    messagingSenderId: "607712527884",
  
    appId: "1:607712527884:web:d0924896a169677cdb9029"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch data from Firestore
async function fetchData() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    let dataHtml = '';

    querySnapshot.forEach((doc) => {
      dataHtml += `<p>${doc.id} => ${JSON.stringify(doc.data())}</p>`;
    });

    document.getElementById('data').innerHTML = dataHtml;
  } catch (e) {
    console.error('Error fetching data: ', e);
  }
}

function loginjs(){
    fetchData(); 
}

