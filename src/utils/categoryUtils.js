const fs = require('fs').promises;
const path = require('path');
const { actualizarEstadoBot } = require('./botState'); // Para cambiar el estado del bot
const { mostrarMenuPrincipal } = require('./menuUtils'); // funcion para poner menu principal. 


/**
 * Crea una nueva categoría.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 * @param {string} nombreCategoria - Nombre de la nueva categoría.
 */
async function crearCategoria(client, message, nombreCategoria) {
    const categoriaPath = path.join(__dirname, '../../data/categorias', nombreCategoria); // Ruta para la categoría
    try {
        const data = await fs.readFile('./data/botData.json', 'utf8');
        const botData = JSON.parse(data);

        // Verifica si la categoría ya existe
        if (botData.categorias[nombreCategoria]) {
            const response = `<bot> ⚠️ La categoría "${nombreCategoria}" ya existe. Intenta con otro nombre.`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            return;
        }

        // Crear la carpeta y actualizar el JSON
        await fs.mkdir(categoriaPath, { recursive: true });

        // Agregar la categoria a botData.json
        botData.categorias[nombreCategoria] = {
            tipoElementos: "elementos", // Nombre del tipo de elemento temporal
            elementos: []
        };

        // Establecer la categoría actual en el estado del bot
        botData.estadoBot.categoriaActual = nombreCategoria;

        await fs.writeFile('./data/botData.json', JSON.stringify(botData, null, 4));

        // Enviar mensaje para solicitar el nombre del tipo de elemento
        const response = `<bot> ✅ La categoría "${nombreCategoria}" ha sido creada exitosamente.\nAhora, por favor proporciona el nombre del tipo de elemento o unidad que pertenece a esta categoría.\n\nEjemplos:\n- Para la categoría "Fiestas", el tipo podría ser "evento".\n- Para la categoría "Ventas", el tipo podría ser "artículo".`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Cambiar el estado para esperar el nombre del tipo de elemento
        await actualizarEstadoBot('esperando_nombre_elemento');
        console.log(`✅ Categoría "${nombreCategoria}" creada y estado cambiado a "esperando_nombre_elemento"`);
    } catch (error) {
        console.error('❌ Error al crear la categoría:', error);
        const response = '<bot> ❌ Hubo un problema al crear la categoría. Intenta de nuevo más tarde.';
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Reiniciar estado en caso de error
        await actualizarEstadoBot(null);
    }
}

/**
 * Actualiza el tipo de elemento de una categoría específica en `botData.json`.
 * @param {object} client - Cliente de WhatsApp.
 * @param {object} message - Mensaje recibido.
 * @param {string} nombreElemento - Nuevo nombre del tipo de elemento.
 */
async function actualizarTipoElemento(client, message, nombreElemento) {
    const filePath = path.join(__dirname, '../../data/botData.json');

    try {
        // Leer el archivo botData.json
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);

        // Obtener la categoría actual del estado del bot
        const { categoriaActual } = botData.estadoBot;

        if (!categoriaActual || !botData.categorias[categoriaActual]) {
            const response = '<bot> ⚠️ No hay una categoría válida en el estado actual del bot. Por favor, inicia de nuevo.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            console.error('❌ No se encontró una categoría válida en el estado actual.');
            return;
        }

        // Actualizar el tipo de elementos de la categoría
        botData.categorias[categoriaActual].tipoElementos = nombreElemento;

        // Escribir los cambios en botData.json
        await fs.writeFile(filePath, JSON.stringify(botData, null, 4));

        // Enviar mensaje de confirmación al usuario
        const response = `<bot>\n✅ El tipo de elemento para la categoría "${categoriaActual}" ha sido actualizado a "${nombreElemento}".`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Mostrar el menú principal después de actualizar el tipo de elemento
        await mostrarMenuPrincipal(client, message);

        console.log(`✅ Tipo de elemento para la categoría "${categoriaActual}" actualizado a "${nombreElemento}". Estado reiniciado.`);
    } catch (error) {
        console.error('❌ Error al actualizar el tipo de elemento:', error);
        const response = '<bot> ❌ Hubo un problema al actualizar el tipo de elemento. Intenta de nuevo más tarde.';
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Reiniciar estado en caso de error
        await actualizarEstadoBot(null);
    }
}


/**
 * Genera un menú dinámico con las categorías existentes.
 * @returns {string} Menú enumerado de categorías.
 */
async function generarMenuCategorias() {
    try {
        const filePath = path.join(__dirname, '../../data/botData.json');
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);

        const categorias = Object.keys(botData.categorias);
        if (categorias.length === 0) {
            return '<bot> ⚠️ No hay categorías disponibles.';
        }

        let menu = '<bot> Selecciona una categoría:\n';
        categorias.forEach((categoria, index) => {
            menu += `${index + 1}️⃣ ${categoria}\n`;
        });

        return menu;
    } catch (error) {
        console.error('❌ Error al generar el menú de categorías:', error);
        return '<bot> ❌ Hubo un problema al generar el menú de categorías.';
    }
}



module.exports = { crearCategoria, actualizarTipoElemento, generarMenuCategorias };
