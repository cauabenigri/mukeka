import { auth, storage, firestore } from './firebase-config.js';
import { getDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js';

// Função para verificar se o usuário está autenticado
export const checkAuth = () => {
    const user = auth.currentUser; // Obtém o usuário atual
    if (!user) {
        console.log("Usuário não autenticado.");
        return false;  // Retorna false se o usuário não estiver autenticado
    }
    return true;  // Retorna true se o usuário estiver autenticado
};



// Função para buscar informações do perfil
export const fetchPerfilInfo = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log("Usuário não autenticado. Não é possível carregar as informações do perfil.");
        document.getElementById("perfil-info").textContent = "Usuário não autenticado.";
        return;
    }

    try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById("perfil-name").textContent = userData.name || "N/A";
            document.getElementById("perfil-email").textContent = user.email || "N/A";
            document.getElementById("perfil-contact").textContent = userData.contact || "N/A";
            // Exibe a foto de perfil
            const profilePicUrl = userData.profilePicture || 'default2.jpg';
            document.getElementById("perfil-picture").src = profilePicUrl;
        } else {
            document.getElementById("perfil-info").textContent = "Informações de perfil não encontradas.";
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        document.getElementById("perfil-info").textContent = "Erro ao carregar informações do perfil.";
    }
};

// Função para ativar o modo de edição do perfil
export const enableEditMode = () => {
    document.getElementById("perfil-name").contentEditable = true;
    document.getElementById("perfil-email").contentEditable = true;
    document.getElementById("perfil-contact").contentEditable = true;
    document.getElementById("save-btn").style.display = "inline-block";
    document.getElementById("edit-btn").style.display = "none";
};

// Função para salvar as alterações no perfil
export const saveProfileChanges = async () => {
    const user = auth.currentUser;
    const newName = document.getElementById("perfil-name").textContent;
    const newEmail = document.getElementById("perfil-email").textContent;
    const newContact = document.getElementById("perfil-contact").textContent;

    if (!user) {
        console.log("Tentativa de salvar perfil falhou: Usuário não autenticado.");
        showNotification("Usuário não autenticado.", 'error');
        return;
    }

    try {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
            name: newName,
            email: newEmail,
            contact: newContact
        });

        // Atualiza a UI
        document.getElementById("perfil-name").textContent = newName;
        document.getElementById("perfil-email").textContent = newEmail;
        document.getElementById("perfil-contact").textContent = newContact;

        // Finaliza edição
        document.getElementById("save-btn").style.display = "none";
        document.getElementById("edit-btn").style.display = "inline-block";

        showNotification("Perfil atualizado com sucesso!", 'success');
    } catch (error) {
        console.error("Erro ao salvar alterações:", error);
        showNotification("Erro ao salvar perfil.", 'error');
    }
};

// Função para enviar foto de perfil
export const uploadProfilePicture = async (file) => {
    const user = auth.currentUser;
    if (!user) {
        console.log("Usuário não autenticado. Não é possível enviar foto.");
        showNotification("Usuário não autenticado.", 'error');
        return;
    }

    try {
        // Cria uma referência para o arquivo no Firebase Storage
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Monitora o progresso do upload
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Progresso do upload: ' + progress + '%');
            },
            (error) => {
                console.error('Erro no upload:', error);
                showNotification('Erro ao fazer upload da foto.', 'error');
            },
            async () => {
                // Depois que o upload for concluído, obtemos a URL da imagem
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                // Salva a URL da imagem no Firestore
                const userRef = doc(firestore, "users", user.uid);
                await updateDoc(userRef, {
                    profilePicture: downloadURL  // Armazena a URL da foto no Firestore
                });

                // Atualiza a foto do perfil na interface do usuário
                document.getElementById("perfil-picture").src = downloadURL;

                showNotification('Foto de perfil atualizada com sucesso!', 'success');
            }
        );
    } catch (error) {
        console.error('Erro ao enviar foto de perfil:', error);
        showNotification('Erro ao enviar foto de perfil.', 'error');
    }
};

// Função para lidar com o upload da foto ao clicar na imagem
const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadProfilePicture(file);
        }
    };
    input.click();
};

// Adicionando o evento de clique na foto de perfil
document.getElementById('perfil-picture').addEventListener('click', handleImageClick);


// Função de logout
export const logout = () => {
    auth.signOut()
        .then(() => {
            console.log("Usuário desconectado.");
            // Limpar cookies ou localStorage
            // Não há mais referência ao localStorage ou sessionStorage no código

            // Redireciona para a página de login após 500ms para garantir que a sessão foi limpa
            setTimeout(() => {
                window.location.href = '../home/index.html'; // Redireciona para a página de login
            }, 500); // Espera um pouco para garantir que a sessão foi limpa
        })
        .catch((error) => {
            console.error("Erro ao fazer logout:", error);
            showNotification("Erro ao fazer logout.", 'error');
        });
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

// Adiciona o evento de clique no botão de logout
document.getElementById("logout-btn").addEventListener("click", logout);
