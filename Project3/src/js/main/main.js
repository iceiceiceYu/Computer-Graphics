// number of the resources
let totalResource = 8;
// rotation angle
let bird_rotation = 0;

function main() {
    // get canvas and webgl objects
    const canvas = document.getElementById("webgl");
    const gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('failed to get the rendering context for WebGL');
        return;
    }

    // set aspect radio
    camera.aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // set shader program
    const solid_program = createProgram(gl, SOLID_VERTEX_SHADER_SOURCE, SOLID_FRAGMENT_SHADER_SOURCE);
    const texture_program = createProgram(gl, TEXTURE_VERTEX_SHADER_SOURCE, TEXTURE_FRAGMENT_SHADER_SOURCE);
    if (!solid_program || !texture_program) {
        console.log('failed to initialize shaders');
        return;
    }

    // get variable positions
    if (!assignVariablePositionToProgramObject(gl, solid_program,
        ['a_Position', 'a_Normal', 'u_ModelMatrix', 'u_MvpMatrix', 'u_NormalMatrix', 'u_LightDirection', 'u_Color',
            'u_AmbientLightColor', 'u_PointLightColor', 'u_CameraPosition'])) {
        console.log('failed to initialize solid shader information')
        return;
    }
    if (!assignVariablePositionToProgramObject(gl, texture_program,
        ['a_Position', 'a_Normal', 'u_ModelMatrix', 'u_MvpMatrix', 'u_NormalMatrix', 'a_TextureCoordinate', 'u_Sampler',
            'u_AmbientLightColor', 'u_LightDirection', 'u_PointLightColor', 'u_CameraPosition'])) {
        console.log('failed to initialize texture shader information')
        return;
    }

    // assign ambient light color and directional light color
    gl.useProgram(solid_program);
    gl.uniform3f(solid_program.u_AmbientLightColor, ...sceneAmbientLight);
    gl.uniform3f(solid_program.u_LightDirection, ...sceneDirectionLight);
    gl.useProgram(texture_program);
    gl.uniform3f(texture_program.u_AmbientLightColor, ...sceneAmbientLight);
    gl.uniform3f(texture_program.u_LightDirection, ...sceneDirectionLight);

    // get all model objects and set the vertex information
    const solid_objects = [];
    for (let object_info of ObjectList) {
        solid_objects.push(getSolidObject(gl, object_info, solid_program));
    }

    // get all textured objects and set the vertex information
    const box = getTexturedObject(gl, boxRes, texture_program);
    const floor = getTexturedObject(gl, floorRes, texture_program);
    if (!box || !floor) {
        return;
    }
    const textured_objects = [box, floor];

    // set the clear color and enable the depth test
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.85, 0.85, 0.85, 1.0);

    // load resource async
    const waitResourceLoad = () => {
        setTimeout(() => {
            if (totalResource > 0) {
                // there's some resources to be loaded, continue wait
                waitResourceLoad();
            } else {
                // load finish, render
                console.log('all resources loaded success');
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                renderObjects(gl, solid_program, solid_objects, texture_program, textured_objects);
                setKeyboardEventHandler(gl, solid_program, solid_objects, texture_program, textured_objects);
            }
        }, 50);
    };

    // wait resource load
    waitResourceLoad();
}

function setKeyboardEventHandler(gl, solid_program, solid_objects, texture_program, textured_objects) {
    // if pressing.key is true, then key is pressed
    const pressing = {
        w: false, a: false, s: false, d: false,
        i: false, j: false, k: false, l: false,
        f: false,
    };

    document.addEventListener("keyup", ev => {
        if (pressing.hasOwnProperty(ev.key)) {
            pressing[ev.key] = false;
        }
    });

    let mipmapOn = false;
    document.addEventListener("keydown", ev => {
        if (pressing.hasOwnProperty(ev.key.toLowerCase())) {
            pressing[ev.key.toLowerCase()] = true;
        }
        if (ev.key.toLowerCase() === "m") {
            console.log('mipmapOn: ' + mipmapOn);
            if (mipmapOn) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            }
            mipmapOn = !mipmapOn;
        }
    });

    const animate = (lastTime) => {
        requestAnimationFrame(() => {
            let now = Date.now();
            const elapsed = (now - lastTime) / 1000;

            let someKeyPressed = false;
            for (let key in pressing) {
                if (pressing[key]) {
                    someKeyPressed = true;
                    break;
                }
            }

            if (!someKeyPressed) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(solid_program);
                gl.uniform3f(solid_program.u_PointLightColor, 0.0, 0.0, 0.0);
                gl.useProgram(texture_program);
                gl.uniform3f(texture_program.u_PointLightColor, 0.0, 0.0, 0.0);

                // do animation
                animation(textured_objects, solid_objects, elapsed);
                renderObjects(gl, solid_program, solid_objects, texture_program, textured_objects);
                animate(now);
                return;
            }

            // assign point light color
            if (pressing.f) {
                // open point light
                gl.useProgram(solid_program);
                gl.uniform3f(solid_program.u_PointLightColor, ...scenePointLightColor);
                gl.useProgram(texture_program);
                gl.uniform3f(texture_program.u_PointLightColor, ...scenePointLightColor);
            } else {
                // close point light
                gl.useProgram(solid_program);
                gl.uniform3f(solid_program.u_PointLightColor, 0.0, 0.0, 0.0);
                gl.useProgram(texture_program);
                gl.uniform3f(texture_program.u_PointLightColor, 0.0, 0.0, 0.0);
            }

            // move and rotate camera
            moveAndRotateCamera(camera, elapsed, pressing);

            // render
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            // do animation
            animation(textured_objects, solid_objects, elapsed);
            renderObjects(gl, solid_program, solid_objects, texture_program, textured_objects);

            // continue monitor
            animate(now);
        });
    };

    animate(Date.now());
}

// animation
function animation(textured_objects, solid_objects, elapsed) {
    // box rotate
    textured_objects[0].transform.rotate(elapsed * 36, 0.0, 1.0, 0.0);
    // star rotate
    solid_objects[0].transform.rotate(elapsed * 108, 0.0, 0.0, 1.0);
    // bird rotate
    bird_rotation += 10 / 3;
    let model_matrix = solid_objects[1].transform
    model_matrix.translate(0.01, Math.sin(bird_rotation / 30) / 100, 0);
    model_matrix.rotate(10 / 3, 0, 1, 0);
    model_matrix.setInverseOf(model_matrix).transpose();
    // moon rotate
    solid_objects[3].transform.rotate(elapsed * 108, 0.0, 0.0, 1.0);
}
