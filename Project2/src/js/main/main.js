/* For animation, WebGL and event */
let show_border = true;
let show_animation = false;
let curr_angle = 0.0;
let curr_scale = STRETCH_MAX;

let gl = null;
let n = 0;
let points = [];
let polygons = [];

let selected_index = -1;
let offsetX = 0;
let offsetY = 0;
let curr_canvas_coordinates = new Array(3);

/**
 * Main function
 */
function main() {
    // Initialize all the points and polygons
    let canvas = initFromConfig(points, polygons);

    // Initialize webgl context and shaders
    gl = getWebGLContext(canvas);
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    // Write the positions of vertices to a vertex shader
    n = initVertexBuffers(gl, polygons, show_border);

    // Specify the color for clearing <canvas> and draw the <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    draw(gl, n, curr_angle, curr_scale, show_border)

    window.onkeypress = function (event) {
        switch (event.key) {
            // Show Border
            case 'b':
                show_border = !show_border
                n = initVertexBuffers(gl, polygons, show_border);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                draw(gl, n, curr_angle, curr_scale, show_border);
                break;
            // Editing mode
            case 'e':
                show_animation = false;
                curr_angle = 0.0;
                curr_scale = STRETCH_MAX;
                draw(gl, n, curr_angle, curr_scale, show_border);
                break;
            // Show animation
            case 't':
                if (show_animation) {
                    show_animation = false;
                } else {
                    g_last = Date.now();
                    show_animation = true;
                    tick();
                }
                break;
        }
    }

    canvas.onmousedown = function (event) {
        if (!show_animation) {
            for (let i = 0; i < points.length; i++) {
                if (points[i].getDistance(event.x, event.y, curr_angle, curr_scale) <= 20) {
                    selected_index = i;
                    let current_canvas_coordinates = points[i].getCurrentCanvasCoordinates(curr_angle, curr_scale);
                    offsetX = current_canvas_coordinates[0] - event.x;
                    offsetY = current_canvas_coordinates[1] - event.y;
                    return;
                }
            }
            selected_index = -1;
        }
    }

    canvas.onmousemove = function (event) {
        if (!show_animation && selected_index !== -1) {
            curr_canvas_coordinates[0] = event.x + offsetX;
            curr_canvas_coordinates[1] = event.y + offsetY;
            curr_canvas_coordinates[2] = 0;

            points[selected_index].setOriginalCanvasCoordinates(curr_canvas_coordinates, curr_angle, curr_scale);
            n = initVertexBuffers(gl, polygons, show_border);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            draw(gl, n, curr_angle, curr_scale, show_border);
        }
    }

    canvas.onmouseup = function () {
        selected_index = -1;
    }
}

/**
 * Animation function
 */
function tick() {
    if (show_animation) {
        timeElapsed();
        // update the angle degree and the scale number, and draw the <canvas>
        curr_angle = rotate(curr_angle);
        curr_scale = stretch(curr_scale);
        draw(gl, n, curr_angle, curr_scale, show_border);
        // request the browser to call tick again
        requestAnimationFrame(tick);
    }
}

/**
 * Call main function
 */
window.onload = function () {
    main();
}
