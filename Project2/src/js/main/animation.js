// Last time that tick was called
let g_last = Date.now();
// Elapsed time since g_last
let elapsed = 0;

/**
 * Calculate the elapsed time and update g_last
 */
function timeElapsed() {
    let now = Date.now();
    elapsed = now - g_last;
    g_last = now;
}

// Rotate step (degree per second)
const ROTATE_STEP = 45.0;

/**
 * Calculate the new angle
 * @param angle {number}: current angle
 * @returns {number}
 */
function rotate(angle) {
    let new_angle = angle + (ROTATE_STEP * elapsed) / 1000.0;
    return new_angle % 360;
}

// Stretch step (scale per second)
const STRETCH_STEP = 0.2;
const STRETCH_MAX = 1.0;
const STRETCH_MIN = 0.2;
// Stretch cycle (millisecond)
const STRETCH_CYCLE = (STRETCH_MAX - STRETCH_MIN) / STRETCH_STEP * 1000.0
// -1 indicates getting smaller and 1 indicates getting bigger
let stretch_way = -1;

/**
 * Calculate the new scale
 * @param scale {number}: current scale
 * @returns {Number}
 */
function stretch(scale) {
    while (elapsed > STRETCH_CYCLE) {
        elapsed -= STRETCH_CYCLE
    }
    let new_scale = scale + stretch_way * (STRETCH_STEP * elapsed) / 1000.0

    // Transfer from getting smaller to getting bigger, or from getting bigger to getting smaller
    if (new_scale < STRETCH_MIN) {
        new_scale = 2 * STRETCH_MIN - new_scale
        // new_scale = STRETCH_MIN
        stretch_way = 1
    } else if (new_scale > STRETCH_MAX) {
        new_scale = 2 * STRETCH_MAX - new_scale
        // new_scale = STRETCH_MAX
        stretch_way = -1
    }
    return new_scale
}
