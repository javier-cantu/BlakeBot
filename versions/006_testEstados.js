// 005 Este debe poder de cambiar de estado. 
// 005_testEstados.js

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); // Import Client, LocalAuth, MessageMEdia
const qrcode = require('qrcode-terminal'); // Import QR

const { handleMessage } = require('../src/handlers/messages'); // Importa la función para manejar mensajes entrantes
const { handleHostMessage } = require('../src/handlers/hostMessages006'); // version 5

// Nuevo Cliente de Whastapp
const client = new Client({authStrategy: new LocalAuth()});

// QR
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

// CLIENT READY
client.on('ready', () => {
    console.log('✅ Client is ready!\n');
});


// Detecta mensajes entrantes y los delega a handleMessage()
client.on('message', async message => {
    await handleMessage(client, message); 
});

// Detecta mensaje creado por el host y que sea fromMe y lo delega a handleHostMessage()
client.on('message_create', async (message) => {
    if (message.fromMe) {
        await handleHostMessage(client, message);
    }
});


// START CLIENT
client.initialize();