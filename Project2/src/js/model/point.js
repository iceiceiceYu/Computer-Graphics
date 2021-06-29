const half_maxX = canvasSize["maxX"] / 2;
const half_maxY = canvasSize["maxY"] / 2;

/**
 * Point class
 */
class Point {
    /**
     * @param canvas_coordinates {number[]}: origin canvas coordinates in config.js
     * @param color {number[]}: rgb color array of this point
     */
    constructor(canvas_coordinates, color) {
        this.canvas_coordinates = canvas_coordinates;
        this.webgl_coordinates = new Array(3);
        this.color = color;
        this.setWebglCoordinates();
    }

    get x() {
        return this.webgl_coordinates[0];
    }

    get y() {
        return this.webgl_coordinates[1];
    }

    get z() {
        return this.webgl_coordinates[2];
    }

    /**
     * Change canvas coordinates into webgl coordinates
     */
    setWebglCoordinates() {
        let stageX = this.canvas_coordinates[0] - half_maxX;
        let stageY = half_maxY - this.canvas_coordinates[1];

        this.webgl_coordinates[0] = stageX / half_maxX;
        this.webgl_coordinates[1] = stageY / half_maxY;
        this.webgl_coordinates[2] = 0;
    }

    /**
     * Set the original coordinates before rotating and scaling
     * @param current_canvas_coordinates {number[]}: coordinates after rotating and scaling
     * @param angle {number}: current rotating angle
     * @param scale {number}: current scale
     */
    setOriginalCanvasCoordinates(current_canvas_coordinates, angle, scale) {
        let radian = angle * Math.PI / 180.0;
        let canvasX = current_canvas_coordinates[0] - half_maxX;
        let canvasY = half_maxY - current_canvas_coordinates[1];

        this.canvas_coordinates[0] = half_maxX + (canvasX * Math.cos(radian) - canvasY * Math.sin(radian)) / scale;
        this.canvas_coordinates[1] = half_maxY - (canvasX * Math.sin(radian) + canvasY * Math.cos(radian)) / scale;
        this.canvas_coordinates[2] = current_canvas_coordinates[2];
        this.setWebglCoordinates();
    }

    /**
     * Get the current canvas coordinates
     * @param angle {number}: current rotating angle
     * @param scale {number}: current scale
     * @returns {number[]}
     */
    getCurrentCanvasCoordinates(angle, scale) {
        let radian = angle * Math.PI / 180.0;
        let canvasX = this.canvas_coordinates[0] - half_maxX;
        let canvasY = half_maxY - this.canvas_coordinates[1];
        let current_canvas_coordinates = new Array(3);

        current_canvas_coordinates[0] = half_maxX + (canvasX * Math.cos(radian) - canvasY * Math.sin(radian)) * scale;
        current_canvas_coordinates[1] = half_maxY - (canvasX * Math.sin(radian) + canvasY * Math.cos(radian)) * scale;
        current_canvas_coordinates[2] = this.z;
        return current_canvas_coordinates;
    }

    /**
     * Get the distance between the mouse click position and point position
     * @param mouseX {number}: x coordinate of mouse click position using canvas coordinate system
     * @param mouseY {number}: y coordinate of mouse click position using canvas coordinate system
     * @param angle {number}: current rotating angle
     * @param scale {number}: current scale
     * @returns {number}
     */
    getDistance(mouseX, mouseY, angle, scale) {
        let current_canvas_coordinates = this.getCurrentCanvasCoordinates(angle, scale);
        return Math.sqrt(Math.pow(current_canvas_coordinates[0] - mouseX, 2) + Math.pow(current_canvas_coordinates[1] - mouseY, 2));
    }
}
