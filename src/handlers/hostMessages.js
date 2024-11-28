// src/handlers/hostMessages.js
// Este script procesa los mensajes del host
// los mensajes que manda el cel que tiene el bot

async function handleHostMessage(client, message) {
    console.log(`Mensaje del host: ${message.body}`); // Log para depuración

    if (message.body.toLowerCase() === '/status') {
        // Mensaje al propio host
        await client.sendMessage(
            message.from,
            '✅ El bot está activo y funcionando correctamente.'
        );

        // Mensaje al grupo o chat donde se envió el comando, como demo
        await client.sendMessage(
            message.to,
            '✅ El bot está activo y funcionando correctamente.'
        );
    } else {
        console.log('Comando del host no reconocido. Ignorando.');
    }
}

module.exports = { handleHostMessage };
