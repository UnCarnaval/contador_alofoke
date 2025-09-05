# 🚀 Despliegue en Vercel - Node.js

## 📋 Configuración Completa

### **1. Archivos de Configuración:**
- ✅ `vercel.json` - Configuración principal
- ✅ `package.json` - Dependencias Node.js
- ✅ `server.js` - Aplicación principal
- ✅ `env.example` - Variables de entorno ejemplo

### **2. Variables de Entorno en Vercel:**

#### **En el Dashboard de Vercel:**
```
API_KEY = AIzaSyDCwPogQQkb0JIfWU2H8-l6_0XXyTSaC50
VIDEO_ID = gOJvu0xYsdo
NODE_ENV = production
```

#### **O en el archivo vercel.json:**
```json
{
  "env": {
    "API_KEY": "AIzaSyDCwPogQQkb0JIfWU2H8-l6_0XXyTSaC50",
    "VIDEO_ID": "gOJvu0xYsdo",
    "NODE_ENV": "production"
  }
}
```

## 🚀 **Pasos para Desplegar:**

### **Opción 1 - Desde GitHub:**
1. **Subir a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Super Chats Node.js"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - "New Project" → Importar desde GitHub
   - Seleccionar el repositorio
   - Vercel detectará Node.js automáticamente

3. **Configurar Variables:**
   - En "Environment Variables"
   - Agregar `API_KEY` y `VIDEO_ID`
   - Deploy

### **Opción 2 - Desde Terminal:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables
vercel env add API_KEY
vercel env add VIDEO_ID
```

## ⚙️ **Configuración de Build:**

### **Build Settings en Vercel:**
- **Framework Preset:** Node.js
- **Build Command:** `npm install`
- **Output Directory:** `.` (raíz)
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

### **Funciones:**
- **Max Duration:** 30 segundos
- **Memory:** 1024 MB (default)
- **Region:** Auto (más cercana)

## 🔧 **Configuración Avanzada:**

### **vercel.json completo:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "API_KEY": "AIzaSyDCwPogQQkb0JIfWU2H8-l6_0XXyTSaC50",
    "VIDEO_ID": "gOJvu0xYsdo"
  },
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

## 📊 **Características del Despliegue:**

- ✅ **Una sola aplicación** - Todo en `server.js`
- ✅ **Monitoreo automático** - Cada 30 segundos
- ✅ **Dashboard web** - Ranking en tiempo real
- ✅ **Puntos diarios** - Tabla de 30 días
- ✅ **Zona horaria RD** - Hora correcta
- ✅ **Sin base de datos** - Solo archivos JSON
- ✅ **Escalable** - Vercel maneja el tráfico

## 🚨 **Notas Importantes:**

1. **Rate Limiting:** YouTube API tiene límites, Vercel puede ayudar con el caching
2. **Cold Start:** Primera carga puede ser lenta (2-3 segundos)
3. **Archivos JSON:** Se crean automáticamente en Vercel
4. **Logs:** Revisar en Vercel Dashboard → Functions → Logs

## 🔍 **Verificar Despliegue:**

1. **Dashboard:** `https://tu-proyecto.vercel.app`
2. **API:** `https://tu-proyecto.vercel.app/api/datos`
3. **Logs:** Vercel Dashboard → Functions → Logs
4. **Variables:** Vercel Dashboard → Settings → Environment Variables

¡Listo para desplegar! 🎯🚀
