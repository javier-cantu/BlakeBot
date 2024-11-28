// src/handlers/messages.js
// Este script procesa los mensajes entrantes
// los mensajes que mandan los demas.

async function handleMessage(client, message) {
    console.log(`📥 Mensaje entrante: ${message.body || 'Sin contenido'}`); // Log para depuración

    if (message.body.toLowerCase() === 'ping!') {
        // Responde con "pong!" al remitente
        await client.sendMessage(
            message.from, // Dirección del remitente
            'pong!' // Mensaje de respuesta
        );
    } else {
        console.log('⚠️ Mensaje ignorado.'); // No realiza ninguna acción
    }
    // Marcar el chat como no leído
    try {
        const chat = await message.getChat();
        await chat.markUnread(); // Marca el chat como no leído
        console.log(`📌 Chat marcado como no leído: ${chat.name || chat.id.user}`);
    } catch (error) {
        console.error('⚠️ Error al marcar el chat como no leído:', error);
    }
}

module.exports = { handleMessage };

5