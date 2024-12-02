// src/handlers/hostMessages007.js
// Voy a reajustar los menus y submenus para que sea escalable. 

const { actualizarEstadoBot, obtenerEstadoActual, resetBotValues, obtenerEstadoBot } = require('../utils/botState'); // Importa las funciones necesarias
const { crearCategoria, actualizarTipoElemento, generarMenuCategorias } = require('../utils/categoryUtils'); // Importar funciones
const { mostrarMenuPrincipal, mostrarMenuGestionCategorias, mostrarMenuConfiguraciones, mostrarMenuGestionarElementos } = require('../utils/menuUtils'); // funcion para poner menu principal. 
const { inicializarElemento } = require('../utils/elementUtils'); // Importar funciones inicializarElemento






const fs = require('fs').promises;
const path = require('path');

// Define la ruta al archivo JSON
const dataPath = path.join(__dirname, '../../data/botData.json');


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
        } else if (message.body.toLowerCase() === '/setup') {
            // al poner /setup se manda el menu principal. 
            await mostrarMenuPrincipal(client, message);
        } else {
            console.log('⚠️ Comando no reconocido en estado inicial. Ignorando.');
        }
    } else if (estadoActual === 'menu_principal') {
        const opcion = message.body.trim();

        if (opcion === '1') {
            // Ir al submenú "Gestionar categorías"
            await mostrarMenuGestionCategorias(client, message);
        } else if (opcion === '2') {
            // Ir al submenú "Ajustar configuraciones"
            await mostrarMenuConfiguraciones(client, message);
        } else if (opcion === '3') {
            // Mostrar el estado del bot
            const estadoBot = await obtenerEstadoBot();
            await client.sendMessage(message.from, estadoBot);
            await client.sendMessage(message.to, estadoBot);
        } else if (opcion === '4') {
            // Ir al submenú "Gestionar elementos"
            await mostrarMenuGestionarElementos(client, message);
        } else if (opcion === '5') {
            // Salir del bot
            const response = '<bot> 👋 ¡Gracias por usar el bot! Para reiniciar, escribe /bot.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reiniciar estado completo del bot
            await resetBotValues();
        } else {
            // Respuesta inválida
            const response = '<bot> ⚠️ Opción no válida. Por favor, selecciona una opción del menú.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reenviar el menú principal
            await mostrarMenuPrincipal(client, message);
        }
    } else if (estadoActual === 'gestion_categorias') {
        // Respuestas esperadas para el submenú "Gestionar categorías"
        const opcion = message.body.trim();

        if (opcion === '1') {
            // Crear nueva categoría
            const response = '<bot> 🟢 Has seleccionado: Crear nueva categoría.\n⚠️ Por favor, escribe el nombre de la nueva categoría usando una sola palabra, sin puntos, comas, espacios ni caracteres especiales. Ejemplos: "fiestas", "ventas", "restaurantes".';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Cambiar el estado para esperar el nombre de la categoría
            await actualizarEstadoBot('esperando_nombre_categoria');
            console.log('✅ Estado cambiado a "esperando_nombre_categoria".');
        } else if (opcion === '2') {
            // Editar una categoría
            const menuCategorias = await generarMenuCategorias();
            if (menuCategorias.includes('⚠️')) {
                // Si no hay categorías, regresa al submenú
                await client.sendMessage(message.from, menuCategorias);
                await client.sendMessage(message.to, menuCategorias);
                await mostrarMenuGestionCategorias(client, message);
                return;
            }

            // Enviar menú dinámico y cambiar estado
            await client.sendMessage(message.from, menuCategorias);
            await client.sendMessage(message.to, menuCategorias);
            await actualizarEstadoBot('esperando_categoria_a_editar');
            console.log('✅ Estado cambiado a "esperando_categoria_a_editar".');
        } else if (opcion === '3') {
            // Borrar una categoría
            const menuCategorias = await generarMenuCategorias();
            if (menuCategorias.includes('⚠️')) {
                // Si no hay categorías, regresa al submenú
                await client.sendMessage(message.from, menuCategorias);
                await client.sendMessage(message.to, menuCategorias);
                await mostrarMenuGestionCategorias(client, message);
                return;
            }

            // Enviar menú dinámico y cambiar estado
            await client.sendMessage(message.from, menuCategorias);
            await client.sendMessage(message.to, menuCategorias);
            await actualizarEstadoBot('esperando_categoria_a_borrar');
            console.log('✅ Estado cambiado a "esperando_categoria_a_borrar".');
        } else if (opcion === '4') {
            // Volver al menú principal
            await mostrarMenuPrincipal(client, message);
        } else {
            // Respuesta inválida
            const response = '<bot> ⚠️ Opción no válida. Por favor, selecciona una opción del menú.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reenviar el submenú "Gestionar categorías" si la respuesta fue inválida
            await mostrarMenuGestionCategorias(client, message);
            console.log('🔄 Submenú "Gestionar categorías" reenviado tras respuesta inválida.');
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

    } else if (estadoActual === 'esperando_categoria_a_editar') {
        const opcionSeleccionada = parseInt(message.body.trim(), 10);

        // Leer categorías de botData.json
        const filePath = path.join(__dirname, '../../data/botData.json');
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);
        const categorias = Object.keys(botData.categorias);

        if (isNaN(opcionSeleccionada) || opcionSeleccionada < 1 || opcionSeleccionada > categorias.length) {
            // Respuesta inválida
            const response = '<bot> ⚠️ Selección no válida. Por favor, selecciona un número del menú.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reenviar el menú dinámico
            const menuCategorias = await generarMenuCategorias();
            await client.sendMessage(message.from, menuCategorias);
            await client.sendMessage(message.to, menuCategorias);
            return;
        }

        // Obtener la categoría seleccionada
        const categoriaSeleccionada = categorias[opcionSeleccionada - 1];
        console.log(`✅ Categoría seleccionada para edición: ${categoriaSeleccionada}`);

        // Guardar la categoría seleccionada en el estado del bot
        botData.estadoBot.categoriaActual = categoriaSeleccionada;
        await fs.writeFile(filePath, JSON.stringify(botData, null, 4));

        // Solicitar el nuevo nombre
        const response = `<bot> 🛠️ Vas a editar la categoría: ${categoriaSeleccionada}.\nPor favor, escribe el nuevo nombre para esta categoría.`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Cambiar el estado para esperar el nuevo nombre
        await actualizarEstadoBot('esperando_nuevo_nombre_categoria');
        console.log('✅ Estado cambiado a "esperando_nuevo_nombre_categoria".');
    } else if (estadoActual === 'esperando_nuevo_nombre_categoria') {
        const nuevoNombre = message.body.trim();

        // Validar el nuevo nombre
        const regex = /^[a-zA-Z0-9_-]+$/; // Permite letras, números, guiones y guiones bajos
        if (!regex.test(nuevoNombre)) {
            const response = '<bot> ⚠️ El nombre de la categoría no es válido. Usa una sola palabra sin puntos, comas, espacios ni caracteres especiales.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            return;
        }

        // Leer el archivo botData.json
        const filePath = path.join(__dirname, '../../data/botData.json');
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);

        // Verificar si el nuevo nombre ya existe
        if (botData.categorias[nuevoNombre]) {
            const response = `<bot> ⚠️ El nombre "${nuevoNombre}" ya existe. Por favor, intenta con otro nombre.`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            return;
        }

        // Obtener la categoría actual
        const categoriaActual = botData.estadoBot.categoriaActual;
        if (!categoriaActual) {
            const response = '<bot> ❌ No se encontró la categoría actual. Por favor, reinicia el proceso.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            await mostrarMenuPrincipal(client, message);
            return;
        }

        // Renombrar la categoría
        botData.categorias[nuevoNombre] = botData.categorias[categoriaActual];
        delete botData.categorias[categoriaActual];
        botData.estadoBot.categoriaActual = null; // Limpiar la categoría actual

        // Guardar los cambios
        await fs.writeFile(filePath, JSON.stringify(botData, null, 4));
        console.log(`✅ Categoría renombrada: "${categoriaActual}" -> "${nuevoNombre}"`);

        // Confirmar el cambio
        const response = `<bot> ✅ La categoría "${categoriaActual}" ha sido renombrada a "${nuevoNombre}".`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Volver al menú principal
        await mostrarMenuPrincipal(client, message);
    } else if (estadoActual === 'esperando_categoria_a_borrar') {
        const opcionSeleccionada = parseInt(message.body.trim(), 10);

        // Leer categorías de botData.json
        const filePath = path.join(__dirname, '../../data/botData.json');
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);
        const categorias = Object.keys(botData.categorias);

        if (isNaN(opcionSeleccionada) || opcionSeleccionada < 1 || opcionSeleccionada > categorias.length) {
            // Respuesta inválida
            const response = '<bot> ⚠️ Selección no válida. Por favor, selecciona un número del menú.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reenviar el menú dinámico
            const menuCategorias = await generarMenuCategorias();
            await client.sendMessage(message.from, menuCategorias);
            await client.sendMessage(message.to, menuCategorias);
            return;
        }

        // Obtener la categoría seleccionada
        const categoriaSeleccionada = categorias[opcionSeleccionada - 1];
        console.log(`✅ Categoría seleccionada para borrado: ${categoriaSeleccionada}`);

        // Guardar la categoría seleccionada en el estado del bot
        botData.estadoBot.categoriaActual = categoriaSeleccionada;
        await fs.writeFile(filePath, JSON.stringify(botData, null, 4));

        // Solicitar confirmación para borrar
        const response = `<bot> ❌ Vas a borrar la categoría: "${categoriaSeleccionada}".\n⚠️ Escribe "CONFIRMAR" para continuar o "CANCELAR" para volver al menú principal.`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Cambiar el estado para confirmar el borrado
        await actualizarEstadoBot('confirmando_borrado_categoria');
        console.log('✅ Estado cambiado a "confirmando_borrado_categoria".');
    } else if (estadoActual === 'confirmando_borrado_categoria') {
        const confirmacion = message.body.trim().toUpperCase();

        // Leer el archivo botData.json
        const filePath = path.join(__dirname, '../../data/botData.json');
        const data = await fs.readFile(filePath, 'utf8');
        const botData = JSON.parse(data);

        const categoriaActual = botData.estadoBot.categoriaActual;
        if (!categoriaActual) {
            const response = '<bot> ❌ No se encontró la categoría seleccionada. Por favor, reinicia el proceso.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            await mostrarMenuPrincipal(client, message);
            return;
        }

        if (confirmacion === 'CONFIRMAR') {
            // Eliminar la categoría del JSON
            delete botData.categorias[categoriaActual];
            botData.estadoBot.categoriaActual = null;

            // Guardar los cambios en el JSON
            await fs.writeFile(filePath, JSON.stringify(botData, null, 4));
            console.log(`✅ Categoría borrada del JSON: "${categoriaActual}"`);

            // Ruta de la carpeta de la categoría
            const categoryPath = path.join(__dirname, '../../data/categorias', categoriaActual);

            try {
                // Eliminar el directorio de la categoría
                await fs.rm(categoryPath, { recursive: true, force: true });
                console.log(`✅ Carpeta borrada: "${categoryPath}"`);
            } catch (error) {
                console.error(`❌ Error al borrar la carpeta de la categoría "${categoriaActual}":`, error);
                const response = `<bot> ⚠️ La categoría "${categoriaActual}" fue eliminada del sistema, pero hubo un error al borrar su carpeta. Por favor, revisa manualmente.`;
                await client.sendMessage(message.from, response);
                await client.sendMessage(message.to, response);
                return;
            }

            // Confirmar el borrado al usuario
            const response = `<bot> ✅ La categoría "${categoriaActual}" ha sido borrada exitosamente, incluyendo su carpeta.`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Volver al menú principal
            await mostrarMenuPrincipal(client, message);
        } else if (confirmacion === 'CANCELAR') {
            // Cancelar el borrado y volver al menú principal
            const response = `<bot> ❌ Operación cancelada. Regresando al menú principal.`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            botData.estadoBot.categoriaActual = null;
            await fs.writeFile(filePath, JSON.stringify(botData, null, 4));

            await mostrarMenuPrincipal(client, message);
        } else {
            // Respuesta inválida
            const response = '<bot> ⚠️ Respuesta no válida. Por favor, escribe "CONFIRMAR" o "CANCELAR".';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
        }
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
    } else if (estadoActual === 'configuraciones') {
        const opcion = message.body.trim();

        if (opcion === '1') {
            // Ajustar fecha y hora
            const response = `<bot>\n🕒 Has seleccionado: Ajustar fecha y hora.\n⚠️ Por favor, escribe la nueva fecha y hora en el formato: "AAAAMMDDHHmm".\n\nEjemplo:\n*202412312359*\n(31 de diciembre de 2024, 23:59).`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Cambiar el estado para esperar la nueva fecha y hora
            await actualizarEstadoBot('esperando_fecha_hora');
            console.log('✅ Estado cambiado a "esperando_fecha_hora".');
        } else if (opcion === '2') {
            // Volver al menú principal
            await mostrarMenuPrincipal(client, message);
        } else {
            // Respuesta inválida
            const response = '<bot> ⚠️ Opción no válida. Por favor, selecciona una opción del menú.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Reenviar el submenú "Configuraciones"
            await mostrarMenuConfiguraciones(client, message);
            console.log('🔄 Submenú "Configuraciones" reenviado tras respuesta inválida.');
        }
    } else if (estadoActual === 'esperando_fecha_hora') {
        const nuevaFechaHora = message.body.trim();

        // Validar el formato de fecha y hora
        const regex = /^[0-9]{12}$/; // Valida que sean exactamente 12 dígitos
        if (!regex.test(nuevaFechaHora)) {
            const response = '<bot> ⚠️ El formato no es válido. Por favor, escribe la fecha y hora en el formato "YYYYMMDDHHmm".\n\nEjemplo:\n- 202412312359 (31 de diciembre de 2024, 23:59).';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
            return;
        }

        // Extraer componentes de la fecha/hora
        const anio = parseInt(nuevaFechaHora.substring(0, 4), 10);
        const mes = parseInt(nuevaFechaHora.substring(4, 6), 10) - 1; // Meses comienzan en 0
        const dia = parseInt(nuevaFechaHora.substring(6, 8), 10);
        const hora = parseInt(nuevaFechaHora.substring(8, 10), 10);
        const minutos = parseInt(nuevaFechaHora.substring(10, 12), 10);

        // Convertir la hora proporcionada en un objeto Date
        const fechaHoraUsuario = new Date(anio, mes, dia, hora, minutos);

        // Calcular la diferencia entre la hora del sistema y la hora del usuario
        const fechaHoraSistema = new Date();
        const offset = fechaHoraUsuario.getTime() - fechaHoraSistema.getTime();
        console.log(`⏳ Offset calculado: ${offset} ms`);

        // Guardar el offset en memoria (puedes usar una variable global o un archivo)
        global.botTimeOffset = offset;

        // Confirmar al usuario
        const response = `<bot> ✅ Fecha y hora ajustadas correctamente.\nEl bot ahora utiliza la hora calibrada: ${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')} ${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}.`;
        await client.sendMessage(message.from, response);
        await client.sendMessage(message.to, response);

        // Volver al menú principal
        await mostrarMenuPrincipal(client, message);

    } else if (estadoActual === 'esperando_categoria_para_elemento') {
        const seleccion = parseInt(message.body.trim(), 10);

        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);

        const categorias = Object.keys(botData.categorias);

        if (seleccion > 0 && seleccion <= categorias.length) {
            const categoriaSeleccionada = categorias[seleccion - 1];
            const tipoElemento = botData.categorias[categoriaSeleccionada].tipoElementos || 'elemento'; // Valor dinámico

            // Confirmar categoría seleccionada al usuario
            const response = `<bot>\n✅ Has seleccionado la categoría: *${categoriaSeleccionada}*.\nVamos a empezar a configurar un nuevo *${tipoElemento}*.`;
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);

            // Cambiar el estado del bot y guardar la categoría actual
            botData.estadoBot.categoriaActual = categoriaSeleccionada;
            await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));

            const pregunta = `<bot>\n📌 Por favor, escribe el *nombre del ${tipoElemento}*.`;
            await client.sendMessage(message.from, pregunta);
            await client.sendMessage(message.to, pregunta);

            await actualizarEstadoBot('creando_elemento');
            console.log(`✅ Estado actualizado a "creando_elemento". Categoría seleccionada: ${categoriaSeleccionada}`);
        } else {
            const errorResponse = `<bot>\n❌ Opción inválida. Por favor, selecciona un número del menú.`;
            await client.sendMessage(message.from, errorResponse);
            await client.sendMessage(message.to, errorResponse);

            // Reenviar el menú de categorías
            const opciones = categorias.map((categoria, index) => `${index + 1}️⃣ ${categoria}`).join('\n');
            const menu = `
    <bot>\n*Gestionar elementos:*
    Selecciona una categoría para agregar un elemento:
    ${opciones}
    ${categorias.length === 0 ? 'No hay categorías disponibles.' : ''}
    `.trim();

            await client.sendMessage(message.from, menu);
            await client.sendMessage(message.to, menu);

            console.log('🔄 Menú reenviado tras opción inválida.');
        }
    } else if (estadoActual === 'creando_elemento') {
        // Leer el archivo JSON
        const data = await fs.readFile(dataPath, 'utf8');
        const botData = JSON.parse(data);
    
        const categoriaActual = botData.estadoBot.categoriaActual;
    
        if (!categoriaActual) {
            const response = '<bot> ❌ No se encontró una categoría activa para crear el elemento. Por favor, reinicia el proceso.';
            await client.sendMessage(message.from, response);
            await client.sendMessage(message.to, response);
    
            await mostrarMenuPrincipal(client, message);
            return;
        }
    
        if (!botData.estadoBot.elementoActual) {
            // Usar el nombre proporcionado en el paso anterior
            const nombreElemento = message.body.trim();
    
            try {
                // Inicializar el nuevo elemento y crear su folder
                const nuevoElemento = await inicializarElemento(categoriaActual, nombreElemento, dataPath);
    
                // Guardar el nuevo elemento actual en el estado del bot
                botData.estadoBot.elementoActual = nuevoElemento;
                await fs.writeFile(dataPath, JSON.stringify(botData, null, 4));
    
                // Continuar con el siguiente paso
                const response = `<bot>\n✅ Nuevo elemento creado: *${nombreElemento}*.\n📌 Ahora escribe el *comando del evento* (por ejemplo, /concierto).`;
                await client.sendMessage(message.from, response);
                await client.sendMessage(message.to, response);
            } catch (error) {
                const response = '<bot> ❌ Hubo un problema al crear el nuevo elemento. Por favor, intenta de nuevo.';
                await client.sendMessage(message.from, response);
                await client.sendMessage(message.to, response);
    
                // Volver al menú principal en caso de error
                await mostrarMenuPrincipal(client, message);
            }
        }
    }


}

module.exports = { handleHostMessage };
