/**
 * get one solid object
 * @param gl: webgl
 * @param object_info: object information
 * @return {Object}
 */
function getSolidObject(gl, object_info) {
    // set the vertex information

    const object = initVertexBuffersFromFile(gl, object_info, 1, true);
    object.color = object_info.color;

    // set transform matrix, exactly model matrix
    object.transform = new Matrix4();
    for (let transform of object_info.transform) {
        switch (transform.type) {
            case 'translate':
                object.transform.translate(...transform.content);
                break;
            case 'scale':
                object.transform.scale(...transform.content);
                break;
            case 'rotate':
                object.transform.rotate(...transform.content);
                break;
            default:
                console.log("unknown transform type " + transform.type);
        }
    }
    return object;
}

/**
 * get one textured object
 * @param gl: webgl
 * @param res: object resource
 * @param program: shader program
 * @return {null|{vertexBuffer: (AudioBuffer|WebGLBuffer), numIndices, texCoordBuffer: (AudioBuffer|WebGLBuffer), indexBuffer: (AudioBuffer|WebGLBuffer), normalBuffer: (AudioBuffer|WebGLBuffer)}}
 */
function getTexturedObject(gl, res, program) {
    // set the vertex information
    const object = initVertexBuffers(gl, new Float32Array(res.vertex), new Float32Array(res.normal),
        new Float32Array(res.texCoord), new Uint16Array(res.index));

    // init texture
    object.texture = initTexture(gl, program, res.texImagePath);
    if (!object.texture) {
        console.log('failed to initialize the texture');
        return null;
    }

    // set transform matrix, exactly model matrix
    object.transform = new Matrix4().translate(...res.translate).scale(...res.scale);
    return object;
}

/**
 * init attribute from object
 * @param gl: webgl
 * @param a_attribute: attribute to init
 * @param buffer: buffer holds the attribute information
 */
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

/**
 * get location of shader variables
 * assign shader variables to the same-name properties of program object
 * @param gl: webgl
 * @param program: shader program
 * @param variables: shader variables
 * @return {boolean}
 */
function assignVariablePositionToProgramObject(gl, program, variables) {
    for (let variable of variables) {
        program[variable] = variable[0] === 'a' ?
            gl.getAttribLocation(program, variable) :
            gl.getUniformLocation(program, variable);
        const fail = variable[0] === 'a' ? program[variable] < 0 : !program[variable];
        if (fail) {
            console.log("fail to get variable location of " + variable);
            return false;
        }
    }
    return true;
}

function initVertexBuffers(gl, vertices, normals, texCoords, indices) {
    const o = {
        vertexBuffer: initArrayBuffer(gl, vertices, 3, gl.FLOAT),
        normalBuffer: initArrayBuffer(gl, normals, 3, gl.FLOAT),
        texCoordBuffer: initArrayBuffer(gl, texCoords, 2, gl.FLOAT),
        indexBuffer: initElementArrayBuffer(gl, indices, gl.UNSIGNED_SHORT),
        numIndices: indices.length,
    };

    if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer) {
        console.log("fail to init buffer");
        return null;
    }

    // unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initVertexBuffersFromFile(gl, object_info, scale, reverse) {
    const objDoc = new OBJDoc(object_info.objFilePath);
    const o = new Object();

    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status !== 404) {
            if (!objDoc.parse(request.responseText, scale, reverse)) {
                console.log("object file " + object_info.objFilePath + " load error");
            }

            const drawInfo = objDoc.getDrawingInfo();

            o.vertexBuffer = initArrayBuffer(gl, drawInfo.vertices, 3, gl.FLOAT);
            o.normalBuffer = initArrayBuffer(gl, drawInfo.normals, 3, gl.FLOAT);
            o.indexBuffer = initElementArrayBuffer(gl, drawInfo.indices, gl.UNSIGNED_SHORT);
            o.numIndices = drawInfo.indices.length;

            if (!o.vertexBuffer || !o.normalBuffer || !o.indexBuffer) {
                console.log("fail to init buffer");
                return null;
            }

            // unbind the buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            totalResource--;
            console.log("object file " + object_info.objFilePath + " load success");
        }
    };
    request.open('GET', object_info.objFilePath, true);
    request.send();

    return o;
}

function initArrayBuffer(gl, data, num, type) {
    // create a buffer object
    const buffer = gl.createBuffer();
    if (!buffer) {
        console.log('failed to create the buffer object');
        return null;
    }
    // write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // keep the information necessary to assign to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initElementArrayBuffer(gl, data, type) {
    // create a buffer object
    const buffer = gl.createBuffer();
    if (!buffer) {
        console.log('failed to create the buffer object');
        return null;
    }
    // write date into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.type = type;

    return buffer;
}

function initTexture(gl, program, texImagePath) {
    const texture = gl.createTexture();
    if (!texture) {
        console.log('failed to create the texture object');
        return null;
    }

    const image = new Image();
    if (!image) {
        console.log('failed to create the image object');
        return null;
    }

    image.onload = function () {
        // write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // flip the image Y coordinate
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);

        // pass the texture unit 0 to u_Sampler
        gl.useProgram(program);
        gl.uniform1i(program.u_Sampler, 0);

        gl.bindTexture(gl.TEXTURE_2D, null); // unbind texture

        totalResource--;
        console.log("image " + texImagePath + " load success");
    };

    // tell the browser to load the image
    image.src = texImagePath;
    return texture;
}
