let mouseX, mouseY;

/**
 * the function is invoked when the mouse is up
 * reset the variable to -1
 * 鼠标松开事件
 */
function onMouseUp() {
    selected_vertex = -1;
}

/**
 * the function is invoked when the mouse is down
 * set the selected vertex to change its position
 * 鼠标点击事件
 */
function onMouseDown() {
    for (let i = 0; i < vertex_pos.length; i++) {
        if (Math.abs(mouseX - vertex_pos[i][0]) < circle_radius && Math.abs(mouseY - vertex_pos[i][1]) < circle_radius) {
            selected_vertex = i;
            break;
        }
    }
}

/**
 * the function is invoked when the mouse is moving
 * @param e: mouse event
 * 鼠标移动事件
 */
function onMouseMove(e) {
    // record the mouse's position
    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    } else if (e.layerX) { // for different browser
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    // set the mouse's position to the vertex, and refresh the canvas
    if (selected_vertex !== -1) {
        vertex_pos[selected_vertex][0] = mouseX;
        vertex_pos[selected_vertex][1] = mouseY;
        refresh(cxt);
    }
}
