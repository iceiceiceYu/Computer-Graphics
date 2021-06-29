// global variable
const circle_radius = 10
let selected_vertex = -1;
let canvas, cxt;

// when the whole page finishes loading, run this code
window.onload = function () {
    canvas = document.getElementById("myCanvas");
    cxt = canvas.getContext("2d");

    // set the size of the canvas
    canvas.width = canvasSize.maxX;
    canvas.height = canvasSize.maxY;

    // 将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题，具体原理详见project文档
    cxt.translate(0.5, 0.5);

    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    refresh(cxt);
}
