// Cron job para Vercel
// Este archivo se ejecuta cada 30 segundos usando Vercel Cron

const axios = require('axios');

module.exports = async (req, res) => {
    try {
        // Hacer una petición a la ruta de monitoreo
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
            
        const response = await axios.get(`${baseUrl}/api/monitorear`);
        
        console.log('Cron job ejecutado:', response.data);
        res.status(200).json({ 
            success: true, 
            message: 'Cron job ejecutado correctamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en cron job:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};
