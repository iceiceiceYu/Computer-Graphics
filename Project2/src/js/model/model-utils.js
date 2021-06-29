/**
 * @param polygons {Polygon[]}
 * @param show_border {boolean}
 */
function getVerticesArray(polygons, show_border) {
    let vertices_array = []

    // add points of all the polygons
    for (let polygon of polygons) {
        addPolygon(vertices_array, polygon);
    }

    // add points of all the borders
    if (show_border) {
        for (let polygon of polygons) {
            addPolygonLine(vertices_array, polygon);
        }
    }
    return vertices_array;
}

/**
 * Add points of a polygon
 * @param vertices_array {number[]}: maintain the point position and color
 * @param polygon {Polygon}
 */
function addPolygon(vertices_array, polygon) {
    addPoint(vertices_array, polygon.triangle1.point1, false);
    addPoint(vertices_array, polygon.triangle1.point2, false);
    addPoint(vertices_array, polygon.triangle1.point3, false);
    addPoint(vertices_array, polygon.triangle2.point1, false);
    addPoint(vertices_array, polygon.triangle2.point2, false);
    addPoint(vertices_array, polygon.triangle2.point3, false);
}

/**
 * Add points of a polygon border
 * @param vertices_array {number[]}: maintain the point position and color
 * @param polygon {Polygon}
 */
function addPolygonLine(vertices_array, polygon) {
    addPoint(vertices_array, polygon.point1, true);
    addPoint(vertices_array, polygon.point2, true);
    addPoint(vertices_array, polygon.point3, true);
    addPoint(vertices_array, polygon.point4, true);
    addPoint(vertices_array, polygon.point1, true);
    addPoint(vertices_array, polygon.point3, true);
}

/**
 * Add position and color of a point
 * @param vertices_array {number[]}: maintain the point position and color
 * @param point {Point}
 * @param show_border {boolean}
 */
function addPoint(vertices_array, point, show_border) {
    vertices_array.push(point.x);
    vertices_array.push(point.y);
    if (!show_border) {
        // use color of the point when drawing triangles
        vertices_array.push(point.color[0] / 255.0)
        vertices_array.push(point.color[1] / 255.0)
        vertices_array.push(point.color[2] / 255.0)
    } else {
        // use default red color when drawing borders
        vertices_array.push(1.0)
        vertices_array.push(0.0)
        vertices_array.push(0.0)
    }
}
