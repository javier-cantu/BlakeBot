// Aqui estan las funciones que mandan los diversos tipos de menus
// Diferentes estados mandan diferente menu
// Y luego mandan el menu principal. 

const fs = require('fs').promises;
const path = require('path');
const { actualizarEstadoBot } = require('./botState');



/**
 * Muestra el menú principal al usuario y establece el estado en `menu_principal`.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 */
async function mostrarMenuPrincipal(client, message) {
    try {
        const menu = `
<bot>\n*Menú principal:*
1️⃣ Gestionar categorías
2️⃣ Ajustar configuraciones
3️⃣ Ver estado del bot
4️⃣ Gestionar elementos
5️⃣ Salir
`.trim();

        await client.sendMessage(message.from, menu);
        await client.sendMessage(message.to, menu);

        // Cambiar el estado del bot a `menu_principal`
        await actualizarEstadoBot('menu_principal');
        console.log('✅ Menú principal enviado. Estado cambiado a "menu_principal".');
    } catch (error) {
        console.error('❌ Error al mostrar el menú principal:', error);
    }
}


/**
 * Muestra el submenú para gestionar categorías y establece el estado en `gestion_categorias`.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 */
async function mostrarMenuGestionCategorias(client, message) {
    try {
        const menu = `<bot> Gestión de categorías:\n1️⃣ Crear nueva categoría\n2️⃣ Editar una categoría\n3️⃣ Borrar una categoría\n4️⃣ Volver al menú principal`;
        await client.sendMessage(message.from, menu);
        await client.sendMessage(message.to, menu);

        // Cambiar el estado del bot a `gestion_categorias`
        await actualizarEstadoBot('gestion_categorias');
        console.log('✅ Submenú "Gestión de categorías" enviado. Estado cambiado a "gestion_categorias".');
    } catch (error) {
        console.error('❌ Error al mostrar el submenú "Gestión de categorías":', error);
    }
}



/**
 * Muestra el submenú para ajustar configuraciones y establece el estado en `configuraciones`.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 */
async function mostrarMenuConfiguraciones(client, message) {
    try {
        const menu = `<bot> Configuraciones:\n1️⃣ Ajustar fecha y hora\n2️⃣ Volver al menú principal`;
        await client.sendMessage(message.from, menu);
        await client.sendMessage(message.to, menu);

        // Cambiar el estado del bot a `configuraciones`
        await actualizarEstadoBot('configuraciones');
        console.log('✅ Submenú "Configuraciones" enviado. Estado cambiado a "configuraciones".');
    } catch (error) {
        console.error('❌ Error al mostrar el submenú "Configuraciones":', error);
    }
}



/**
 * Muestra el submenú para gestionar elementos en una categoría y establece el estado en `esperando_categoria_para_elemento`.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 */
async function mostrarMenuGestionarElementos(client, message) {
    try {
        // Define la ruta absoluta hacia `botData.json`
        const dataPath = path.join(__dirname, '../../data/botData.json');

        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        // Crear el menú con las categorías existentes
        const categorias = Object.keys(botData.categorias);
        const opciones = categorias.map((categoria, index) => `${index + 1}️⃣ ${categoria}`).join('\n');

        const menu = `
<bot>\n*Gestionar elementos:*
Selecciona una categoría para agregar un elemento:
${opciones}
${categorias.length === 0 ? 'No hay categorías disponibles.' : ''}
`.trim();

        await client.sendMessage(message.from, menu);
        await client.sendMessage(message.to, menu);

        // Cambiar el estado del bot
        await actualizarEstadoBot('esperando_categoria_para_elemento');
        console.log('✅ Menú de gestión de elementos enviado. Estado cambiado a "esperando_categoria_para_elemento".');
    } catch (error) {
        console.error('❌ Error al mostrar el menú de gestionar elementos:', error);
    }
}








module.exports = { 
    mostrarMenuPrincipal,
    mostrarMenuGestionCategorias,
    mostrarMenuConfiguraciones,
    mostrarMenuGestionarElementos
};
