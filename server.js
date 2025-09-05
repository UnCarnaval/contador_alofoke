const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
const API_KEY = process.env.API_KEY || "AIzaSyDCwPogQQkb0JIfWU2H8-l6_0XXyTSaC50";
const VIDEO_ID = process.env.VIDEO_ID || "gOJvu0xYsdo";

// Participantes
const PARTICIPANTES = ["Crazy", "Crucita", "Gigi", "Luise", "Carlos Montesquieu", "Giuseppe", "Karola"];

// Archivos JSON
const PUNTOS_FILE = 'puntos.json';
const EVENTOS_FILE = 'eventos.json';
const PUNTOS_DIARIOS_FILE = 'puntos_diarios.json';

// Inicializar archivos JSON
function initFiles() {
    if (!fs.existsSync(PUNTOS_FILE)) {
        const puntos = {};
        PARTICIPANTES.forEach(p => puntos[p] = 0);
        fs.writeFileSync(PUNTOS_FILE, JSON.stringify(puntos, null, 2));
    }
    
    if (!fs.existsSync(EVENTOS_FILE)) {
        fs.writeFileSync(EVENTOS_FILE, JSON.stringify([], null, 2));
    }
    
    if (!fs.existsSync(PUNTOS_DIARIOS_FILE)) {
        fs.writeFileSync(PUNTOS_DIARIOS_FILE, JSON.stringify({}, null, 2));
    }
}

// Obtener hora de República Dominicana
function getRDTime() {
    const now = new Date();
    const rdTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Santo_Domingo"}));
    return rdTime.toISOString().replace('T', ' ').substring(0, 19);
}

// Cargar datos
function loadData(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error cargando ${filename}:`, error.message);
        return filename === PUNTOS_FILE ? {} : [];
    }
}

// Guardar datos
function saveData(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error guardando ${filename}:`, error.message);
        return false;
    }
}

// Extraer puntos del monto
function extraerPuntos(amountStr) {
    const numeros = amountStr.match(/[\d\.]+/g);
    if (!numeros) return 0;
    
    const monto = parseFloat(numeros[0]);
    
    if (amountStr.toUpperCase().includes('DOP')) {
        return Math.round(monto / 50);
    } else if (amountStr.toUpperCase().includes('EUR')) {
        return Math.round(monto * 1.1);
    } else if (amountStr.toUpperCase().includes('ARS')) {
        return Math.round(monto * 0.00073);
    } else if (amountStr.toUpperCase().includes('CHF')) {
        return Math.round(monto * 1.1);
    } else {
        return Math.round(monto);
    }
}

// Encontrar persona en el mensaje
function encontrarPersona(message) {
    const messageLower = message.toLowerCase();
    
    // Gigi
    if (messageLower.includes('gigi') || messageLower.includes('team gigi') || 
        messageLower.includes('#teamgigi') || messageLower.includes('teamgigi')) {
        return 'Gigi';
    }
    
    // Crucita
    if (messageLower.includes('crucita') || messageLower.includes('crusita') || 
        messageLower.includes('team crucita') || messageLower.includes('team crusita') ||
        messageLower.includes('#teamcrucita') || messageLower.includes('teamcrucita')) {
        return 'Crucita';
    }
    
    // Luise
    if (messageLower.includes('luise') || messageLower.includes('luice') || 
        messageLower.includes('ñaño') || messageLower.includes('nano')) {
        return 'Luise';
    }
    
    // Carlos
    if (messageLower.includes('carlos') || messageLower.includes('montesquieu') || 
        messageLower.includes('saltamonte')) {
        return 'Carlos Montesquieu';
    }
    
    // Giuseppe
    if (messageLower.includes('giuseppe') || messageLower.includes('trujillo')) {
        return 'Giuseppe';
    }
    
    // Crazy
    if (messageLower.includes('crazy') || messageLower.includes('design')) {
        return 'Crazy';
    }
    
    // Karola
    if (messageLower.includes('karola') || messageLower.includes('carola') || 
        messageLower.includes('karol') || messageLower.includes('#teamkarola') ||
        messageLower.includes('team karola')) {
        return 'Karola';
    }
    
    return null;
}

