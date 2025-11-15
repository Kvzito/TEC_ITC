/*
Kevin Javier Esquivel Villafuerte
A01174634
Script to create a smiley face in 2d with transformations
*/

'use strict';

import * as twgl from 'twgl.js';
import { M3 } from './2d-lib.js';
import GUI from 'lil-gui';

const vsGLSL = `#version 300 es
in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;
uniform mat3 u_transforms;

out vec4 v_color;

void main() {
    vec2 position = (u_transforms * vec3(a_position, 1)).xy;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
}
`;

const fsGLSL = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = v_color;
}
`;

function createFace() {
    const positions = [];
    const colors = [];
    const indices = [];
    
    const circleRadius = 80;
    const circleSegments = 50;
    const circleCenter = { x: 0, y: 0 };
    
    const circleStartIndex = 0;
    positions.push(circleCenter.x, circleCenter.y);
    colors.push(1, 1, 0, 1);
    
    for (let i = 0; i <= circleSegments; i++) {
        const angle = (i / circleSegments) * Math.PI * 2;
        const x = circleCenter.x + Math.cos(angle) * circleRadius;
        const y = circleCenter.y + Math.sin(angle) * circleRadius;
        positions.push(x, y);
        colors.push(1, 1, 0, 1);
    }
    
    for (let i = 1; i <= circleSegments; i++) {
        indices.push(0, i, i + 1);
    }
    
    const leftEyeRadius = 8;
    const leftEyeCenter = { x: -25, y: -20 };
    const leftEyeStartIndex = positions.length / 2;
    const eyeSegments = 20;
    
    positions.push(leftEyeCenter.x, leftEyeCenter.y);
    colors.push(0, 0, 0, 1); 
    
    for (let i = 0; i <= eyeSegments; i++) {
        const angle = (i / eyeSegments) * Math.PI * 2;
        const x = leftEyeCenter.x + Math.cos(angle) * leftEyeRadius;
        const y = leftEyeCenter.y + Math.sin(angle) * leftEyeRadius;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    for (let i = 0; i < eyeSegments; i++) {
        indices.push(leftEyeStartIndex, leftEyeStartIndex + i + 1, leftEyeStartIndex + i + 2);
    }
    
    const rightEyeCenter = { x: 25, y: -20 };
    const rightEyeStartIndex = positions.length / 2;
    
    positions.push(rightEyeCenter.x, rightEyeCenter.y);
    colors.push(0, 0, 0, 1); 
    
    for (let i = 0; i <= eyeSegments; i++) {
        const angle = (i / eyeSegments) * Math.PI * 2;
        const x = rightEyeCenter.x + Math.cos(angle) * leftEyeRadius;
        const y = rightEyeCenter.y + Math.sin(angle) * leftEyeRadius;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    for (let i = 0; i < eyeSegments; i++) {
        indices.push(rightEyeStartIndex, rightEyeStartIndex + i + 1, rightEyeStartIndex + i + 2);
    }
    
    const smileRadius = 45;
    const smileSegments = 30;
    const smileThickness = 5;
    const smileStartIndex = positions.length / 2;
    
    for (let i = 0; i <= smileSegments; i++) {
        const t = i / smileSegments;
        const angle = Math.PI * 0.2 + Math.PI * 0.6 * t;
        const x = Math.cos(angle) * smileRadius;
        const y = Math.sin(angle) * smileRadius + 10;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    for (let i = 0; i <= smileSegments; i++) {
        const t = i / smileSegments;
        const angle = Math.PI * 0.2 + Math.PI * 0.6 * t;
        const x = Math.cos(angle) * (smileRadius - smileThickness);
        const y = Math.sin(angle) * (smileRadius - smileThickness) + 10;
        positions.push(x, y);
        colors.push(0, 0, 0, 1);
    }
    
    for (let i = 0; i < smileSegments; i++) {
        const base = smileStartIndex;
        indices.push(
            base + i, base + i + 1, base + smileSegments + 1 + i,
            base + i + 1, base + smileSegments + 2 + i, base + smileSegments + 1 + i
        );
    }

    // Left eyebrow (angled line)
    const leftEyebrowStartIndex = positions.length / 2;
    const eyebrowThickness = 3;
    const leftEyebrowPoints = [
        { x: -40, y: -35 },
        { x: -15, y: -40 }
    ];

    for (let point of leftEyebrowPoints) {
        positions.push(point.x, point.y - eyebrowThickness);
        colors.push(0, 0, 0, 1);
    }
    for (let point of leftEyebrowPoints) {
        positions.push(point.x, point.y + eyebrowThickness);
        colors.push(0, 0, 0, 1);
    }

    indices.push(
        leftEyebrowStartIndex, leftEyebrowStartIndex + 1, leftEyebrowStartIndex + 2,
        leftEyebrowStartIndex + 1, leftEyebrowStartIndex + 3, leftEyebrowStartIndex + 2
    );

    // Right eyebrow (angled line)
    const rightEyebrowStartIndex = positions.length / 2;
    const rightEyebrowPoints = [
        { x: 15, y: -40 },
        { x: 40, y: -35 }
    ];

    for (let point of rightEyebrowPoints) {
        positions.push(point.x, point.y - eyebrowThickness);
        colors.push(0, 0, 0, 1);
    }
    for (let point of rightEyebrowPoints) {
        positions.push(point.x, point.y + eyebrowThickness);
        colors.push(0, 0, 0, 1);
    }

    indices.push(
        rightEyebrowStartIndex, rightEyebrowStartIndex + 1, rightEyebrowStartIndex + 2,
        rightEyebrowStartIndex + 1, rightEyebrowStartIndex + 3, rightEyebrowStartIndex + 2
    );

    // Tongue (pink semicircle sticking out downward from right side of smile)
    const tongueStartIndex = positions.length / 2;
    const tongueSegments = 15;

    // Position the tongue at the right corner of the smile
    const tongueAngle = Math.PI * 0.75;
    const tongueCenterX = Math.cos(tongueAngle) * (smileRadius - smileThickness/2) - 3;
    const tongueCenterY = Math.sin(tongueAngle) * (smileRadius - smileThickness/2) + 10;

    // Create a semicircle that points downward, rotated to follow smile curvature
    const tongueRadius = 10;
    // Rotate the tongue to align with the smile angle (tangent to the circle)
    const tongueRotation = tongueAngle - Math.PI / 2; // Perpendicular to radius

    // Center point at the top of the semicircle (where it connects to mouth)
    positions.push(tongueCenterX, tongueCenterY);
    colors.push(1, 0.3, 0.4, 1); // Pink color

    // Create semicircle from 0 to PI, rotated to follow smile curvature
    for (let i = 0; i <= tongueSegments; i++) {
        const angle = (i / tongueSegments) * Math.PI; // Only go from 0 to PI
        // Apply rotation to align with smile
        const rotatedAngle = angle + tongueRotation;
        const x = tongueCenterX + Math.cos(rotatedAngle) * tongueRadius;
        const y = tongueCenterY + Math.sin(rotatedAngle) * tongueRadius;
        positions.push(x, y);
        colors.push(1, 0.3, 0.4, 1); // Pink color
    }

    for (let i = 0; i < tongueSegments; i++) {
        indices.push(tongueStartIndex, tongueStartIndex + i + 1, tongueStartIndex + i + 2);
    }

    return {
        a_position: {
            numComponents: 2,
            data: positions
        },
        a_color: {
            numComponents: 4,
            data: colors
        },
        indices: {
            numComponents: 3,
            data: indices
        }
    };
}

function createPivot() {
    const positions = [];
    const colors = [];
    const indices = [];

    const moonRadius = 15;
    const moonSegments = 30;
    const cutoutRadius = 12; // Smaller circle to create crescent
    const cutoutOffsetX = 6; // Offset to create crescent shape

    // Create main circle (outer moon)
    positions.push(0, 0);
    colors.push(0.2, 0.4, 0.9, 1); // Blue color

    for (let i = 0; i <= moonSegments; i++) {
        const angle = (i / moonSegments) * Math.PI * 2;
        const x = Math.cos(angle) * moonRadius;
        const y = Math.sin(angle) * moonRadius;
        positions.push(x, y);
        colors.push(0.2, 0.4, 0.9, 1); // Blue color
    }

    for (let i = 1; i <= moonSegments; i++) {
        indices.push(0, i, i + 1);
    }

    // Create cutout circle (to subtract from main circle creating crescent)
    const cutoutStartIndex = positions.length / 2;
    positions.push(cutoutOffsetX, 0);
    colors.push(0.9, 0.9, 0.9, 1); // Background gray color

    for (let i = 0; i <= moonSegments; i++) {
        const angle = (i / moonSegments) * Math.PI * 2;
        const x = cutoutOffsetX + Math.cos(angle) * cutoutRadius;
        const y = Math.sin(angle) * cutoutRadius;
        positions.push(x, y);
        colors.push(0.9, 0.9, 0.9, 1); // Background gray color
    }

    for (let i = 1; i <= moonSegments; i++) {
        indices.push(cutoutStartIndex, cutoutStartIndex + i, cutoutStartIndex + i + 1);
    }

    return {
        a_position: {
            numComponents: 2,
            data: positions
        },
        a_color: {
            numComponents: 4,
            data: colors
        },
        indices: {
            numComponents: 3,
            data: indices
        }
    };
}

function main() {
    const canvas = document.querySelector('#canvas');
    const gl = canvas.getContext('webgl2');

    const programInfo = twgl.createProgramInfo(gl, [vsGLSL, fsGLSL]);

    const faceGeometry = createFace();
    const pivotGeometry = createPivot();

    const faceBufferInfo = twgl.createBufferInfoFromArrays(gl, faceGeometry);
    const pivotBufferInfo = twgl.createBufferInfoFromArrays(gl, pivotGeometry);

    const faceVAO = twgl.createVAOFromBufferInfo(gl, programInfo, faceBufferInfo);
    const pivotVAO = twgl.createVAOFromBufferInfo(gl, programInfo, pivotBufferInfo);

    // Resize canvas first to get actual dimensions
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    const centerX = gl.canvas.width / 2;
    const centerY = gl.canvas.height / 2;

    console.log('Canvas dimensions:', gl.canvas.width, 'x', gl.canvas.height);
    console.log('Center:', centerX, centerY);

    const transformParams = {
        pivotX: centerX - 100,
        pivotY: centerY,

        facePositionX: centerX + 100,
        facePositionY: centerY,
        faceRotation: 0,
        faceScaleX: 3.0,
        faceScaleY: 3.0
    };

    function render() {
        drawScene(gl, faceVAO, pivotVAO, programInfo, faceBufferInfo, pivotBufferInfo, transformParams);
    }

    const gui = new GUI();

    const pivotFolder = gui.addFolder('Pivot Position (Independent)');
    pivotFolder.add(transformParams, 'pivotX', 0, gl.canvas.width).name('Pivot X').onChange(() => {
        console.log('Pivot X changed to:', transformParams.pivotX);
        render();
    });
    pivotFolder.add(transformParams, 'pivotY', 0, gl.canvas.height).name('Pivot Y').onChange(() => {
        console.log('Pivot Y changed to:', transformParams.pivotY);
        render();
    });
    pivotFolder.open();

    const faceFolder = gui.addFolder('Face Transformations');
    faceFolder.add(transformParams, 'facePositionX', 0, gl.canvas.width).name('World Position X').onChange(() => {
        console.log('Face X changed to:', transformParams.facePositionX);
        render();
    });
    faceFolder.add(transformParams, 'facePositionY', 0, gl.canvas.height).name('World Position Y').onChange(() => {
        console.log('Face Y changed to:', transformParams.facePositionY);
        render();
    });
    faceFolder.add(transformParams, 'faceRotation', 0, 360).name('Rotation Around Pivot (deg)').onChange(() => {
        console.log('Rotation changed to:', transformParams.faceRotation);
        render();
    });
    faceFolder.add(transformParams, 'faceScaleX', 0.1, 5.0).name('Scale X').onChange(() => {
        console.log('Scale X changed to:', transformParams.faceScaleX);
        render();
    });
    faceFolder.add(transformParams, 'faceScaleY', 0.1, 5.0).name('Scale Y').onChange(() => {
        console.log('Scale Y changed to:', transformParams.faceScaleY);
        render();
    });
    faceFolder.open();

    render();
}

function drawScene(gl, faceVAO, pivotVAO, programInfo, faceBufferInfo, pivotBufferInfo, transformParams) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    let pivotMatrix = M3.identity();
    pivotMatrix = M3.multiply(M3.translation([transformParams.pivotX, transformParams.pivotY]), pivotMatrix);

    let pivotUniforms = {
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_transforms: pivotMatrix
    };

    twgl.setUniforms(programInfo, pivotUniforms);
    gl.bindVertexArray(pivotVAO);
    twgl.drawBufferInfo(gl, pivotBufferInfo);

    const rotationAngle = transformParams.faceRotation * Math.PI / 180;

    // Build transformation matrix in correct order
    // For matrix multiplication: last operation is multiplied first
    // We want: Scale -> Rotate -> Translate (in geometric order)
    // So we multiply: Translation * Rotation * Scale (in matrix order)
    let faceMatrix = M3.identity();

    // 1. Translate to world position (applied last geometrically)
    faceMatrix = M3.multiply(M3.translation([transformParams.facePositionX, transformParams.facePositionY]), faceMatrix);

    // 2. Rotate around its own center (applied second geometrically)
    faceMatrix = M3.multiply(M3.rotation(rotationAngle), faceMatrix);

    // 3. Scale the face (applied first geometrically)
    faceMatrix = M3.multiply(M3.scale([transformParams.faceScaleX, transformParams.faceScaleY]), faceMatrix);

    let faceUniforms = {
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_transforms: faceMatrix
    };

    twgl.setUniforms(programInfo, faceUniforms);
    gl.bindVertexArray(faceVAO);
    twgl.drawBufferInfo(gl, faceBufferInfo);
}

main();
