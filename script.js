const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : 'https://abraham-os.onrender.com';

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
    if(event) event.currentTarget.classList.add('active');
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
    const res = await fetch(`${API_URL}/login`, {
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

// --- HARDWARE (CARGA Y SINCRONIZACIÓN) ---
function renderHardware() {
    const data = JSON.parse(localStorage.getItem('pc_context'));
    const display = document.getElementById('hardware-display');
    if (!data) {
        display.innerHTML = "<p>Sin datos de hardware. Por favor, sube tu archivo JSON.</p>";
        return;
    }
    display.innerHTML = `
        <div class="data-item"><label>Procesador</label><span>${data.Processor}</span></div>
        <div class="data-item"><label>RAM</label><span>${data.RAM_GB} GB</span></div>
        <div class="data-item"><label>GPU</label><span>${data.GPU}</span></div>
        <div class="data-item"><label>Equipo</label><span>${data.ComputerName}</span></div>
    `;
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const hardwareData = JSON.parse(e.target.result);
            const response = await fetch(`${API_URL}/update-system-info`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: currentUser, hardware: hardwareData })
            });
            if (response.ok) {
                localStorage.setItem('pc_context', JSON.stringify(hardwareData));
                renderHardware();
                alert("✅ Hardware actualizado en la nube!");
            }
        } catch (err) { alert("Archivo JSON no válido."); }
    };
    reader.readAsText(file);
}

// --- IA ---
async function processAICommand() {
    const input = document.getElementById('ai-command');
    const status = document.getElementById('ai-status');
    status.innerHTML = "⏳ Abraham está analizando...";
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
                <button onclick="saveProfileToCloud()" style="margin-top:15px">💾 Guardar Configuración</button>
            `;
        }
    } catch (e) { status.innerHTML = "❌ Error al conectar con la IA."; }
}

// --- HISTORIAL (MONGODB) ---
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
            container.innerHTML = "<p>No hay perfiles.</p>";
            return;
        }
        container.innerHTML = cachedProfiles.map(p => `
            <div class="profile-card" onclick="viewProfileDetail('${p._id}')">
                <h3>📌 ${p.title}</h3>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = "❌ Error de historial."; }
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

function closeProfileDetail() {
    document.getElementById('profile-detail-view').style.display = 'none';
    document.getElementById('welcome-history').style.display = 'block';
}

async function deleteProfileFromCloud(profileId) {
    if(!confirm("¿Eliminar perfil?")) return;
    await fetch(`${API_URL}/delete-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ profile_id: profileId, username: currentUser })
    });
    closeProfileDetail();
    fetchProfilesFromCloud();
}

async function saveProfileToCloud() {
    if (!currentAIResponse) return;
    await fetch(`${API_URL}/save-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: currentUser, title: currentAIResponse.tema, content: currentAIResponse.explicacion })
    });
    alert("Guardado!");
    fetchProfilesFromCloud();
}
