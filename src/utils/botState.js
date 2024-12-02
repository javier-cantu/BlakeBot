// src/utils/botState.js
// Funcion para cambiar estado del bot
// Funcion para verificar el estado del bot

const fs = require('fs').promises;
const path = require('path'); // Necesario para manejar rutas

// Construir una ruta absoluta hacia `data/botData.json`
const dataPath = path.join(__dirname, '../../data/botData.json');



async function actualizarEstadoBot(nuevoEstado) {
    try {
        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        // Si el nuevo estado es un string, solo cambia `procesoActual`
        if (typeof nuevoEstado === 'string') {
            botData.estadoBot.procesoActual = nuevoEstado;
        } else if (typeof nuevoEstado === 'object') {
            // Si es un objeto, sobrescribe todo el estado
            botData.estadoBot = { ...botData.estadoBot, ...nuevoEstado };
        } else {
            throw new Error('El nuevo estado debe ser un string o un objeto válido.');
        }

        // Guardar los cambios en el archivo
        await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));
        console.log(`✅ Estado del bot actualizado a:`, botData.estadoBot);
    } catch (error) {
        console.error('❌ Error al actualizar el estado del bot:', error);
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



/**
 * Restablece los valores del bot en `estadoBot` a `null`.
 */
async function resetBotValues() {
    try {
        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        // Restablecer los valores en `estadoBot`
        botData.estadoBot = {
            procesoActual: null,
            categoriaActual: null,
            elementoActual: null
        };

        // Guardar los cambios en el archivo
        await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));
        console.log('✅ Estado del bot restablecido a valores nulos.');
    } catch (error) {
        console.error('❌ Error al restablecer el estado del bot:', error);
    }
}


/**
 * Lee y devuelve el estado actual del bot como un string formateado, incluyendo categorías y la hora del bot.
 * @returns {Promise<string>} Estado del bot formateado para enviar al usuario.
 */
async function obtenerEstadoBot() {
    try {
        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        // Obtener la hora actual ajustada del bot
        const fechaHoraActual = new Date();
        const offset = global.botTimeOffset || 0; // Usa el offset si existe, 0 si no
        const horaCalibrada = new Date(fechaHoraActual.getTime() + offset);

        // Formatear la fecha y hora local
        const anio = horaCalibrada.getFullYear();
        const mes = String(horaCalibrada.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
        const dia = String(horaCalibrada.getDate()).padStart(2, '0');
        const hora = String(horaCalibrada.getHours()).padStart(2, '0');
        const minutos = String(horaCalibrada.getMinutes()).padStart(2, '0');
        const fechaFormateada = `${anio}/${mes}/${dia}`;
        const horaFormateada = `${hora}:${minutos}`;

        // Formatear el estado del bot
        const estadoBot = botData.estadoBot;

        // Resumir categorías con tipo de elementos
        const categorias = botData.categorias;
        const resumenCategorias = Object.keys(categorias)
            .map(nombre => {
                const categoria = categorias[nombre];
                const tipoElemento = categoria.tipoElementos || 'Elementos';
                const numElementos = categoria.elementos.length;
                return `  - ${nombre.toUpperCase()}: ${numElementos} ${tipoElemento}`;
            })
            .join('\n');

        return `
<bot>\n\n🤖*Estado actual del bot:*🤖\n
*Fecha del Bot:* ${fechaFormateada}
*Hora del Bot:* ${horaFormateada}
*Proceso Actual:* ${estadoBot.procesoActual || 'Ninguno'}
*Categoría Actual:* ${estadoBot.categoriaActual || 'Ninguna'}
*Elemento Actual:* ${estadoBot.elementoActual || 'Ninguno'}

*Categorías:*
${resumenCategorias || '  Ninguna categoría registrada'}
        `.trim();
    } catch (error) {
        console.error('❌ Error al obtener el estado del bot:', error);
        return '<bot> ❌ No se pudo obtener el estado del bot.';
    }
}










module.exports = { actualizarEstadoBot, obtenerEstadoActual, resetBotValues, obtenerEstadoBot };

