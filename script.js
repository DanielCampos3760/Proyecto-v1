// Cambia 'tu-app-en-render.onrender.com' por la URL real que te dé Render
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : 'https://tu-app-en-render.onrender.com';

let currentUser = localStorage.getItem('abraham_username');
let currentAIResponse = null; 
let cachedProfiles = [];

window.onload = () => {
    if (currentUser) { showApp(); } 
    else { document.getElementById('login-container').style.display = 'block'; }
};

function showApp() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('welcome-message').innerText = `✅ Conectado como: ${currentUser}`;
    renderHardware();
    fetchProfilesFromCloud(); 
}

async function loginUser() {
    const u = document.getElementById('auth-username').value;
    const p = document.getElementById('auth-password').value;
    const res = await fetch(`${https://abraham-os.onrender.com}/login`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ username: u, password: p }) 
    });
    const result = await res.json();
    if(res.ok) { 
        localStorage.setItem('abraham_username', result.username); 
        currentUser = result.username; 
        showApp(); 
    } else { alert(result.message); }
}

async function syncHardware() {
    try {
        const localRes = await fetch('system_context.json');
        const hardwareData = await localRes.json();
        const response = await fetch(`${API_URL}/update-system-info`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: currentUser, hardware: hardwareData })
        });
        if (response.ok) {
            localStorage.setItem('pc_context', JSON.stringify(hardwareData));
            renderHardware();
            alert("✅ Sincronizado!");
        }
    } catch (e) { alert("Asegúrate de ejecutar el .ps1 primero."); }
}

async function processAICommand() {
    const input = document.getElementById('ai-command');
    const status = document.getElementById('ai-status');
    status.innerHTML = "⏳ Abraham está pensando...";
    
    const res = await fetch(`${API_URL}/ask-ai`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ command: input.value, username: currentUser })
    });
    const result = await res.json();
    if(result.status === "success") {
        currentAIResponse = result.data;
        status.innerHTML = `
            <h3>${currentAIResponse.tema}</h3>
            <div class="markdown-body">${marked.parse(currentAIResponse.explicacion)}</div>
            <button onclick="saveProfileToCloud()">💾 Guardar Configuración</button>
        `;
    }
}

async function saveProfileToCloud() {
    await fetch(`${API_URL}/save-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            username: currentUser, 
            title: currentAIResponse.tema, 
            content: currentAIResponse.explicacion 
        })
    });
    alert("Guardado!");
    fetchProfilesFromCloud();
}

async function fetchProfilesFromCloud() {
    const container = document.getElementById('notes-display');
    container.innerHTML = "⏳ Descargando perfiles desde MongoDB...";
    try {
        const response = await fetch('http://localhost:5000/get-profiles', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: currentUser })
        });
        const result = await response.json();
        
        if (result.profiles.length === 0) {
            container.innerHTML = "<p class='hint'>Aún no tienes configuraciones guardadas. Ve a la pestaña de IA para generar una.</p>";
            return;
        }

        cachedProfiles = result.profiles; // Guardamos en memoria global

        // 🧠 Renderizamos solo las Tarjetas de Resumen (Maestro)
        container.innerHTML = cachedProfiles.map(p => {
            let cleanText = p.content.replace(/[#*`>]/g, '').trim();
            let snippet = cleanText.substring(0, 150) + "..."; 

            return `
                <div class="profile-card" onclick="viewProfileDetail('${p._id}')">
                    <h3>📌 ${p.title}</h3>
                    <p>${snippet}</p>
                </div>
            `;
        }).join('');
    } catch (e) { container.innerHTML = "❌ Error al cargar perfiles."; }
}

// 🧠 Abre el documento completo (Detalle)
function viewProfileDetail(profileId) {
    const profile = cachedProfiles.find(p => p._id === profileId);
    if (!profile) return;

    document.getElementById('profiles-master-view').style.display = 'none';
    document.getElementById('profile-detail-view').style.display = 'block';

    document.getElementById('detail-title').innerText = "📌 " + profile.title;
    document.getElementById('detail-content').innerHTML = marked.parse(profile.content); 
    document.getElementById('detail-delete-btn').onclick = () => { deleteProfileFromCloud(profile._id); };
}

// 🧠 Cierra el documento y vuelve a la lista
function closeProfileDetail() {
    document.getElementById('profile-detail-view').style.display = 'none';
    document.getElementById('profiles-master-view').style.display = 'block';
}

async function deleteProfileFromCloud(profileId) {
    if(!confirm("¿Estás seguro de que quieres eliminar este perfil de la base de datos?")) return;
    try {
        const response = await fetch('http://localhost:5000/delete-profile', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: currentUser, profile_id: profileId })
        });
        if(response.ok) { 
            closeProfileDetail(); 
            fetchProfilesFromCloud(); 
        }
    } catch (e) { alert("❌ Error al borrar el perfil."); }

}
