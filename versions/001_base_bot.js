// Bot base
// Este bot solo se conecta y manda al log toda la info que viene en cada mensaje

// import QR
const qrcode = require('qrcode-terminal');

//import Client, LocalAuth, MessageMEdia
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

// Nuevo Cliente de Whastapp
const client = new Client({
    authStrategy: new LocalAuth()
});

// QR
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});
// CLIENT READY
client.on('ready', async () => {
    console.log('Client is ready!\n');
});



// Evento que detecta mensajes entrantes de todos.
client.on('message', async message => {
    
    console.log(message);    

});



// Evento para detectar mensajes que manda el host. 
client.on('message_create', async (message) => {

    console.log(message);

});



// START CLIENT
client.initialize();