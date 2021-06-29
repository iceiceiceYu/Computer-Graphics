/**
 * render solid objects with solid program
 * render textured objects with texture program
 * @param gl: webgl
 * @param solid_program: shader program of solid objects
 * @param solid_objects: solid objects list to render
 * @param texture_program: shader program of texture objects
 * @param textured_objects: textured objects list to render
 */
function renderObjects(gl, solid_program, solid_objects, texture_program, textured_objects) {
    for (let object of solid_objects) {
        renderSolidObject(gl, solid_program, object);
    }
    for (let object of textured_objects) {
        renderTexturedObject(gl, texture_program, object);
    }
}

/**
 * render a solid object
 * @param gl: webgl
 * @param program: shader program of the solid object
 * @param object: the object to render
 */
function renderSolidObject(gl, program, object) {
    // set shader program
    gl.useProgram(program);
    // set basic attributes
    setBasicAttributes(gl, program, object);
    // set color to object color
    gl.uniform4f(program.u_Color, ...object.color, 1.0);
    // draw
    gl.drawElements(gl.TRIANGLES, object.numIndices, object.indexBuffer.type, 0);
}

/**
 * render a textured object
 * @param gl: webgl
 * @param program: shader program of the textured object
 * @param object: the object to render
 */
function renderTexturedObject(gl, program, object) {
    // set shader program
    gl.useProgram(program);
    // set basic attributes
    setBasicAttributes(gl, program, object);
    // init texture attribute from object
    initAttributeVariable(gl, program.a_TextureCoordinate, object.texCoordBuffer);
    // active texture
    gl.activeTexture(gl.TEXTURE0);
    // bind texture
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    // draw
    gl.drawElements(gl.TRIANGLES, object.numIndices, object.indexBuffer.type, 0);
}

/**
 * set basic attributes of the rendering object
 * @param gl: webgl
 * @param program: shader program of the object
 * @param object: the object to render
 */
function setBasicAttributes(gl, program, object) {
    // init position attribute and normal attribute from object
    initAttributeVariable(gl, program.a_Position, object.vertexBuffer);
    initAttributeVariable(gl, program.a_Normal, object.normalBuffer);

    const model_matrix = object.transform;
    const view_matrix = new Matrix4().setLookAt(...camera.eye, ...camera.at, ...camera.up);
    const proj_matrix = new Matrix4().setPerspective(camera.fov, camera.aspect, camera.near, camera.far);
    const mvp_matrix = new Matrix4().set(proj_matrix).multiply(view_matrix).multiply(model_matrix);
    const normal_matrix = new Matrix4().setInverseOf(model_matrix).transpose();

    gl.uniformMatrix4fv(program.u_ModelMatrix, false, model_matrix.elements);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvp_matrix.elements);
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, normal_matrix.elements);
    gl.uniform3f(program.u_CameraPosition, ...camera.eye);

    // bind element array buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
}
