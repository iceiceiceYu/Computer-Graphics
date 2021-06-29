/**
 * the function is used to draw a point on canvas
 * @param cxt: a 2d context from canvas
 * @param x: x coordinate of the point
 * @param y: y coordinate of the point
 * @param color: the color of the point
 */
function drawPoint(cxt, x, y, color) {
    cxt.beginPath();
    cxt.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    cxt.moveTo(x, y);
    cxt.lineTo(x + 1, y + 1);
    cxt.stroke();
}

/**
 * the function is used to draw a line from (x1, y1) to (x2, y2) on canvas
 * @param cxt: a 2d context from canvas
 * @param x1: x coordinate of point1
 * @param y1: y coordinate of point1
 * @param x2: x coordinate of point2
 * @param y2: y coordinate of point2
 * @param color: the color of the line
 */
function drawLine(cxt, x1, y1, x2, y2, color) {
    cxt.beginPath();
    cxt.strokeStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + 255 + ")";
    cxt.lineWidth = 2;
    cxt.moveTo(x1, y1);
    cxt.lineTo(x2, y2);
    cxt.stroke();
}

/**
 * the function is used to draw the vertex circle of the polygon on canvas
 * @param cxt: a 2d context from canvas
 * @param circle_radius: the radius of the circle
 */
function drawVertexCircle(cxt, circle_radius) {
    for (let i = 0; i < vertex_pos.length; i++) {
        let x = vertex_pos[i][0];
        let y = vertex_pos[i][1];
        cxt.beginPath();
        for (let alpha = 0; alpha < 2 * Math.PI; alpha += 0.01 * Math.PI) {
            x = vertex_pos[i][0] + circle_radius * Math.cos(alpha);
            y = vertex_pos[i][1] + circle_radius * Math.sin(alpha);
            // 画红色的半径线
            drawLine(cxt, vertex_pos[i][0], vertex_pos[i][1], x, y, [255, 0, 0]);
            // 画黑色的边缘线
            drawLine(cxt, x, y, x + Math.cos(alpha), y + Math.sin(alpha), [0, 0, 0]);
        }
    }
}

/**
 * the function is used to draw a polygon on canvas
 * @param cxt: a 2d context from canvas
 * @param polygon: the polygon to be drawn
 */
function drawPolygon(cxt, polygon) {
    let i, j;
    let p1x, p2x;

    // the vertex array is used to store the position of the vertex in polygon.
    const vertex_position = [];
    for (i = 0; i < polygon.length; i++) {
        vertex_position[i] = vertex_pos[polygon[i]];
    }

    // the polygon's color is the first vertex's color.
    const color = vertex_color[polygon[0]];

    // minY is the minimal y coordinate of the vertexes.
    // maxY is the maximal y coordinate of the vertexes.
    let minY = vertex_position[0][1];
    let maxY = minY;
    for (i = 1; i < polygon.length; i++) {
        if (vertex_position[i][1] < minY) {
            minY = vertex_position[i][1];
            continue;
        }
        if (vertex_position[i][1] > maxY) {
            maxY = vertex_position[i][1];
        }
    }

    // construct new edge table and active edge table
    const scan_count = maxY - minY + 1;
    const new_edge_table = new Array(scan_count);
    const active_edge_table = new Array(scan_count);
    for (i = 0; i < scan_count; i++) {
        new_edge_table[i] = [];
        active_edge_table[i] = [];
    }

    // fill in the new edge table
    for (i = 0; i < polygon.length; i++) {
        const p1y = vertex_position[i][1];
        const p2y = vertex_position[(i + 1) % polygon.length][1];
        if (p1y < p2y) {
            p1x = vertex_position[i][0];
            p2x = vertex_position[(i + 1) % polygon.length][0];
            new_edge_table[p1y - minY].push({
                x: p1x,
                deltaX: ((p2x - p1x) / (p2y - p1y)),
                endY: p2y
            });
        } else if (p1y > p2y) {
            p1x = vertex_position[i][0];
            p2x = vertex_position[(i + 1) % polygon.length][0];
            new_edge_table[p2y - minY].push({
                x: p2x,
                deltaX: ((p2x - p1x) / (p2y - p1y)),
                endY: p1y
            });
        }
    }

    // fill in the active edge table
    for (i = 0; i < scan_count; i++) {
        for (j = 0; j < new_edge_table[i].length; j++) {
            let x_position_of_intersection = new_edge_table[i][j].x;
            for (let k = i; k < new_edge_table[i][j].endY - minY; k++) {
                active_edge_table[k].push(Math.round(x_position_of_intersection));
                x_position_of_intersection += new_edge_table[i][j].deltaX;
            }
        }
    }

    // sort x_position_of_intersection of each scan line and fill the polygon pairwise
    for (i = 0; i < scan_count; i++) {
        // ascending order
        active_edge_table[i].sort(function (a, b) {
            return a - b;
        });
        for (j = 0; j < active_edge_table[i].length; j += 2) {
            drawLine(cxt, active_edge_table[i][j], i + minY, active_edge_table[i][j + 1], i + minY, color);
        }
    }
}

/**
 * the function is used to refresh the canvas page
 * @param cxt: a 2d context from canvas
 */
function refresh(cxt) {
    let i;

    // clear the canvas
    cxt.clearRect(0, 0, canvas.width, canvas.height);

    // distinguish new polygon from old polygon
    let polygon_to_draw = polygon;
    if (selected_vertex !== -1) {
        const new_polygon = [];
        const old_polygon = [];
        for (i = 0; i < polygon.length; i++) {
            if (polygon[i].indexOf(selected_vertex) > -1) {
                new_polygon.push(polygon[i]);
            } else {
                old_polygon.push(polygon[i]);
            }
        }
        polygon_to_draw = old_polygon.concat(new_polygon);
    }

    // draw each polygon respectively
    for (i = 0; i < polygon_to_draw.length; i++) {
        drawPolygon(cxt, polygon_to_draw[i]);
    }

    // draw the vertex circle
    drawVertexCircle(cxt, circle_radius);
}
