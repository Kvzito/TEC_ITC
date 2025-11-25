/*
 * Generador de Edificios - Crea archivos OBJ para edificios cilíndricos
 * Acepta argumentos de línea de comandos: lados, altura, radioBase, radioCima
 *
 * Uso: node generate_building.js [lados] [altura] [radioBase] [radioCima]
 */

import { V3 } from './3d-libs.js';
import * as fs from 'fs';

function generarEdificio() {
    // 1. Obtener argumentos de línea de comandos o usar valores por defecto
    const args = process.argv.slice(2);

    // Validación de límites según requerimientos
    let lados = parseInt(args[0]) || 8;
    if (lados < 3) lados = 3;
    if (lados > 36) lados = 36;

    const altura = parseFloat(args[1]) || 6.0;
    const radioBase = parseFloat(args[2]) || 1.0;
    const radioCima = parseFloat(args[3]) || 0.8;

    // Nombre del archivo de salida
    const nombreArchivo = `building_${lados}_${altura}_${radioBase}_${radioCima}.obj`;

    console.log(`Generando edificio: Lados=${lados}, Altura=${altura}, R.Base=${radioBase}, R.Cima=${radioCima}`);

    // Arrays para almacenar la data del OBJ
    const vertices = [];
    const normales = [];
    const caras = [];

    // --- GENERACIÓN DE VÉRTICES ---
    // Generamos cada vértice con sus normales correspondientes
    // Para las tapas (arriba/abajo), generamos vértices duplicados con normales verticales
    // Para las paredes laterales, generamos vértices con normales laterales

    // Primero generamos todos los vértices únicos del edificio
    const centroAbajo = V3.create(0, 0, 0);
    const centroArriba = V3.create(0, altura, 0);

    const verticesBase = [];
    const verticesCima = [];

    for (let i = 0; i < lados; i++) {
        const theta = (i / lados) * 2 * Math.PI;
        const x = Math.cos(theta);
        const z = Math.sin(theta);

        verticesBase.push(V3.create(x * radioBase, 0, z * radioBase));
        verticesCima.push(V3.create(x * radioCima, altura, z * radioCima));
    }

    // --- GENERACIÓN DE NORMALES Y VÉRTICES PARA EL OBJ ---
    // Calculamos las normales laterales para cada lado del polígono
    const normalesLaterales = [];
    for (let i = 0; i < lados; i++) {
        const theta = (i / lados) * 2 * Math.PI;
        const x = Math.cos(theta);
        const z = Math.sin(theta);

        // Vector tangente perpendicular al radio
        const tangente = V3.create(-z, 0, x);

        // Vector del vértice base al vértice cima
        const vectorPendiente = V3.subtract(verticesCima[i], verticesBase[i]);

        // Normal = tangente × pendiente (apunta hacia afuera)
        const normalLateral = V3.cross(tangente, vectorPendiente);
        V3.normalize(normalLateral, normalLateral);

        normalesLaterales.push(normalLateral);
    }

    // Ahora generamos los vértices y normales para cada cara del OBJ
    // TAPA INFERIOR: Centro + vértices base (normal hacia abajo)
    vertices.push(centroAbajo);
    normales.push(V3.create(0, -1, 0));

    for (let i = 0; i < lados; i++) {
        vertices.push(verticesBase[i]);
        normales.push(V3.create(0, -1, 0));
    }

    // TAPA SUPERIOR: Centro + vértices cima (normal hacia arriba)
    vertices.push(centroArriba);
    normales.push(V3.create(0, 1, 0));

    for (let i = 0; i < lados; i++) {
        vertices.push(verticesCima[i]);
        normales.push(V3.create(0, 1, 0));
    }

    // PAREDES LATERALES: 4 vértices por cada cara lateral (2 triángulos por cara)
    for (let i = 0; i < lados; i++) {
        const next = (i + 1) % lados;

        // Cada quad lateral necesita sus propias normales
        // Usamos la normal promedio entre los dos lados adyacentes
        const normalActual = normalesLaterales[i];
        const normalSiguiente = normalesLaterales[next];

        // Vértice base actual
        vertices.push(verticesBase[i]);
        normales.push(normalActual);

        // Vértice base siguiente
        vertices.push(verticesBase[next]);
        normales.push(normalSiguiente);

        // Vértice cima actual
        vertices.push(verticesCima[i]);
        normales.push(normalActual);

        // Vértice cima siguiente
        vertices.push(verticesCima[next]);
        normales.push(normalSiguiente);
    }

    // --- GENERACIÓN DE CARAS (Faces) ---
    // Formato: f v//vn v//vn v//vn
    // Los índices en OBJ empiezan en 1

    // TAPA INFERIOR (vista desde abajo, orden CW para que normal apunte hacia abajo)
    const centroAbajoIdx = 1;
    for (let i = 0; i < lados; i++) {
        const next = (i + 1) % lados;
        const currentIdx = 2 + i;
        const nextIdx = 2 + next;

        // Orden: centro -> actual -> siguiente (CW desde abajo)
        caras.push(`f ${centroAbajoIdx}//${centroAbajoIdx} ${currentIdx}//${currentIdx} ${nextIdx}//${nextIdx}`);
    }

    // TAPA SUPERIOR (vista desde arriba, orden CCW para que normal apunte hacia arriba)
    const centroArribaIdx = 2 + lados;
    for (let i = 0; i < lados; i++) {
        const next = (i + 1) % lados;
        const currentIdx = centroArribaIdx + 1 + i;
        const nextIdx = centroArribaIdx + 1 + next;

        // Orden: centro -> siguiente -> actual (CCW desde arriba)
        caras.push(`f ${centroArribaIdx}//${centroArribaIdx} ${nextIdx}//${nextIdx} ${currentIdx}//${currentIdx}`);
    }

    // PAREDES LATERALES (vista desde fuera, orden CCW)
    const baseParedes = 2 + lados + 1 + lados; // Después de ambas tapas
    for (let i = 0; i < lados; i++) {
        const offset = baseParedes + (i * 4);

        const baseActualIdx = offset;
        const baseSiguienteIdx = offset + 1;
        const cimaActualIdx = offset + 2;
        const cimaSiguienteIdx = offset + 3;

        // Triángulo 1: base actual -> cima actual -> base siguiente (CCW desde fuera)
        caras.push(`f ${baseActualIdx}//${baseActualIdx} ${cimaActualIdx}//${cimaActualIdx} ${baseSiguienteIdx}//${baseSiguienteIdx}`);

        // Triángulo 2: base siguiente -> cima actual -> cima siguiente (CCW desde fuera)
        caras.push(`f ${baseSiguienteIdx}//${baseSiguienteIdx} ${cimaActualIdx}//${cimaActualIdx} ${cimaSiguienteIdx}//${cimaSiguienteIdx}`);
    }

    // --- ESCRITURA DEL ARCHIVO ---
    const fileStream = fs.createWriteStream(nombreArchivo);

    fileStream.write(`# Generado por Script Node.js\n`);
    fileStream.write(`# Lados: ${lados}, Altura: ${altura}\n`);
    fileStream.write(`# Radio Base: ${radioBase}, Radio Cima: ${radioCima}\n\n`);

    // Escribir Vértices
    vertices.forEach(v => {
        // toFixed(4) para mantener formato limpio
        fileStream.write(`v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}\n`);
    });

    fileStream.write('\n');

    // Escribir Normales
    normales.forEach(vn => {
        fileStream.write(`vn ${vn[0].toFixed(4)} ${vn[1].toFixed(4)} ${vn[2].toFixed(4)}\n`);
    });

    fileStream.write('\n');

    // Escribir Caras
    caras.forEach(f => {
        fileStream.write(`${f}\n`);
    });

    fileStream.end();
    console.log(`Archivo ${nombreArchivo} creado exitosamente.`);
    console.log(`  Vértices: ${vertices.length}`);
    console.log(`  Normales: ${normales.length}`);
    console.log(`  Caras: ${caras.length}`);
}

// Ejecutar la función
generarEdificio();