// Guardar Super Chat
function guardarSuperChat(author, amount, message, persona, puntos) {
    const eventos = loadData(EVENTOS_FILE);
    const puntosData = loadData(PUNTOS_FILE);
    
    // Verificar duplicados
    const existe = eventos.find(e => 
        e.author === author && 
        e.amount === amount && 
        e.message === message && 
        e.persona === persona
    );
    
    if (existe) return false;
    
    // Crear nuevo evento
    const nuevoEvento = {
        id: eventos.length + 1,
        author: author,
        amount: amount,
        message: message,
        persona: persona,
        puntos: puntos,
        timestamp: getRDTime()
    };
    
    // Agregar evento
    eventos.push(nuevoEvento);
    
    // Limitar a 1000 eventos
    if (eventos.length > 1000) {
        eventos.splice(0, eventos.length - 1000);
    }
    
    saveData(EVENTOS_FILE, eventos);
    
    // Actualizar puntos
    puntosData[persona] = (puntosData[persona] || 0) + puntos;
    saveData(PUNTOS_FILE, puntosData);
    
    // Actualizar puntos diarios
    actualizarPuntosDiarios(persona, puntos);
    
    return true;
}

// Actualizar puntos diarios
function actualizarPuntosDiarios(persona, puntos) {
    const puntosDiarios = loadData(PUNTOS_DIARIOS_FILE);
    const fechaHoy = getRDTime().split(' ')[0];
    
    if (!puntosDiarios[fechaHoy]) {
        puntosDiarios[fechaHoy] = {};
        PARTICIPANTES.forEach(p => puntosDiarios[fechaHoy][p] = 0);
    }
    
    puntosDiarios[fechaHoy][persona] = (puntosDiarios[fechaHoy][persona] || 0) + puntos;
    
    // Mantener solo últimos 30 días
    const fechas = Object.keys(puntosDiarios).sort((a, b) => new Date(b) - new Date(a));
    if (fechas.length > 30) {
        fechas.slice(30).forEach(fecha => delete puntosDiarios[fecha]);
    }
    
    saveData(PUNTOS_DIARIOS_FILE, puntosDiarios);
}

