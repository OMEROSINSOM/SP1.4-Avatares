/**
 * ESTADO GLOBAL
 */
const state = {
    cardData: {
        name: '',
        bio: '',
        avatarUrl: 'src/assets/Avatar1.png', // Avatar por defecto
        color: '#3b82f6'
    }
};

/**
 *  REFERENCIAS AL DOM ( Document Objet Model )
 */
const dom = {
    inputName: document.getElementById('input-name'),
    inputBio: document.getElementById('input-bio'),
    inputColor: document.getElementById('input-color'),
    form: document.getElementById('profile-form'),
    avatarSelector: document.getElementById('avatar-selector'),
    previewName: document.getElementById('name-preview'),
    previewBio: document.getElementById('bio-preview'),
    previewAvatar: document.getElementById('avatar-preview'),
    previewHeader: document.getElementById('preview-header'),
    viewCreate: document.getElementById('view-create'),
    inputSearch: document.getElementById('github-search'),
    btnFetch: document.getElementById('btn-fetch'),
    apiStatus: document.getElementById('api-status'),
    apiSelect: document.getElementById('api-select'),
    viewGallery: document.getElementById('view-gallery'),
    navLinks: document.querySelectorAll('.nav-link'),
    galeryContainer: document.getElementById('gallery-container'),
    btnReloadGallery: document.getElementById('btn-reload-gallery')
};

/**
 * GENERADOR DEL SELECTOR DE AVATARES
 * Crea los 12 elementos <img> dinámicamente.
 */
const initAvatarSelector = () => {
    const totalAvatares = 12; // Del 1 al 12
    for (let i = 1; i <= totalAvatares; i++) {
        const rutaImagen = `src/assets/Avatar${i}.png`;
        const img = document.createElement('img');
        img.src = rutaImagen;
        img.alt = `Avatar ${i}`;
        img.className = 'avatar-option';
        // Guardamos la ruta en un atributo de datos para leerlo fácilmente
        img.dataset.url = rutaImagen; 

        // Evento: Al hacer clic en una miniatura, actualizamos el estado global
        img.addEventListener('click', () => {
            state.cardData.avatarUrl = rutaImagen;
            renderCard(); // Forzamos la actualización de la UI
        });

        dom.avatarSelector.appendChild(img);
    }
};

/**
 *  FUNCIÓN DE RENDERIZADO (Reactividad)
 */
const renderCard = () => {
    dom.previewName.textContent = state.cardData.name || 'Nombre Apellido';
    dom.previewBio.textContent = state.cardData.bio || 'La biografía aparecerá aquí...';
    dom.previewAvatar.src = state.cardData.avatarUrl;
    dom.previewHeader.style.backgroundColor = state.cardData.color;
    dom.inputName.value = state.cardData.name;
    dom.inputBio.value = state.cardData.bio;
    dom.inputColor.value = state.cardData.color;
    // Actualizar visualmente qué avatar está seleccionado en la cuadrícula
    const avatares = dom.avatarSelector.querySelectorAll('.avatar-option');
    avatares.forEach(img => {
        if (img.dataset.url === state.cardData.avatarUrl) {
            img.classList.add('selected');
        } else {
            img.classList.remove('selected');
        }
    });
};

/**
 * EVENTOS MANUALES
 */
const setupManualEvents = () => {
    dom.inputName.addEventListener('input', (e) => {
        state.cardData.name = e.target.value;
        renderCard(); 
    });

    dom.inputBio.addEventListener('input', (e) => {
        state.cardData.bio = e.target.value;
        renderCard();
    });

    dom.inputColor.addEventListener('input', (e) => {
        state.cardData.color = e.target.value;
        renderCard();
    });

    dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCartToServer();
    });
};

const saveButton = document.getElementById('save-custom-avatar');
saveButton.addEventListener('click', () => {
    renderCard();
    closeModal();
});


/**
 * MODAL
 */

function openModal() {
    const modal = document.getElementById('custom-avatar-modal');
    modal.classList.remove('hidden');
    const blurred_background = document.getElementById('blurred-background');
    blurred_background.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('custom-avatar-modal');
    modal.classList.add('hidden');
    const blurred_background = document.getElementById('blurred-background');
    blurred_background.classList.add('hidden');
}

/**
 * UPLOAD DE IMAGEN PERSONALIZADA
 * */
const uploadArea = document.getElementById('upload-area');
const inputAvatar = document.getElementById('custom-avatar-file');
const previewImage = document.getElementById('custom-avatar-preview');

uploadArea.onclick = () => inputAvatar.click(); // <-- corregido

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    mostrarPreview(file);
});

inputAvatar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    mostrarPreview(file);
}
);

function mostrarPreview(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        // Mostrar en el modal
        previewImage.src = e.target.result;
        previewImage.classList.remove('hidden');
        document.getElementById('upload-label').style.display = 'none';

        // Actualizar el estado global
        state.cardData.avatarUrl = e.target.result;
    }
    reader.readAsDataURL(file);
}


/**
 * CONSUMO DE APIs
 */
