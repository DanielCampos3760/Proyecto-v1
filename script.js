const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : 'https://abraham-os.onrender.com'; // La URL de tu Web Service

let currentUser = localStorage.getItem('abraham_username');
let currentAIResponse = null; 
let cachedProfiles = [];

window.onload = () => {
    if (currentUser) { showApp(); } 
    else { document.getElementById('login-container').style.display = 'block'; }
};

// --- NAVEGACIÓN ---
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function showApp() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('welcome-message').innerText = `✅ Conectado como: ${currentUser}`;
    renderHardware();
    fetchProfilesFromCloud(); 
}

function logoutUser() {
    localStorage.removeItem('abraham_username');
    location.reload();
}

// --- AUTENTICACIÓN ---
async function loginUser() {
    const u = document.getElementById('auth-username').value;
    const p = document.getElementById('auth-password').value;
    const res = await fetch(`${API_URL}/login`, { // ✅ Corregido: Usamos API_URL
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

async function registerUser() {
    const u = document.getElementById('auth-username').value;
    const p = document.getElementById('auth-password').value;
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: u, password: p })
    });
    const result = await res.json();
    alert(result.message);
}

// --- HARDWARE ---
function renderHardware() {
    const data = JSON.parse(localStorage.getItem('pc_context'));
    const display = document.getElementById('hardware-display');
    if (!data) {
        display.innerHTML = "<p>Sin datos. Ejecuta el script de PowerShell.</p>";
        return;
    }

    display.innerHTML = `
        <div class="data-item"><label>Procesador</label><span>${data.Processor}</span></div>
        <div class="data-item"><label>RAM</label><span>${data.RAM_GB} GB</span></div>
        <div class="data-item"><label>GPU</label><span>${data.GPU}</span></div>
        <div class="data-item"><label>Nombre Equipo</label><span>${data.ComputerName}</span></div>
    `;
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
            alert("✅ Sincronizado con la nube!");
        }
    } catch (e) { alert("Error: Asegúrate de que system_context.json esté en la carpeta."); }
}

// --- IA ---
async function processAICommand() {
    const input = document.getElementById('ai-command');
    const status = document.getElementById('ai-status');
    status.innerHTML = "⏳ Abraham está analizando tu hardware...";
    
    try {
        const res = await fetch(`${API_URL}/ask-ai`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ command: input.value, username: currentUser })
        });
        const result = await res.json();
        if(result.status === "success") {
            currentAIResponse = result.data;
            status.innerHTML = `
                <div class="markdown-body">
                    <h3>${currentAIResponse.tema}</h3>
                    ${marked.parse(currentAIResponse.explicacion)}
                </div>
                <button onclick="saveProfileToCloud()" style="margin-top:15px">💾 Guardar en Historial</button>
            `;
        }
    } catch (e) { status.innerHTML = "❌ Error al conectar con la IA."; }
}

// --- HISTORIAL / MONGODB ---
async function fetchProfilesFromCloud() {
    const container = document.getElementById('notes-display');
    try {
        const response = await fetch(`${API_URL}/get-profiles`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: currentUser })
        });
        const result = await response.json();
        cachedProfiles = result.profiles;

        if (cachedProfiles.length === 0) {
            container.innerHTML = "<p>No hay perfiles guardados.</p>";
            return;
        }

        container.innerHTML = cachedProfiles.map(p => `
            <div class="profile-card" onclick="viewProfileDetail('${p._id}')">
                <h3>📌 ${p.title}</h3>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = "❌ Error al cargar historial."; }
}

function viewProfileDetail(profileId) {
    const profile = cachedProfiles.find(p => p._id === profileId);
    if (!profile) return;

    document.getElementById('welcome-history').style.display = 'none';
    const detailView = document.getElementById('profile-detail-view');
    detailView.style.display = 'block';

    document.getElementById('detail-title').innerText = profile.title;
    document.getElementById('detail-content').innerHTML = marked.parse(profile.content);
    document.getElementById('detail-delete-btn').onclick = () => deleteProfileFromCloud(profile._id);
}

async function saveProfileToCloud() {
    if (!currentAIResponse) return;
    await fetch(`${API_URL}/save-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            username: currentUser, 
            title: currentAIResponse.tema, 
            content: currentAIResponse.explicacion 
        })
    });
    alert("Configuración guardada!");
    fetchProfilesFromCloud();
}

async function deleteProfileFromCloud(profileId) {
    if(!confirm("¿Eliminar esta configuración?")) return;
    await fetch(`${API_URL}/delete-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ profile_id: profileId })
    });
    document.getElementById('profile-detail-view').style.display = 'none';
    document.getElementById('welcome-history').style.display = 'block';
    fetchProfilesFromCloud();
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const hardwareData = JSON.parse(e.target.result);
            
            // Enviamos los datos al backend en Render
            const response = await fetch(`${API_URL}/update-system-info`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: currentUser, hardware: hardwareData })
            });

            if (response.ok) {
                localStorage.setItem('pc_context', JSON.stringify(hardwareData));
                renderHardware();
                alert("✅ ¡Hardware cargado y sincronizado con éxito!");
            } else {
                alert("❌ Error al subir los datos al servidor.");
            }
        } catch (err) {
            alert("❌ El archivo no es un JSON válido. Asegúrate de usar el generado por el .ps1");
        }
    };
    reader.readAsText(file);
}
