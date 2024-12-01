// Esta es una funcion para mandar el menu principal
// Muchos procesos terminan cambiando el estaduo a null
// Y luego mandan el menu principal. 

const { actualizarEstadoBot } = require('./botState');

/**
 * Muestra el menú principal al usuario y reinicia el estado del bot.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 */
async function mostrarMenuPrincipal(client, message) {
    try {
        // Mensaje del menú principal
        const menu = `<bot> Menú del bot:\n1️⃣ Agregar nueva Categoría\n2️⃣ Salir`;
        await client.sendMessage(message.from, menu);
        await client.sendMessage(message.to, menu);

        // Reiniciar el estado del bot
        await actualizarEstadoBot('menu_principal');
        console.log('✅ Menú principal enviado. Estado cambiado a "menu_principal".');
    } catch (error) {
        console.error('❌ Error al mostrar el menú principal:', error);
    }
}

module.exports = { mostrarMenuPrincipal };
