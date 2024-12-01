// src/handlers/hostMessages006.js
// Ahora quiero que pueda procesar 2 o 3 estados y regresar al inicio. 

const { actualizarEstadoBot, obtenerEstadoActual } = require('../utils/botState'); // Importa las funciones necesarias
const { crearCategoria, actualizarTipoElemento } = require('../utils/categoryUtils'); // Importar funciones
const { mostrarMenuPrincipal } = require('../utils/menuUtils'); // funcion para poner menu principal. 



async function handleHostMessage(client, message) {
    console.log(`📤 Mensaje del host: ${message.body}`); // Log para depuración

    // Filtrar mensajes enviados previamente por el bot
    if (message.fromMe && message.body.startsWith('<bot>')) {
        console.log('🔄 Ignorado: Mensaje enviado por el bot.');
        return; // Evitar procesar el mensaje
    }

    // Obtener el estado actual del bot
    const estadoActual = await obtenerEstadoActual();
    console.log(`🟡 Estado actual del bot: ${estadoActual || 'null (inicial)'}`);

    if (estadoActual === null) {
        // Estado inicial
        if (message.body.toLowerCase() === '/status') {
            const statusMessage = '<bot> ✅ El bot está activo y funcionando correctamente.';
            await client.sendMessage(message.from, statusMessage);
            await client.sendMessage(message.to, statusMessage);
        } else if (message.body.toLowerCase() === '/bot') {
            // al poner /bot se manda el menu principal. 
            await mostrarMenuPrincipal(client, message);
        } else {
            console.log('⚠️ Comando no reconocido en estado inicial. Ignorando.');
        }
    } else if (estadoActual === 'menu_principal') {
        // Respuestas esperadas para el menú principal
        const opcion = message.body.trim();

        if (opcion === '1') {
            const response = '<bot> 🟢 Has seleccionado: Agregar nueva Categoria.\n⚠️ Por favor, escribe el nombre de la nueva categoría usando una sola palabra, sin puntos, comas, espacios ni caracteres especiales. Ejemplos: "fiestas", "ventas", "restaurantes".';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
        
            // Cambiar estado para esperar el nombre de la categoría
            await actualizarEstadoBot('esperando_nombre_categoria');
            console.log('✅ Estado cambiado a "esperando_nombre_categoria"');
        } else if (opcion === '2') {
            const response = '<bot> 🔙 Volviendo al inicio. Usa /bot para abrir el menú nuevamente.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reiniciar estado
            await actualizarEstadoBot(null);
            console.log('✅ Estado reiniciado a null');
        } else {
            // Respuesta inválida
            const response = '<bot> ⚠️ Opción no válida.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
    
            // Reenviar el menú principal si la respuesta fue invalda
            await mostrarMenuPrincipal(client, message);
    
            console.log('🔄 Menú reenviado tras respuesta inválida.');
        }
    } else if (estadoActual === 'esperando_nombre_categoria') {
        const nombreCategoria = message.body.trim();

        // Validar que el nombre de la categoría cumpla con los requisitos
        const regex = /^[a-zA-Z0-9_-]+$/; // Permite letras, números, guiones y guiones bajos
        if (!regex.test(nombreCategoria)) {
            const response = '<bot> ⚠️ El nombre de la categoría no es válido. Por favor, escribe una sola palabra sin puntos, comas, espacios ni caracteres especiales. Ejemplos: "fiestas", "ventas", "restaurantes".';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
        return;
        }

        // Si pasa la validación, delegar a la función crearCategoria
        await crearCategoria(client, message, nombreCategoria);

    } else if (estadoActual === 'esperando_nombre_elemento') {
        const nombreElemento = message.body.trim();
    
        // Validar que el nombre del elemento cumpla con los requisitos
        const regex = /^[a-zA-Z0-9_-]+$/; // Permite letras, números, guiones y guiones bajos
        if (!regex.test(nombreElemento)) {
            const response = '<bot> ⚠️ El nombre del elemento no es válido. Por favor, escribe una sola palabra sin puntos, comas, espacios ni caracteres especiales. Ejemplos: "eventos", "articulos", "productos".';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            return;
        }

         // Delegar la lógica a la función `actualizarTipoElemento`
        await actualizarTipoElemento(client, message, nombreElemento);
    }
}

module.exports = { handleHostMessage };
