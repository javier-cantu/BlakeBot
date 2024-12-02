// elementUtils.js
// Funciones para manejar elementos eventos. 

const fs = require('fs').promises;
const path = require('path');

/**
 * Inicializa un nuevo elemento dentro de una categoría y crea un folder asociado.
 * @param {string} categoria - Nombre de la categoría.
 * @param {string} nombreElemento - Nombre del nuevo elemento.
 * @param {string} dataPath - Ruta al archivo JSON.
 */
async function inicializarElemento(categoria, nombreElemento, dataPath) {
    try {
        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        // Verificar que la categoría exista
        if (!botData.categorias[categoria]) {
            throw new Error(`La categoría "${categoria}" no existe.`);
        }

        // Crear datos temporales para el nuevo elemento
        const nuevoElemento = {
            nombre: nombreElemento,
            comando: '/comando', // Valor temporal
            fecha: '11112233', // Valor temporal
            horarioInicio: '1122', // Valor temporal
            horarioTermino: '1122', // Valor temporal
            descripcion: 'Descripción del evento', // Valor temporal
            direccionTexto: 'Calle 123 colonia Testing', // Valor temporal
            direccionLink: 'https://location.com', // Valor temporal
            comoPagarDescripcion: 'Se paga en el siguiente link', // Valor temporal
            comoPagarLink: 'https://link.pago.com', // Valor temporal
        };

        // Agregar el nuevo elemento al array de elementos
        botData.categorias[categoria].elementos.push(nuevoElemento);

        // Guardar los cambios en el JSON
        await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));

        // Crear un folder para el nuevo elemento
        const categoriaPath = path.join(__dirname, '../../data/categorias', categoria);
        const elementoPath = path.join(categoriaPath, nombreElemento);
        await fs.mkdir(elementoPath, { recursive: true });

        console.log(`✅ Elemento "${nombreElemento}" inicializado en la categoría "${categoria}".`);
        return nuevoElemento;
    } catch (error) {
        console.error(`❌ Error al inicializar el elemento:`, error);
        throw error; // Propagar el error si algo falla
    }
}

module.exports = { inicializarElemento };
