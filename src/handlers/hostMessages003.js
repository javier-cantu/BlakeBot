// src/handlers/hostMessages003.js

async function handleHostMessage(client, message) {
    console.log(`📤 Mensaje del host: ${message.body}`); // Log para depuración

    if (message.body.toLowerCase() === '/status') {
        // Mensaje al propio host
        await client.sendMessage(
            message.from,
            '✅ El bot está activo y funcionando correctamente.'
        );
        // Mensaje al grupo o chat donde se envió el comando, para mostrar como demo. 
        await client.sendMessage(
            message.to,
            '✅ El bot está activo y funcionando correctamente.'
        );
    } else if (message.body.toLowerCase() === '/bot') {
        // Definir el menú del bot
        const menu = `Menu del bot 1:\n1️⃣ Agregar nueva Categoria`;

        // Enviar el menú al propio host
        await client.sendMessage(message.from, menu);
        // Enviar el menú al grupo o chat donde se envió el comando
        await client.sendMessage(message.to, menu);

    } else {
        console.log('⚠️ Comando del host no reconocido. Ignorando.');
    }
}

module.exports = { handleHostMessage };