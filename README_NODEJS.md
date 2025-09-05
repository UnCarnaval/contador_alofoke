# 🚀 Super Chats Dashboard - Node.js

## ✅ **SISTEMA COMPLETO EN UNA SOLA APP**

### ** Características:**
- ✅ **Una sola aplicación** - Tracker + Dashboard
- ✅ **Funciona en Vercel** - Sin limitaciones
- ✅ **Tiempo real** - Monitoreo automático
- ✅ **Archivos JSON** - Sin base de datos
- ✅ **Puntos diarios** - Tabla de 30 días
- ✅ **Zona horaria RD** - Hora correcta

## 🚀 **Despliegue en Vercel**

### **1. Configuración automática:**
- **Framework:** Node.js (detectado automáticamente)
- **Build Command:** `npm install`
- **Output Directory:** (vacío)
- **Start Command:** `npm start`

### **2. Variables de entorno:**
```
API_KEY = AIzaSyDCwPogQQkb0JIfWU2H8-l6_0XXyTSaC50
VIDEO_ID = gOJvu0xYsdo
```

### **3. Archivos necesarios:**
- `server.js` - Aplicación principal
- `package.json` - Dependencias Node.js
- `vercel.json` - Configuración Vercel
- `puntos.json` - Se crea automáticamente
- `eventos.json` - Se crea automáticamente
- `puntos_diarios.json` - Se crea automáticamente

## 🔧 **Uso local:**

```bash
# Instalar dependencias
npm install

# Ejecutar aplicación
npm start

# Dashboard: http://localhost:3000
```

## 📊 **Funcionalidades:**

### **Monitoreo automático:**
- Monitorea YouTube API cada 30 segundos
- Detecta Super Chats automáticamente
- Actualiza puntos en tiempo real
- Previene duplicados

### **Dashboard web:**
- Ranking en tiempo real
- Eventos recientes
- Estadísticas del día
- Diseño responsive

### **Gestión de datos:**
- Límite de 1000 eventos
- Puntos diarios (30 días)
- Limpieza automática
- Archivos JSON persistentes

## 🎯 **Ventajas sobre Python:**

1. **Una sola app** - No necesitas 2 servidores
2. **Vercel nativo** - Funciona perfectamente
3. **Más rápido** - Node.js es más eficiente
4. **Menos complejo** - Sin configuraciones extra
5. **Escalable** - Vercel maneja todo

## 📁 **Estructura:**

```
SuperChats/
├── server.js          # Aplicación principal
├── package.json       # Dependencias
├── vercel.json        # Config Vercel
├── puntos.json        # Puntos (auto)
├── eventos.json       # Eventos (auto)
└── puntos_diarios.json # Diarios (auto)
```

## 🚀 **Pasos para desplegar:**

1. **Subir a GitHub:**
   ```bash
   git add .
   git commit -m "Node.js Super Chats"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   - Vercel detectará Node.js automáticamente
   - Configurar variables de entorno
   - ¡Listo!

## 🔄 **Flujo de datos:**

```
YouTube API → server.js → Archivos JSON → Dashboard Web
```

¡Todo en una sola aplicación! 🎯