const fetchUserData = async (username) => {
    if (!username) return;

    const apiName = dom.apiSelect.value;
    dom.apiStatus.textContent = `Buscando usuario en ${apiName}...`;
    dom.apiStatus.className = 'status-msg status-loading';
    dom.btnFetch.disabled = true;

    try {
        let response, data;

        switch (apiName) {
            case 'GitHub':
                response = await fetch(`https://api.github.com/users/${username}`);
                data = await response.json();
                if (data.message) throw new Error(data.message);
                state.cardData.name = data.name || data.login;
                state.cardData.bio = data.bio || 'Este usuario no tiene biografía pública.';
                state.cardData.avatarUrl = data.avatar_url;
                break;

            case 'GitLab':
                response = await fetch(`https://gitlab.com/api/v4/users?username=${username}`);
                data = await response.json();
                if (data.length === 0) throw new Error('Usuario no encontrado');
                const gitlabUser = data[0];
                state.cardData.name = gitlabUser.name || gitlabUser.username;
                state.cardData.bio = gitlabUser.bio || 'Este usuario no tiene biografía pública.';
                state.cardData.avatarUrl = gitlabUser.avatar_url;
                break;

            default:
                throw new Error('API no soportada');
        }

        renderCard();
        dom.apiStatus.textContent = '¡Datos cargados correctamente!';
        dom.apiStatus.className = 'status-msg status-success';

    } catch (error) {
        dom.apiStatus.textContent = error.message;
        dom.apiStatus.className = 'status-msg status-error';
    } finally {
        dom.btnFetch.disabled = false;
        setTimeout(() => dom.apiStatus.textContent = '', 3000);
    }
};

/**
 * API DE GALERÍA (guardado)
 */
const saveCartToServer = async () => {
    if (!state.cardData.name.trim()) {
        alert('Por favor, ingresa un nombre para la tarjeta.');
        return;
    }

    const btnSubmit = dom.form.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Guardando en servidor...';
    btnSubmit.disabled = true;

    try {
        const formData = new FormData();
        formData.append('datos_tarjeta', JSON.stringify(state.cardData));

        const response = await fetch('./api/guardar-tarjeta.php', {
            method: 'POST',
            body: formData
        });

        const textoCrudo = await response.text();
        console.log("Respuesta cruda del servidor:", textoCrudo); 

        // Como PHP ahora siempre devuelve JSON, lo parseamos directamente
        const result = JSON.parse(textoCrudo);

        if (!response.ok) {
            // Lanzamos el error específico que nos mandó PHP
            throw new Error(result.error || `El servidor rechazó la petición.`);
        }

        alert(result.message);

    } catch (error) {
        alert('Error: ' + error.message);
        console.error('Error capturado en el catch:', error);
    } finally {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
}

/**
 * LÓGICA DE LA GALERÍA (Consumo y Renderizado)
 */
const loadGallery = async () => {
    dom.galeryContainer.innerHTML = '<p class="status-msg status-loading">Cargando Galería...</p>';

    try {
        const response = await fetch(`./api/tarjetas-usuarios.json?t=${Date.now()}`); // Evita cache
        if(!response.ok) {
            if(response.status === 404) throw new Error('Aun no hay tarjetas guardadas. ¡Sé el primero en crear una!');
            throw new Error('Error al cargar la galería');
        }
        const data = await response.json();
        if(data.length === 0) {
            throw new Error('La galería está vacía. ¡Sé el primero en crear una tarjeta!');
        }

        dom.galeryContainer.innerHTML = ''; // Limpiamos el contenedor antes de renderizar

        data.reverse().forEach(tarjeta => {
            const cardHTML = `
                <article class="card">
                    <div class="card-header" style="background-color: ${tarjeta.color}"></div>
                    <img src="${tarjeta.avatarUrl}" alt="Avatar de ${tarjeta.name}" class="avatar">
                    <div class="card-body">
                        <h3>${tarjeta.name}</h3>
                        <p style="font-size: 0.95rem; color: #a5a5a5;">${tarjeta.bio}</p>
                    </div>
                </article>
            `;
            dom.galeryContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        dom.galeryContainer.innerHTML = `<p class="status-msg status-error">${error.message}</p>`;
    }
}
    
/**
 * ENRUTADOR HASH (Hash Router)
 * */
const handleRouting = () => {
    const currentHash = window.location.hash || '#/crear';

    dom.navLinks.forEach(link => {
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (currentHash === '#/galeria') {
        dom.viewCreate.classList.remove('active');
        dom.viewCreate.style.display = 'none';
        
        dom.viewGallery.style.display = 'block';
        setTimeout(() => dom.viewGallery.classList.add('active'), 10);
        
        loadGallery(); 
    } else {
        dom.viewGallery.classList.remove('active');
        dom.viewGallery.style.display = 'none';
        
        dom.viewCreate.style.display = 'block';
        setTimeout(() => dom.viewCreate.classList.add('active'), 10);
    }
};




/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    initAvatarSelector();
    setupManualEvents();
    renderCard();

    // Evento: botón Buscar
    dom.btnFetch.addEventListener('click', () => {
        const username = dom.inputSearch.value.trim();
        if (!username) return;
        fetchUserData(username); // <-- ahora genérico
    });

    // Evento: Enter en el input
    dom.inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.btnFetch.click();
        }
    });
    window.addEventListener('hashchange', handleRouting);
    dom.btnReloadGallery.addEventListener('click', loadGallery);
    handleRouting(); // Llamada inicial para establecer la vista correcta según el hash actual
});