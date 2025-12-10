// canvas.js

let canvas = null;
let ctx = null;
let canvasWidth = 0;
let canvasHeight = 0;

function measure(containerId = "game-container") {
    const container = document.getElementById(containerId);
    const w = container ? container.offsetWidth : window.innerWidth;
    const h = container ? container.offsetHeight : window.innerHeight;
    return { w, h, container };
}

export function initCanvas(canvasId = "gameCanvas", containerId = "game-container") {
    canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error(`Canvas not found: #${canvasId}`);

    ctx = canvas.getContext("2d");

    const { w, h } = measure(containerId);
    canvasWidth = w;
    canvasHeight = h;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    return { canvas, ctx, width: canvasWidth, height: canvasHeight };
}

export function resizeCanvas(containerId = "game-container") {
    if (!canvas) return;

    const { w, h } = measure(containerId);
    canvasWidth = w;
    canvasHeight = h;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

export function getCanvasSize() {
    return {
        width: canvasWidth,
        height: canvasHeight,
        canvas,
        ctx
    };
}

export { canvas, ctx };
