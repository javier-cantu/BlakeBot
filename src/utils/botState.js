// src/utils/botState.js
// Funcion para cambiar estado del bot
// Funcion para verificar el estado del bot

const fs = require('fs').promises;
const path = require('path'); // Necesario para manejar rutas

// Construir una ruta absoluta hacia `data/botData.json`
const dataPath = path.join(__dirname, '../../data/botData.json');

async function actualizarEstadoBot(nuevoEstado) {
    try {
        // Leer y actualizar el JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);
        botData.estadoBot.procesoActual = nuevoEstado; // Cambiar el estado
        await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));
        console.log(`Estado del bot actualizado a: ${nuevoEstado}`);
    } catch (error) {
        console.error('Error al actualizar el estado del bot:', error);
    }
}

/**
 * Obtiene el estado actual del bot desde el archivo JSON
 * @returns {string|null} El estado actual del bot, o null si hay un error
 */
async function obtenerEstadoActual() {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);
        return botData.estadoBot.procesoActual;
    } catch (error) {
        console.error('Error al leer el estado actual del bot:', error);
        return null; // En caso de error, devolver null como estado por defecto
    }
}

module.exports = { actualizarEstadoBot, obtenerEstadoActual };