// Monitorear Super Chats
async function monitorearSuperChats() {
    try {
        console.log('🔍 Monitoreando Super Chats...');
        
        // Obtener live chat ID
        const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
                part: 'liveStreamingDetails',
                id: VIDEO_ID,
                key: API_KEY
            }
        });
        
        if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
            console.log('❌ Video no encontrado o no es en vivo');
            return;
        }
        
        const liveChatId = videoResponse.data.items[0].liveStreamingDetails.activeLiveChatId;
        if (!liveChatId) {
            console.log('❌ No hay live chat activo');
            return;
        }
        
        console.log(`📺 Live Chat ID: ${liveChatId}`);
        
        // Obtener mensajes
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/liveChat/messages`, {
            params: {
                liveChatId: liveChatId,
                part: 'snippet,authorDetails',
                key: API_KEY
            }
        });
        
        for (const item of response.data.items) {
            const snippet = item.snippet;
            
            if (snippet.type === 'superChatEvent') {
                const author = item.authorDetails.displayName;
                const message = snippet.displayMessage;
                const amount = snippet.superChatDetails?.amountDisplayString || '0';
                
                const puntos = extraerPuntos(amount);
                const persona = encontrarPersona(message);
                
                if (persona && puntos > 0) {
                    if (guardarSuperChat(author, amount, message, persona, puntos)) {
                        console.log(`💰 ${persona}: +${puntos} pts (${amount}) - ${author}`);
                        
                        // Mostrar ranking
                        const puntosData = loadData(PUNTOS_FILE);
                        const ranking = Object.entries(puntosData)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 7);
                        
                        console.log('🏆 RANKING ACTUAL:');
                        ranking.forEach(([persona, puntos], i) => {
                            console.log(`  ${i + 1}. ${persona}: ${puntos} pts`);
                        });
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error monitoreando Super Chats:', error.message);
    }
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Super Chats Dashboard</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
                color: white;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                font-size: 3rem;
                margin: 0;
                background: linear-gradient(45deg, #00d4ff, #ff6b6b, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #00d4ff;
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            }
            .stat-card h3 {
                margin: 0 0 10px 0;
                color: #00ff88;
            }
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: #ffd700;
            }
            .ranking {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #ff6b6b;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .ranking h2 {
                text-align: center;
                color: #ff6b6b;
                margin-bottom: 20px;
            }
            .ranking-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: rgba(255, 107, 107, 0.1);
                border-radius: 8px;
                border-left: 4px solid #ff6b6b;
            }
            .ranking-position {
                font-weight: bold;
                color: #ffd700;
            }
            .ranking-name {
                color: #00ff88;
                font-weight: bold;
            }
            .ranking-points {
                color: #00d4ff;
                font-weight: bold;
            }
            .events {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #4ecdc4;
                border-radius: 15px;
                padding: 20px;
            }
            .events h2 {
                text-align: center;
                color: #4ecdc4;
                margin-bottom: 20px;
            }
            .event-item {
                background: rgba(78, 205, 196, 0.1);
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                border-left: 4px solid #4ecdc4;
            }
            .event-author {
                color: #00d4ff;
                font-weight: bold;
                font-size: 1.1rem;
            }
            .event-amount {
                color: #ffd700;
                font-weight: bold;
            }
            .event-persona {
                color: #00ff88;
                font-weight: bold;
            }
            .event-message {
                color: #cccccc;
                margin: 5px 0;
                font-size: 0.9rem;
            }
            .event-time {
                color: #888;
                font-size: 0.8rem;
            }
            .loading {
                text-align: center;
                font-size: 1.2rem;
                color: #00ff88;
                margin: 50px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏆 SUPER CHATS DASHBOARD</h1>
                <p>Monitoreo en tiempo real de Super Chats</p>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>📊 Total Puntos</h3>
                    <div class="stat-value" id="totalPuntos">0</div>
                </div>
                <div class="stat-card">
                    <h3>🔥 Eventos Hoy</h3>
                    <div class="stat-value" id="eventosHoy">0</div>
                </div>
                <div class="stat-card">
                    <h3>👥 Participantes</h3>
                    <div class="stat-value">7</div>
                </div>
            </div>
            
            <div class="ranking">
                <h2>🎮 RANKING LIVE</h2>
                <div id="ranking" class="loading">Cargando ranking...</div>
            </div>
            
            <div class="events">
                <h2>🔥 EVENTOS RECIENTES</h2>
                <div id="events" class="loading">Cargando eventos...</div>
            </div>
        </div>
        
        <script>
            async function actualizarDatos() {
                try {
                    const response = await fetch('/api/datos');
                    const data = await response.json();
                    
                    // Actualizar ranking
                    const ranking = document.getElementById('ranking');
                    const sorted = Object.entries(data.puntos).sort((a, b) => b[1] - a[1]);
                    
                    ranking.innerHTML = sorted.map(([persona, puntos], i) => \`
                        <div class="ranking-item">
                            <span class="ranking-position">\${i + 1}.</span>
                            <span class="ranking-name">\${persona}</span>
                            <span class="ranking-points">\${puntos} pts</span>
                        </div>
                    \`).join('');
                    
                    // Actualizar eventos
                    const events = document.getElementById('events');
                    events.innerHTML = data.eventos.map(evento => \`
                        <div class="event-item">
                            <div class="event-author">\${evento.author}</div>
                            <div class="event-amount">\${evento.amount}</div>
                            <div class="event-persona">→ \${evento.persona} (+\${evento.puntos} pts)</div>
                            <div class="event-message">\${evento.message}</div>
                            <div class="event-time">\${evento.timestamp}</div>
                        </div>
                    \`).join('');
                    
                    // Actualizar estadísticas
                    const totalPuntos = Object.values(data.puntos).reduce((a, b) => a + b, 0);
                    document.getElementById('totalPuntos').textContent = totalPuntos;
                    document.getElementById('eventosHoy').textContent = data.eventos.length;
                    
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('ranking').innerHTML = '<div class="loading">Error cargando datos...</div>';
                }
            }
            
            // Actualizar cada 3 segundos
            actualizarDatos();
            setInterval(actualizarDatos, 3000);
        </script>
    </body>
    </html>
    `);
});

// API de datos
app.get('/api/datos', (req, res) => {
    const puntos = loadData(PUNTOS_FILE);
    const eventos = loadData(EVENTOS_FILE);
    const puntosDiarios = loadData(PUNTOS_DIARIOS_FILE);
    
    // Ordenar eventos por timestamp descendente y tomar los últimos 20
    const eventosOrdenados = eventos
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    
    res.json({
        puntos: puntos,
        eventos: eventosOrdenados,
        puntos_diarios: puntosDiarios
    });
});

// Inicializar archivos
initFiles();

// Programar monitoreo cada 30 segundos
cron.schedule('*/30 * * * * *', monitorearSuperChats);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔄 Monitoreo automático cada 30 segundos`);
    
    // Ejecutar monitoreo inmediatamente
    monitorearSuperChats();
});

module.exports = app;
