/**
 * Polygon class
 */
class Polygon {
    /**
     * @param point1 {Point}
     * @param point2 {Point}
     * @param point3 {Point}
     * @param point4 {Point}
     */
    constructor(point1, point2, point3, point4) {
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.point4 = point4;
        this.triangle1 = new Triangle(point2, point1, point3)
        this.triangle2 = new Triangle(point4, point1, point3)
    }
}
