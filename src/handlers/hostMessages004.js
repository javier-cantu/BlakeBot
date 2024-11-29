// src/handlers/hostMessages004.js
// Ahora detecta estado del bot

// Importa las funciones actualizarEstadoBot() y obtenerEstadoActual()
const { actualizarEstadoBot, obtenerEstadoActual } = require('../utils/botState'); 


async function handleHostMessage(client, message) {
    console.log(`📤 Mensaje del host: ${message.body}`); // Log para depuración

    // Obtener el estado actual del bot para el host
    const estadoActual = await obtenerEstadoActual();
    console.log(`🟡 Estado actual del bot: ${estadoActual || 'null (inicial)'}`);

    if (estadoActual === null) {
        // Estado inicial: solo comandos generales como /status o /bot
        if (message.body.toLowerCase() === '/status') {
            const statusMessage = '✅ El bot está activo y funcionando correctamente.';
            
            await client.sendMessage(message.from, statusMessage); // Mensaje al host
            await client.sendMessage(message.to, statusMessage); // Mensaje al chat donde se envió
        } else if (message.body.toLowerCase() === '/bot') {
            const menu = `Menu del bot 1:\n1️⃣ Agregar nueva Categoria`;

            await client.sendMessage(message.from, menu); // Mensaje al host
            await client.sendMessage(message.to, menu); // Mensaje al chat donde se envió

            // Actualizar el estado para indicar que se espera una respuesta del menú
            await actualizarEstadoBot('menu_principal');
            console.log('✅ Estado cambiado a "menu_principal"');
        } else {
            console.log('⚠️ Comando no reconocido en estado inicial. Ignorando.');
        }
    }
}

module.exports = { handleHostMessage };