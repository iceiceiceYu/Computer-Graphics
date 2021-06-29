// Vertex shader program
const VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '	gl_Position = u_ModelMatrix * a_Position;\n' +
    '	v_Color = a_Color;\n' +
    '	v_TexCoord = a_TexCoord;\n' +
    '}\n';

// Fragment shader program
const FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'uniform vec4 u_GridColor;\n' +
    'uniform bool u_isToDrawGrid;\n' +
    'uniform bool u_isToUseTextureImage;\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '	if (u_isToDrawGrid)\n' +
    '		gl_FragColor = u_GridColor;\n' +
    '	else if (u_isToUseTextureImage)\n' +
    '		gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '	else\n' +
    '		gl_FragColor = v_Color;\n' +
    '}\n';

let u_ModelMatrix = null;
let modelMatrix = new Matrix4();

/**
 * @param gl
 * @param polygons {Polygon[]}: the polygons array
 * @param showBorder {boolean}: show border or not
 * @returns {number}
 */
function initVertexBuffers(gl, polygons, showBorder) {
    let vertices = new Float32Array(getVerticesArray(polygons, showBorder));

    // The number of vertices
    let n = 6 * polygons.length;
    // Create a buffer object
    let vertexBuffer = gl.createBuffer();
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 5, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Assign the buffer object to a_Color variable
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, vertices.BYTES_PER_ELEMENT * 5, vertices.BYTES_PER_ELEMENT * 2);
    // Enable the assignment to a_Color variable
    gl.enableVertexAttribArray(a_Color);

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Get storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    return n;
}

function draw(gl, n, current_angle, current_scale, show_border) {
    // Set the rotation angle and rotation axis (z-axis)
    modelMatrix.setRotate(current_angle, 0, 0, 1);
    // Set the scaling rate
    modelMatrix.scale(current_scale, current_scale, current_scale);
    // Pass the rotation matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw the polygon
    gl.drawArrays(gl.TRIANGLES, 0, n);
    if (show_border) {
        for (let i = 0; i < n / 6; i++) {
            gl.drawArrays(gl.LINE_STRIP, n + i * 6, 6); // Draw the border
        }
    }
}
