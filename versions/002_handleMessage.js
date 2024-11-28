// 002 quiero que los mensajes se manden a otro script handleMessage
// Este bot solo se conecta y manda al log toda la info que viene en cada mensaje

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); // Import Client, LocalAuth, MessageMEdia
const qrcode = require('qrcode-terminal'); // Import QR

// Importar funciones de otros archivos
const { handleMessage } = require('../src/handlers/messages'); // Manejador de mensajes
const { handleHostMessage } = require('../src/handlers/hostMessages'); // MAnejador de mensajes del host


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

// Detecta mensaje creado por el host y lo delega a handleHostMessage()
client.on('message_create', async (message) => {
    if (message.fromMe) {
        await handleHostMessage(client, message);
    }
});


// START CLIENT
client.initialize();